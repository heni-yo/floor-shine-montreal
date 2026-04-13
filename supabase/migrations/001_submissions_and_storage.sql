-- À exécuter dans Supabase : SQL Editor (ou migrations CLI).
-- Table des soumissions (métadonnées + liste des noms de fichiers).

create table if not exists public.submissions (
  submission_id text primary key,
  created_at timestamptz not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  postal_code text not null,
  services jsonb not null default '{}'::jsonb,
  photos text[] not null default array[]::text[]
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

-- Accès uniquement via la clé service_role (côté serveur Node) : pas de politique anon.

-- Bucket Storage pour quote.xlsx et les photos (privé).
insert into storage.buckets (id, name, public)
values ('quote-submissions', 'quote-submissions', false)
on conflict (id) do nothing;
