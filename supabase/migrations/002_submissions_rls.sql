-- Alerte linter Supabase : « RLS Disabled in Public » sur public.submissions.
-- Ce projet n'utilise que la service_role (Node) pour cette table :
-- aucune politique n'est nécessaire — service_role contourne la RLS.
-- Les clés anon / authenticated (PostgREST) n'auront aucun accès aux lignes.

alter table public.submissions enable row level security;
