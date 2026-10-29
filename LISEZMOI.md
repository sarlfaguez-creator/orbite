# Orbite

**Jouer : https://sarlfaguez-creator.github.io/orbite/**

Un jeu néon infini : ta comète tourne autour d’un astre. Touche l’écran pour te lâcher et rejoindre le suivant.

- **Voyage zen** : infini, sans défaite. Rater ne fait que remettre ta série à zéro. Zones successives, trous noirs, astres mobiles.
- **Défi du jour** : 40 astres, le même parcours pour tout le monde, chronométré. Ton **fantôme** rejoue ta meilleure course.
- **Poussières d’étoile** à ramasser → 8 **apparences** à débloquer, 14 **succès**.
- **Classement** : local sur l’appareil, ou mondial si tu actives Supabase (voir plus bas).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `jeu.html` | Le jeu entier (code, styles, sons). **C’est le seul fichier à modifier.** |
| `construire.mjs` | Fabrique `site/` (le site) et `www/` (le contenu des applis) à partir de `jeu.html`, ainsi que toutes les icônes. |
| `site/`, `www/` | Les dossiers générés, à tester en local (pas envoyés sur GitHub). |
| `confidentialite.html` | La politique de confidentialité, publiée avec le site. |
| `supabase.sql` | Les tables du classement en ligne et des signalements (optionnel). |
| `android/`, `ios/`, `capacitor.config.json`, `package.json` | Les applis Android et iPhone (Capacitor). |
| `PUBLIER-STORES.md` | Le guide pour le Play Store et l’App Store, avec les textes des fiches. |
| `fiches/` | Icône, captures d’écran et image de présentation pour les stores. |
| `.github/workflows/publier.yml` | La publication automatique sur GitHub Pages. |
| `.github/workflows/applis.yml` | La fabrication automatique des applis. |
| `.github/workflows/captures.yml`, `outils/captures.mjs` | Les captures d’écran des fiches, à relancer depuis l’onglet Actions. |

## Mettre à jour le jeu en ligne

Chaque modification envoyée sur la branche `main` est reconstruite puis publiée automatiquement en une minute environ. L’avancement se suit dans l’onglet **Actions** du dépôt.

- **Depuis l’ordinateur** : modifie `jeu.html`, puis lance `git commit -am "…"` et `git push`.
- **Sans rien installer** : ouvre `jeu.html` sur github.com, clique sur le crayon, modifie, puis « Commit changes ».

La version du cache change automatiquement, donc les téléphones récupèrent la mise à jour une seule fois.

Pour tester sur l’ordinateur avant de publier :

```bash
node construire.mjs
```

## Jouer sur l’ordinateur

```bash
python -m http.server 8765 --directory site
```

Puis ouvre http://localhost:8765

## Consommation de données

- Première visite : environ 260 Ko (environ 100 Ko compressés par le serveur).
- Ensuite : **zéro**. Le jeu est en cache sur le téléphone et marche en mode avion. Seule une petite vérification de mise à jour (moins de 2 Ko) a lieu quand le téléphone est connecté.
- Classement en ligne (si activé) : quelques Ko quand on ouvre le classement ou qu’on termine un défi.

## Installer le jeu sur un téléphone

Les joueurs peuvent **installer** le jeu comme une appli. Sur Android, le bouton « Installer l’appli » apparaît dans le menu. Sur iPhone : Partager → « Sur l’écran d’accueil ».

## Les applis Android et iPhone

Les vraies applis, pour le Play Store et l’App Store, sont fabriquées par GitHub à chaque modification (onglet **Actions**, « Fabriquer les applis »). Le jeu y est inclus : zéro donnée, même au premier lancement. Elles ajoutent les vibrations natives et le bouton retour d’Android. Tout le reste est le même `jeu.html`.

Pour les publier, suis [PUBLIER-STORES.md](PUBLIER-STORES.md).

Pour être découvert par plus de monde, tu peux aussi publier le contenu de `site/` sur **itch.io**, zippé comme jeu HTML. Le mode hors ligne y est cependant moins fiable.

## Activer le classement mondial (optionnel)

1. Crée un projet gratuit sur supabase.com.
2. Dans **SQL Editor**, colle le contenu de `supabase.sql`, puis Run.
3. Dans **Project Settings → API**, copie l’adresse du projet et la clé publique (« anon » ou « publishable »). N’utilise jamais la clé secrète.
4. Dans `jeu.html`, remplis la ligne :
   ```js
   const CLASSEMENT_EN_LIGNE = { url: 'https://xxxx.supabase.co', cle: 'ta-clé-publique' };
   ```
5. Envoie la modification sur GitHub (commit puis push) : le jeu en ligne se met à jour tout seul.

Les scores obtenus hors ligne sont mis de côté et envoyés au retour de la connexion.

Comme pour tout jeu dont le code s’exécute chez le joueur, un tricheur motivé peut envoyer un faux score. Tu peux supprimer ces lignes depuis le tableau de bord Supabase.

**Pseudos** : les grossièretés sont refusées et masquées. Dans le classement, toucher la ligne d’un autre joueur permet de le signaler. Il disparaît alors pour toi, et pour tout le monde dès que 3 personnes l’ont signalé. Les signalements sont dans **Table Editor → signalements**. Pour rétablir un joueur, supprime ses lignes de cette table.
