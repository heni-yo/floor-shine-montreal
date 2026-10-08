'use client';

import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import {
  Search,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  Smartphone,
  ChevronDown,
  ChevronRight,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useHistoryPwa } from '@/hooks/useHistoryPwa';
import {
  adminFetch,
  clearStoredAdminToken,
  getStoredAdminToken,
  readAdminErrorMessage,
  setStoredAdminToken,
} from '@/lib/adminSession';
import { AdminProtectedImage } from '@/components/AdminProtectedImage';

type ServiceKey = 'floor' | 'stairs' | 'repair';

interface Submission {
  submissionId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode?: string;
  services?: Partial<Record<ServiceKey, boolean>>;
  photos: string[];
}

const SERVICE_LABEL: Record<ServiceKey, string> = {
  floor: 'Plancher',
  stairs: 'Escalier',
  repair: 'Réparation',
};
const SERVICE_KEYS: ServiceKey[] = ['floor', 'stairs', 'repair'];

/**
 * Affiché quand l'API répond 503 : aucun ADMIN_API_TOKEN n'est défini sur ce
 * serveur. Cas normal en local, puisque le vrai jeton n'existe que sur Render.
 */
const NO_TOKEN_CONFIGURED =
  'Ce serveur API n’a aucun jeton d’administration configuré (ADMIN_API_TOKEN). En production, il est défini sur Render ; en local, il faut l’ajouter au fichier .env.';

/** Les soumissions sont faites à Montréal ; le navigateur de l'admin peut être ailleurs. */
const TIME_ZONE = 'America/Toronto';

const fileApiPath = (id: string, filename: string) =>
  `/api/admin/submissions/${encodeURIComponent(id)}/file/${encodeURIComponent(filename)}`;

const isImage = (f: string) => /\.(jpe?g|png|gif|webp)$/i.test(f);
const servicesOf = (s: Submission) => SERVICE_KEYS.filter((k) => s.services?.[k]);
const fullName = (s: Submission) => `${s.firstName} ${s.lastName}`.trim();

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-CA', { timeZone: TIME_ZONE, dateStyle: 'medium', timeStyle: 'short' });
}

function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diff)) return '';
  const rtf = new Intl.RelativeTimeFormat('fr-CA', { numeric: 'auto' });
  const minutes = Math.round(diff / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(Math.round(months / 12), 'year');
}

/** Clé « AAAA-MM » dans le fuseau de Montréal. */
const monthKey = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit' }).format(d);

async function fetchBlob(path: string): Promise<Blob | null> {
  const res = await adminFetch(path);
  return res.ok ? res.blob() : null;
}

// ---------------------------------------------------------------------------

