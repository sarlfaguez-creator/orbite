-- Classement en ligne d'Orbite (Supabase, offre gratuite).
-- À coller dans Supabase > SQL Editor, puis « Run ».

create table if not exists public.scores (
  id      bigint generated always as identity primary key,
  joueur  uuid        not null,
  pseudo  text        not null check (char_length(pseudo) between 2 and 14),
  mode    text        not null check (mode in ('defi', 'zen')),
  jour    date        not null,
  score   integer     not null check (score between 0 and 100000),
  temps   real        check (temps is null or temps between 10 and 3600),
  cree_le timestamptz not null default now()
);

create index if not exists scores_mode_jour_score on public.scores (mode, jour, score desc);

alter table public.scores enable row level security;

-- Tout le monde peut lire le classement.
create policy "lecture publique" on public.scores
  for select to anon using (true);

-- Tout le monde peut ajouter un score, mais seulement pour la date du jour (à un jour près, fuseaux horaires).
-- Personne ne peut modifier ni supprimer depuis le jeu ; toi seul le peux depuis le tableau de bord.
create policy "ajout du jour" on public.scores
  for insert to anon with check (jour between current_date - 1 and current_date + 1);
