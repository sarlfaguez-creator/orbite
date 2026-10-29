-- Classement en ligne d'Orbite (Supabase, offre gratuite).
-- À coller dans Supabase > SQL Editor, puis « Run ». Peut être relancé sans risque.

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

-- Pseudos signalés depuis le jeu. Toi seul les lis, dans Table Editor > signalements.
create table if not exists public.signalements (
  id      bigint generated always as identity primary key,
  joueur  uuid        not null,
  pseudo  text        not null check (char_length(pseudo) <= 14),
  par     uuid        not null,
  cree_le timestamptz not null default now()
);

create index if not exists signalements_joueur on public.signalements (joueur);

-- Un joueur signalé par 3 personnes différentes disparaît du classement de tout le monde,
-- sans attendre que tu passes. Pour le rétablir, supprime ses lignes dans « signalements ».
create or replace function public.joueur_masque(j uuid) returns boolean
  language sql stable security definer set search_path = ''
  as $$ select count(distinct s.par) >= 3 from public.signalements s where s.joueur = j $$;
revoke all on function public.joueur_masque(uuid) from public;
grant execute on function public.joueur_masque(uuid) to anon;

alter table public.scores enable row level security;
alter table public.signalements enable row level security;

-- Le jeu (rôle « anon ») peut lire et ajouter des scores, et seulement ajouter des signalements :
-- ni modifier, ni supprimer, ni lire les signalements.
revoke all on table public.scores from anon;
revoke all on table public.signalements from anon;
grant select, insert on table public.scores to anon;
grant insert on table public.signalements to anon;

-- Tout le monde peut lire le classement, sauf les joueurs masqués.
drop policy if exists "lecture publique" on public.scores;
create policy "lecture publique" on public.scores
  for select to anon using (not public.joueur_masque(joueur));

-- Tout le monde peut ajouter un score, mais seulement pour la date du jour (à un jour près, fuseaux horaires).
-- Toi seul peux corriger ou supprimer une ligne, depuis le tableau de bord.
drop policy if exists "ajout du jour" on public.scores;
create policy "ajout du jour" on public.scores
  for insert to anon with check (jour between current_date - 1 and current_date + 1);

drop policy if exists "signaler" on public.signalements;
create policy "signaler" on public.signalements
  for insert to anon with check (true);
