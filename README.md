# TALON PLANCHER — talonplancher.com

Site de l'entreprise de sablage de plancher (Montréal, Rive-Sud, Rive-Nord) et
API qui reçoit les demandes de soumission.

| Partie | Technologie | Hébergement |
|---|---|---|
| Site (FR à la racine, EN sous `/en`) | Next.js 15, React, Tailwind CSS | Vercel |
| API des soumissions | Express (Node), lancé avec `tsx` | Render |
| Soumissions et fichiers en production | Supabase (base + stockage) | Supabase |
| Courriel interne (PDF + Excel joints) | Resend | — |

Les pages sont pré-générées (statiques). Le formulaire envoie la demande à l'API,
qui calcule l'estimation, génère le PDF et l'Excel, les stocke avec les photos
et envoie un courriel à l'adresse interne. Le client ne reçoit pas de courriel.

## Démarrer en local

Prérequis : Node.js **20.9 ou plus récent** et npm.

```bash
npm install
SKIP_EMAIL=true npm run dev:full
```

- Site : http://localhost:8080
- API : http://localhost:3001 (le site lui relaie `/api/*` en local)

`SKIP_EMAIL=true` génère tout (PDF, Excel, enregistrement) **sans envoyer de
courriel**. Sans variables Supabase, l'API locale stocke les soumissions dans
`uploads/` et `server/data/` (ignorés par git), jamais dans Supabase.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Site seul (Next.js, port 8080) |
| `npm run dev:server` | API seule, rechargée à chaque modification |
| `npm run dev:full` | Site + API ensemble |
| `npm run build` | Build de production du site |
| `npm run start:server` | API en production (commande de Render) |
| `npm run test` | Tests (Vitest) |
| `npm run lint` | ESLint |

## Variables d'environnement

Ne jamais commiter de valeurs : ce dépôt est **public**. En local, l'API lit le
fichier `.env` (ignoré par git).

**Site (Vercel)**

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_API_URL` | Adresse de l'API (`https://talonplancher-api.onrender.com`). Lue au build. |

**API (Render)**

| Variable | Rôle |
|---|---|
| `FRONTEND_ORIGIN` | Origines autorisées (CORS), séparées par des virgules |
| `RESEND_API_KEY` | Clé Resend pour l'envoi du courriel |
| `MAIL_FROM` / `MAIL_TO_INTERNAL` | Expéditeur et destinataire du courriel interne |
| `ADMIN_API_TOKEN` | Jeton de l'historique des soumissions (16 caractères minimum) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Active le stockage Supabase (sinon : disque local) |
| `SUPABASE_STORAGE_BUCKET` | Facultatif, `quote-submissions` par défaut |
| `PORT`, `NODE_ENV` | Fournis par Render |
| `SKIP_EMAIL` | Facultatif : `true` pour ne rien envoyer (tests) |
| `QUOTE_VERBOSE_ERRORS` | Facultatif : messages d'erreur détaillés en production |
| `TRUST_PROXY_HOPS` | Facultatif, `1` par défaut |

En mode local uniquement : `UPLOAD_DIR`, `SERVER_DATA_DIR`, `SUBMISSIONS_DB_PATH`
déplacent les fichiers et la base SQLite.

## Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Les tarifs (pi², marches, etc.) | `server/config/pricing.ts` |
| Le nom, le téléphone, le courriel de l'entreprise | `src/lib/site.ts` et `server/config/company.ts` |
| Les textes du site (FR et EN) | `src/lib/translations.ts` |
| Le contenu des pages services | `src/lib/serviceContent.ts` |
| Les photos et leurs descriptions | `public/img/` et `src/lib/photos.ts` |
| La mise en page du PDF | `server/lib/pdfQuote.ts` |
| Les règles de sécurité de l'API | `server/lib/security.ts` |

## Déployer

Un push sur `main` déclenche le déploiement :

- **Vercel** redéploie le site automatiquement.
- **Render** redéploie l'API si le déploiement automatique est actif. Un service
  **suspendu** ne se redéploie pas tout seul : après l'avoir réactivé, lancer
  *Manual Deploy → Deploy latest commit*.

Les migrations Supabase sont dans `supabase/migrations/` et s'appliquent depuis le
tableau de bord Supabase.

## Historique des soumissions

Page réservée, protégée par `ADMIN_API_TOKEN` : liste, recherche, filtres, PDF,
Excel et photos de chaque demande. La suppression est définitive et se confirme
en retapant le numéro de la soumission. Le jeton n'existe que sur Render : en
local, l'historique ne fonctionne que si `ADMIN_API_TOKEN` est défini dans `.env`.
