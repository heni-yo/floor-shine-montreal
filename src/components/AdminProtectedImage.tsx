import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminSession";
import { cn } from "@/lib/utils";

type Props = {
  apiPath: string;
  alt: string;
  className?: string;
};

/** Image servie par l’API admin (Bearer requis — pas d’en-tête sur &lt;img src&gt; nu). */
export function AdminProtectedImage({ apiPath, alt, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let blobUrl: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch(apiPath);
        if (!res.ok || cancelled) {
          if (!cancelled) setFailed(true);
          return;
        }
        const blob = await res.blob();
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setSrc(blobUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [apiPath]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground text-xs p-2", className)}>
        Échec du chargement
      </div>
    );
  }
  if (!src) {
    return <div className={cn("animate-pulse bg-muted", className)} aria-hidden />;
  }
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