function ServiceBadges({ submission }: { submission: Submission }) {
  const services = servicesOf(submission);
  if (!services.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {services.map((k) => (
        <span
          key={k}
          className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground"
        >
          {SERVICE_LABEL[k]}
        </span>
      ))}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function AdminLogin({
  onSubmit,
  error,
  hint,
}: {
  onSubmit: (token: string) => Promise<void>;
  error: string;
  hint: string | null;
}) {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await onSubmit(token);
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm">
        <img src="/logoNav.svg" alt="Talon Plancher" width={1058} height={251} className="mx-auto mb-8 h-12 w-auto" />
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <h1 className="font-serif text-xl font-bold text-foreground">Historique des soumissions</h1>
          <p className="mt-2 text-sm text-muted-foreground">Accès réservé. Saisissez votre jeton d’administration.</p>

          {hint && (
            <div role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {hint}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-3">
            <label htmlFor="admin-token" className="sr-only">
              Jeton d’accès
            </label>
            <Input
              id="admin-token"
              type="password"
              autoComplete="current-password"
              placeholder="Jeton d’accès"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="h-11"
              aria-invalid={!!error}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SubmissionDetails({
  submission,
  onClose,
  onDeleted,
}: {
  submission: Submission | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const { toast } = useToast();
  const [files, setFiles] = useState<string[] | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);

  const id = submission?.submissionId ?? '';

  useEffect(() => {
    if (!submission) return;
    let cancelled = false;
    setFiles(null);
    (async () => {
      try {
        const res = await adminFetch(`/api/admin/submissions/${encodeURIComponent(submission.submissionId)}/files`);
        if (!cancelled) setFiles(res.ok ? await res.json() : []);
      } catch {
        if (!cancelled) setFiles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submission]);

  const download = async (filename: string, saveAs: string) => {
    setOpening(filename);
    const blob = await fetchBlob(fileApiPath(id, filename)).catch(() => null);
    setOpening(null);
    if (!blob) return toast({ title: 'Téléchargement impossible', variant: 'destructive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = saveAs;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /** La fenêtre est ouverte avant le téléchargement, sinon le navigateur la bloquerait. */
  const openPdf = async () => {
    const win = window.open('', '_blank');
    setOpening('quote.pdf');
    const blob = await fetchBlob(fileApiPath(id, 'quote.pdf')).catch(() => null);
    setOpening(null);
    if (!blob) {
      win?.close();
      return toast({ title: 'Impossible d’ouvrir le PDF', variant: 'destructive' });
    }
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    if (win) win.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const remove = async () => {
    if (confirmText.trim() !== id) return;
    setDeleting(true);
    try {
      const q = new URLSearchParams({ confirm: id });
      const res = await adminFetch(`/api/admin/submissions/${encodeURIComponent(id)}?${q}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Soumission supprimée', description: `${id} a été supprimée définitivement.` });
        setConfirmOpen(false);
        onDeleted(id);
      } else {
        toast({ title: 'Suppression impossible', description: await readAdminErrorMessage(res), variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    }
    setDeleting(false);
  };

  const photos = files?.filter(isImage) ?? [];
  const hasPdf = files?.includes('quote.pdf') ?? false;
  const hasExcel = files?.includes('quote.xlsx') ?? false;

  return (
    <>
      <Dialog
        open={!!submission}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
            setConfirmText('');
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
          {submission && (
            <>
              <DialogHeader className="border-b border-border px-6 py-5 text-left">
                <p className="font-mono text-xs text-muted-foreground">{submission.submissionId}</p>
                <DialogTitle className="font-serif text-2xl">{fullName(submission) || 'Sans nom'}</DialogTitle>
                <DialogDescription>
                  Reçue le {formatDateTime(submission.createdAt)} · {relativeTime(submission.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 px-6 py-5">
                {/* Coordonnées : liens directs pour rappeler le client depuis le téléphone */}
                <section className="grid gap-2 sm:grid-cols-2">
                  <a
                    href={`tel:${submission.phone.replace(/[^\d+]/g, '')}`}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-surface"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="font-medium">{submission.phone}</span>
                  </a>
                  <a
                    href={`mailto:${submission.email}?subject=${encodeURIComponent(`Votre demande de soumission ${submission.submissionId}`)}`}
                    className="flex min-w-0 items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-surface"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="truncate font-medium">{submission.email}</span>
                  </a>
                  <p className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm sm:col-span-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {[submission.city, submission.postalCode?.toUpperCase()].filter(Boolean).join(' · ') || '—'}
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Services</h3>
                  <ServiceBadges submission={submission} />
                </section>

                <section>
                  <h3 className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Documents</h3>
                  {files === null ? (
                    <div className="h-14 animate-pulse rounded-lg bg-muted" aria-hidden />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                        <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                        <span className="flex-1 text-sm font-medium">Soumission (PDF)</span>
                        {hasPdf ? (
                          <span className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => void openPdf()} disabled={!!opening}>
                              <ExternalLink className="h-4 w-4" aria-hidden /> Ouvrir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void download('quote.pdf', `Soumission-${id}.pdf`)}
                              disabled={!!opening}
                            >
                              <Download className="h-4 w-4" aria-hidden /> Télécharger
                            </Button>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Non disponible (soumission antérieure)</span>
                        )}
                      </div>
                      {hasExcel && (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                          <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                          <span className="flex-1 text-sm font-medium">Estimation (Excel)</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void download('quote.xlsx', `Soumission-${id}.xlsx`)}
                            disabled={!!opening}
                          >
                            <Download className="h-4 w-4" aria-hidden /> Télécharger
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="mb-2 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden /> Photos ({files === null ? '…' : photos.length})
                  </h3>
                  {files !== null && photos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune photo jointe.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {photos.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setLightbox(f)}
                          className="overflow-hidden rounded-lg border border-border transition-shadow hover:ring-2 hover:ring-primary"
                          aria-label={`Agrandir ${f}`}
                        >
                          <AdminProtectedImage apiPath={fileApiPath(id, f)} alt="" className="aspect-square w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <section className="border-t border-border pt-5">
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden /> Supprimer cette soumission
                  </Button>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Photo du client</DialogTitle>
          </DialogHeader>
          {lightbox && (
            <AdminProtectedImage apiPath={fileApiPath(id, lightbox)} alt="Photo du client" className="max-h-[80vh] w-full rounded object-contain" />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation : retaper le numéro, comme sur GitHub — impossible de supprimer par mégarde. */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setConfirmText('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">Supprimer {id} ?</AlertDialogTitle>
            <AlertDialogDescription>
              La soumission, son PDF, son fichier Excel et ses photos seront supprimés définitivement. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label htmlFor="delete-confirm" className="text-sm text-foreground">
              Pour confirmer, saisissez <span className="font-mono font-semibold">{id}</span>
            </label>
            <Input
              id="delete-confirm"
              autoComplete="off"
              spellCheck={false}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={id}
              className="font-mono"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => void remove()}
              disabled={confirmText.trim() !== id || deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Supprimer définitivement
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------

export default function AdminHistory() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [apiConfigHint, setApiConfigHint] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceKey | 'all'>('all');
  const [selected, setSelected] = useState<Submission | null>(null);

  const { toast } = useToast();
  const { deferredPrompt, runInstall } = useHistoryPwa();
  const isIOS = useMemo(() => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent), []);

  /** Charge la liste ; renvoie false si le jeton est refusé. */
  const load = useCallback(async (): Promise<Response | null> => {
    try {
      const res = await adminFetch('/api/admin/submissions');
      if (res.ok) setSubmissions(await res.json());
      return res;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!getStoredAdminToken()) {
      setSessionChecked(true);
      return;
    }
    (async () => {
      const res = await load();
      if (res?.ok) setAuthed(true);
      else {
        clearStoredAdminToken();
        if (res?.status === 503) setApiConfigHint(NO_TOKEN_CONFIGURED);
      }
      setSessionChecked(true);
    })();
  }, [load]);

  const handleLogin = async (token: string) => {
    setLoginError('');
    const trimmed = token.trim();
    if (!trimmed) return setLoginError('Entrez le jeton.');
    setStoredAdminToken(trimmed);
    const res = await load();
    if (res?.ok) {
      setApiConfigHint(null);
      setAuthed(true);
      return;
    }
    clearStoredAdminToken();
    if (!res) setLoginError('Serveur injoignable. Réessayez dans un instant.');
    else if (res.status === 401) setLoginError('Jeton invalide.');
    else if (res.status === 429) setLoginError(await readAdminErrorMessage(res));
    // 503 : aucun jeton n'est configuré sur ce serveur API — un seul message, explicite.
    else if (res.status === 503) setApiConfigHint(NO_TOKEN_CONFIGURED);
    else setLoginError(await readAdminErrorMessage(res));
  };

  const refresh = async () => {
    setLoading(true);
    const res = await load();
    setLoading(false);
    if (res?.status === 401) {
      clearStoredAdminToken();
      setAuthed(false);
      setSubmissions([]);
      toast({ title: 'Session expirée', description: 'Reconnectez-vous.', variant: 'destructive' });
    } else if (!res?.ok) {
      toast({ title: 'Actualisation impossible', variant: 'destructive' });
    }
  };

  const logout = () => {
    clearStoredAdminToken();
    setAuthed(false);
    setSubmissions([]);
    setSearch('');
  };

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    const weekAgo = now.getTime() - 7 * 24 * 3600 * 1000;
    return {
      total: submissions.length,
      month: submissions.filter((s) => monthKey(new Date(s.createdAt)) === thisMonth).length,
      week: submissions.filter((s) => new Date(s.createdAt).getTime() >= weekAgo).length,
      withPhotos: submissions.filter((s) => (s.photos?.length ?? 0) > 0).length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      if (serviceFilter !== 'all' && !s.services?.[serviceFilter]) return false;
      if (!q) return true;
      return [s.submissionId, fullName(s), s.email, s.phone, s.city, s.postalCode ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [submissions, search, serviceFilter]);

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Chargement" />
      </div>
    );
  }

  if (!authed) return <AdminLogin onSubmit={handleLogin} error={loginError} hint={apiConfigHint} />;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <img src="/logoNav.svg" alt="Talon Plancher" width={1058} height={251} className="h-9 w-auto" />
            <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
            <h1 className="hidden font-sans text-sm font-semibold text-foreground sm:block">Historique des soumissions</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden /> Actualiser
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-5 font-serif text-2xl font-bold text-foreground sm:hidden">Soumissions</h1>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Total" value={stats.total} />
          <Stat label="Ce mois-ci" value={stats.month} />
          <Stat label="7 derniers jours" value={stats.week} />
          <Stat label="Avec photos" value={stats.withPhotos} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Nom, courriel, téléphone, ville, numéro…"
              aria-label="Rechercher une soumission"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 bg-background pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par service">
            {(['all', ...SERVICE_KEYS] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setServiceFilter(key)}
                aria-pressed={serviceFilter === key}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  serviceFilter === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {key === 'all' ? 'Tous' : SERVICE_LABEL[key]}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} soumission{filtered.length > 1 ? 's' : ''}
          {filtered.length !== submissions.length ? ` sur ${submissions.length}` : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 font-medium text-foreground">
              {submissions.length ? 'Aucun résultat pour ces critères.' : 'Aucune soumission pour l’instant.'}
            </p>
          </div>
        ) : (
          <>
            {/* Ordinateur : tableau */}
            <div className="mt-3 hidden overflow-hidden rounded-xl border border-border bg-background md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Services</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Reçue</th>
                    <th className="px-4 py-3 text-right">Photos</th>
                    <th className="w-10 px-4 py-3" aria-label="Ouvrir" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s) => (
                    <tr
                      key={s.submissionId}
                      onClick={() => setSelected(s)}
                      className="cursor-pointer transition-colors hover:bg-surface"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(s);
                          }}
                          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          <span className="block font-medium text-foreground">{fullName(s) || 'Sans nom'}</span>
                          <span className="font-mono text-xs text-muted-foreground">{s.submissionId}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <ServiceBadges submission={s} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.city}</td>
                      <td className="px-4 py-3">
                        <span className="block text-foreground">{formatDateTime(s.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{relativeTime(s.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{s.photos?.length ?? 0}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Téléphone : cartes */}
            <ul className="mt-3 space-y-2 md:hidden">
              {filtered.map((s) => (
                <li key={s.submissionId}>
                  <button
                    type="button"
                    onClick={() => setSelected(s)}
                    className="w-full rounded-xl border border-border bg-background p-4 text-left transition-colors active:bg-surface"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">{fullName(s) || 'Sans nom'}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.city} · {relativeTime(s.createdAt)}
                        </span>
                      </span>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    </span>
                    <span className="mt-3 flex items-center justify-between gap-2">
                      <ServiceBadges submission={s} />
                      <span className="font-mono text-[11px] text-muted-foreground">{s.submissionId}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <Collapsible className="mt-10 rounded-xl border border-border bg-background">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-surface [&[data-state=open]>svg]:rotate-180">
            <span className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" aria-hidden />
              Installer cette page sur votre téléphone
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" aria-hidden />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 border-t border-border px-4 pb-4 pt-3 text-sm text-muted-foreground">
            <p>Ajoutez l’historique à votre écran d’accueil pour l’ouvrir comme une application.</p>
            {deferredPrompt ? (
              <Button type="button" size="sm" onClick={() => void runInstall()}>
                Ajouter à l’écran d’accueil
              </Button>
            ) : isIOS ? (
              <ol className="list-inside list-decimal space-y-1 text-foreground/90">
                <li>Ouvrez cette page dans <strong>Safari</strong>.</li>
                <li>Touchez <strong>Partager</strong>.</li>
                <li>Choisissez <strong>Sur l’écran d’accueil</strong>.</li>
              </ol>
            ) : (
              <p className="text-xs">
                Sur Chrome ou Edge (Android) : menu du navigateur → <strong className="text-foreground">Installer l’application</strong>.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </main>

      <SubmissionDetails
        submission={selected}
        onClose={() => setSelected(null)}
        onDeleted={(id) => {
          setSelected(null);
          setSubmissions((prev) => prev.filter((s) => s.submissionId !== id));
        }}
      />
    </div>
  );
}
