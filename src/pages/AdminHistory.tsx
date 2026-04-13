import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Trash2, Download, Eye, FileSpreadsheet, Image, RefreshCw, Smartphone, ChevronDown, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHistoryPwa } from "@/hooks/useHistoryPwa";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { adminFetch, clearStoredAdminToken, getStoredAdminToken, setStoredAdminToken } from "@/lib/adminSession";
import { AdminProtectedImage } from "@/components/AdminProtectedImage";

interface Submission {
  submissionId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  photos: string[];
}

function fileApiPath(submissionId: string, filename: string): string {
  return `/api/admin/submissions/${encodeURIComponent(submissionId)}/file/${encodeURIComponent(filename)}`;
}

export default function AdminHistory() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [loginError, setLoginError] = useState("");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewFiles, setViewFiles] = useState<{ id: string; files: string[] } | null>(null);
  const [lightbox, setLightbox] = useState<{ submissionId: string; filename: string } | null>(null);

  const { toast } = useToast();
  const { deferredPrompt, runInstall } = useHistoryPwa();
  const isIOS = useMemo(
    () => typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent),
    [],
  );

  const fetchSubmissions = useCallback(async () => {
    if (!getStoredAdminToken()) return;
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/submissions");
      if (res.status === 401) {
        clearStoredAdminToken();
        setAuthed(false);
        setSubmissions([]);
        toast({ title: "Session expirée", description: "Reconnectez-vous avec le jeton administrateur.", variant: "destructive" });
      } else if (res.ok) {
        setSubmissions(await res.json());
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const t = getStoredAdminToken();
    if (!t) {
      setSessionChecked(true);
      return;
    }
    (async () => {
      const res = await adminFetch("/api/admin/submissions");
      if (res.ok) {
        setSubmissions(await res.json());
        setAuthed(true);
      } else {
        clearStoredAdminToken();
      }
      setSessionChecked(true);
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const trimmed = loginToken.trim();
    if (!trimmed) {
      setLoginError("Entrez le jeton.");
      return;
    }
    setStoredAdminToken(trimmed);
    const res = await adminFetch("/api/admin/submissions");
    if (!res.ok) {
      clearStoredAdminToken();
      setLoginError("Jeton invalide ou accès refusé.");
      return;
    }
    setSubmissions(await res.json());
    setAuthed(true);
    setLoginToken("");
  };

  const handleLogout = () => {
    clearStoredAdminToken();
    setAuthed(false);
    setSubmissions([]);
    setSearch("");
  };

  const downloadFile = async (submissionId: string, filename: string) => {
    const path = fileApiPath(submissionId, filename);
    try {
      const res = await adminFetch(path);
      if (!res.ok) {
        toast({ title: "Téléchargement impossible", variant: "destructive" });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    }
  };

  const openFiles = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/submissions/${encodeURIComponent(id)}/files`);
      if (res.ok) {
        const files: string[] = await res.json();
        setViewFiles({ id, files });
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminFetch(`/api/admin/submissions/${encodeURIComponent(deleteTarget)}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.submissionId !== deleteTarget));
        toast({ title: "Supprimé", description: `${deleteTarget} a été supprimé.` });
      } else {
        toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur réseau.", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter((s) =>
      s.submissionId.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  }, [submissions, search]);

  const isImage = (f: string) => /\.(jpe?g|png|gif|webp)$/i.test(f);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <p className="text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Accès administrateur</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Saisissez le jeton configuré sur le serveur (<code className="text-xs bg-muted px-1 rounded">ADMIN_API_TOKEN</code>), jamais partagé publiquement.
          </p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <Input
              type="password"
              autoComplete="off"
              placeholder="Jeton d’accès"
              value={loginToken}
              onChange={(e) => { setLoginToken(e.target.value); setLoginError(""); }}
            />
            {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
            <Button type="submit" className="w-full">Se connecter</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historique des soumissions</h1>
            <p className="text-muted-foreground text-sm mt-1">{submissions.length} soumission{submissions.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void fetchSubmissions()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </div>

        <Collapsible className="mb-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 rounded-lg transition-colors [&[data-state=open]>svg]:rotate-180">
            <span className="flex items-center gap-2 font-medium text-sm">
              <Smartphone className="h-4 w-4 shrink-0 text-primary" />
              Installer cette page sur votre téléphone
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 pt-0 space-y-3 text-sm text-muted-foreground border-t">
            <p className="pt-3">
              Ajoutez l’historique des soumissions comme une application : icône sur l’écran d’accueil, affichage plein écran, retour rapide sans passer par le site public.
            </p>
            {deferredPrompt ? (
              <Button type="button" variant="default" size="sm" className="w-full sm:w-auto" onClick={() => void runInstall()}>
                Ajouter à l’écran d’accueil
              </Button>
            ) : isIOS ? (
              <ol className="list-decimal list-inside space-y-1.5 text-foreground/90">
                <li>Ouvrez cette page dans <strong>Safari</strong>.</li>
                <li>Appuyez sur le bouton <strong>Partager</strong> <span className="whitespace-nowrap">(□↑)</span>.</li>
                <li>Choisissez <strong>Sur l’écran d’accueil</strong>, puis <strong>Ajouter</strong>.</li>
              </ol>
            ) : (
              <p className="text-xs">
                Sur Chrome ou Edge (Android) : menu du navigateur → <strong className="text-foreground">Installer l’application</strong> ou <strong className="text-foreground">Ajouter à l’écran d’accueil</strong>. Si le bouton bleu n’apparaît pas, rechargez la page après quelques secondes.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, courriel, téléphone, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Courriel</TableHead>
                <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                <TableHead className="hidden lg:table-cell">Ville</TableHead>
                <TableHead className="hidden sm:table-cell">Photos</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {loading ? "Chargement…" : "Aucune soumission trouvée."}
                  </TableCell>
                </TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.submissionId}>
                  <TableCell className="font-mono text-xs">{s.submissionId}</TableCell>
                  <TableCell className="text-sm">{new Date(s.createdAt).toLocaleDateString("fr-CA")}</TableCell>
                  <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.phone}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{s.city}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{s.photos?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Voir les fichiers" onClick={() => void openFiles(s.submissionId)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Télécharger Excel" onClick={() => void downloadFile(s.submissionId, "quote.xlsx")}>
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Supprimer" onClick={() => setDeleteTarget(s.submissionId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!viewFiles} onOpenChange={() => setViewFiles(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fichiers — {viewFiles?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewFiles?.files.filter((f) => !isImage(f)).map((f) => (
              <div key={f} className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{f}</span>
                </div>
                <Button variant="outline" size="sm" type="button" onClick={() => viewFiles && void downloadFile(viewFiles.id, f)}>
                  <Download className="h-4 w-4 mr-1" /> Télécharger
                </Button>
              </div>
            ))}
            {viewFiles?.files.filter(isImage).length ? (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Image className="h-4 w-4" /> Photos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {viewFiles.files.filter(isImage).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => viewFiles && setLightbox({ submissionId: viewFiles.id, filename: f })}
                      className="rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all text-left"
                    >
                      <AdminProtectedImage
                        apiPath={fileApiPath(viewFiles.id, f)}
                        alt={f}
                        className="w-full h-32 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2" aria-describedby={undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>Aperçu photo</DialogTitle>
          </DialogHeader>
          {lightbox ? (
            <AdminProtectedImage
              apiPath={fileApiPath(lightbox.submissionId, lightbox.filename)}
              alt="Photo"
              className="w-full h-auto rounded"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette soumission ?</AlertDialogTitle>
            <AlertDialogDescription>
              La soumission <strong>{deleteTarget}</strong> et ses fichiers seront définitivement supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
