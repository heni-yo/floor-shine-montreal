import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const HISTORY_MANIFEST = "/history.webmanifest";
const DEFAULT_MANIFEST = "/site.webmanifest";

/**
 * Sur /history123 : manifeste PWA dédié, méta iOS, enregistrement SW minimal pour installation (Chrome/Android).
 */
export function useHistoryPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useLayoutEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const created = !link;
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    const previousHref = link.getAttribute("href");
    link.setAttribute("href", HISTORY_MANIFEST);

    const addedMeta: HTMLMetaElement[] = [];
    const pushMeta = (name: string, content: string) => {
      const m = document.createElement("meta");
      m.setAttribute("name", name);
      m.setAttribute("content", content);
      document.head.appendChild(m);
      addedMeta.push(m);
    };
    pushMeta("apple-mobile-web-app-capable", "yes");
    pushMeta("mobile-web-app-capable", "yes");
    pushMeta("apple-mobile-web-app-title", "Historique");
    pushMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
    pushMeta("theme-color", "#0f172a");

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/pwa-sw.js", { scope: "/" }).catch(() => {
        /* installation toujours possible sans SW sur certains navigateurs */
      });
    }

    return () => {
      if (created) {
        link?.remove();
      } else if (previousHref) {
        link?.setAttribute("href", previousHref);
      } else {
        link?.setAttribute("href", DEFAULT_MANIFEST);
      }
      addedMeta.forEach((m) => m.remove());
    };
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const runInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return { deferredPrompt, runInstall };
}
