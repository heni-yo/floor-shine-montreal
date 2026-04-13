import { useState, useEffect, useMemo } from "react";
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
import { Search, Trash2, Download, Eye, FileSpreadsheet, Image, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API = import.meta.env.VITE_API_URL || "";

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

export default function AdminHistory() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [viewFiles, setViewFiles] = useState<{ id: string; files: string[] } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/submissions`);
      if (res.ok) setSubmissions(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

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

  const handleDelete = async () => {
    if (deleteCode !== "2580") {
      setDeleteError("Code invalide. Réessayez.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/admin/submissions/${deleteTarget}?code=2580`, { method: "DELETE" });
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
    setDeleteCode("");
    setDeleteError("");
  };

  const openFiles = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/admin/submissions/${id}/files`);
      if (res.ok) {
        const files: string[] = await res.json();
        setViewFiles({ id, files });
      }
    } catch { /* ignore */ }
  };

  const fileUrl = (id: string, filename: string) => `${API}/api/admin/submissions/${id}/file/${filename}`;

  const isImage = (f: string) => /\.(jpe?g|png|gif|webp)$/i.test(f);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historique des soumissions</h1>
            <p className="text-muted-foreground text-sm mt-1">{submissions.length} soumission{submissions.length !== 1 ? "s" : ""}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, courriel, téléphone, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
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
                      <Button variant="ghost" size="icon" title="Voir les fichiers" onClick={() => openFiles(s.submissionId)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Télécharger Excel" asChild>
                        <a href={fileUrl(s.submissionId, "quote.xlsx")} download>
                          <FileSpreadsheet className="h-4 w-4" />
                        </a>
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

      {/* View Files Dialog */}
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
                <Button variant="outline" size="sm" asChild>
                  <a href={fileUrl(viewFiles.id, f)} download><Download className="h-4 w-4 mr-1" /> Télécharger</a>
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
                    <button key={f} onClick={() => setLightbox(fileUrl(viewFiles.id, f))}
                      className="rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all">
                      <img src={fileUrl(viewFiles.id, f)} alt={f} className="w-full h-32 object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2" aria-describedby={undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>Aperçu photo</DialogTitle>
          </DialogHeader>
          {lightbox && <img src={lightbox} alt="Photo" className="w-full h-auto rounded" />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteCode(""); setDeleteError(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez le code de confirmation pour supprimer <strong>{deleteTarget}</strong>. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-2">
            <Input
              placeholder="Code de confirmation"
              value={deleteCode}
              onChange={(e) => { setDeleteCode(e.target.value); setDeleteError(""); }}
              type="password"
            />
            {deleteError && <p className="text-destructive text-sm mt-2">{deleteError}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
