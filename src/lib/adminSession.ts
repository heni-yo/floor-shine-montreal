const STORAGE_KEY = "talon_admin_token";

export function getStoredAdminToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearStoredAdminToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

function apiBase(): string {
  return (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
}

/** Requêtes authentifiées vers l’API admin (Bearer). */
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const t = getStoredAdminToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  const p = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${apiBase()}${p}`, { ...init, headers });
}

/** Message d’erreur lisible depuis le corps JSON de l’API (une seule lecture). */
export async function readAdminErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return res.statusText || `Erreur ${res.status}`;
    const j = JSON.parse(text) as { error?: string };
    if (typeof j.error === "string") return j.error;
    return `Erreur ${res.status}`;
  } catch {
    return res.statusText || `Erreur ${res.status}`;
  }
}
