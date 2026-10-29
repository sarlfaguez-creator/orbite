# Publier Orbite sur le Play Store et l’App Store

Les applis sont fabriquées automatiquement par GitHub à chaque modification envoyée sur `main` (onglet **Actions**, « Fabriquer les applis »). Le jeu est inclus dans l’appli : aucune donnée n’est consommée, même au premier lancement.

| Ce qui est prêt | Où |
|---|---|
| Appli Android de test (APK) | Actions → dernier passage → **orbite-android-test** |
| Capture de l’appli iPhone lancée sur un simulateur | Actions → dernier passage → **orbite-iphone-capture** |
| Captures pour les fiches, image de présentation, icône 512 | dossier `fiches/` |
| Politique de confidentialité | https://sarlfaguez-creator.github.io/orbite/confidentialite.html |
| Textes des fiches | plus bas dans ce fichier |

Identifiant de l’appli (le même sur les deux stores, définitif une fois publié) : `io.github.sarlfaguez.orbite`

## Essayer l’appli Android sur ton téléphone

1. Sur github.com, ouvre le dépôt → **Actions** → le dernier « Fabriquer les applis » réussi.
2. En bas, télécharge **orbite-android-test** (un .zip), puis décompresse-le : tu obtiens un fichier `.apk`.
3. Envoie-le sur ton téléphone Android et ouvre-le. Android demande d’autoriser l’installation depuis cette source : accepte.

Tant que la clé de signature n’est pas en place, chaque nouvelle version de test demande de désinstaller la précédente (ta progression dans l’appli de test est alors perdue).

---

## Play Store (Android)

### 1. Créer ton compte développeur

1. Va sur https://play.google.com/console et choisis un compte **personnel**.
2. Paie les 25 $ (une seule fois) et fais vérifier ton identité. Compte quelques jours.

### 2. Mettre la clé de signature dans GitHub

Le Play Store exige que chaque version soit signée avec la même clé. Il en faut une avant le premier envoi. Elle se range dans **Settings → Secrets and variables → Actions** du dépôt, sous deux noms :

| Secret | Contenu |
|---|---|
| `ANDROID_CLE_BASE64` | le fichier de clé, encodé en base64 |
| `ANDROID_CLE_MOT_DE_PASSE` | son mot de passe |

Dès que ces secrets existent, GitHub fabrique aussi **orbite-play-store** (le fichier `.aab` à envoyer au Play Store), et l’APK de test garde la même signature d’une version à l’autre.

Garde une copie du fichier de clé et du mot de passe en lieu sûr (pas dans le dépôt). Si tu les perds, le Play Store permet de déclarer une nouvelle clé d’envoi, mais c’est une démarche auprès de Google.

### 3. Créer l’appli dans la Play Console

**Créer une appli** : nom `Orbite`, langue par défaut français, type **Jeu**, **Gratuit**.

Puis, dans **Configurer votre appli** :

- **Règles de confidentialité** : https://sarlfaguez-creator.github.io/orbite/confidentialite.html
- **Accès à l’appli** : toutes les fonctionnalités sont accessibles sans restriction.
- **Annonces** : non, l’appli ne contient pas d’annonces.
- **Classification du contenu** : remplis le questionnaire honnêtement (pas de violence, pas d’achat). Pour la question sur les échanges entre utilisateurs : les joueurs voient les pseudos des autres au classement.
- **Public cible** : 13 ans et plus. Inclure les moins de 13 ans ajoute les exigences du programme Familles.
- **Sécurité des données** :
  - données collectées : **Nom** (le pseudo), **Identifiants de l’appareil ou autres** (l’identifiant aléatoire du jeu), **Activité dans les applis → Autres actions** (les scores) ;
  - toutes facultatives, pour le **fonctionnement de l’appli**, non partagées ;
  - chiffrées pendant le transfert : oui ;
  - suppression : sur demande, via la page de contact de la politique de confidentialité.
- **Catégorie** : Jeux → Casual. **Coordonnées** : une adresse e-mail de contact, affichée publiquement sur la fiche.

### 4. La fiche du store

- Textes : voir **Textes des fiches** plus bas.
- **Icône** : `fiches/play-icone-512.png`
- **Image de présentation** : `fiches/play-image-presentation.png`
- **Captures d’écran du téléphone** : les fichiers `fiches/android-*.png`

### 5. Le test fermé obligatoire

Pour un compte personnel récent, Google exige un test fermé avec **au moins 12 testeurs inscrits pendant 14 jours d’affilée** avant la publication.

1. **Tester → Test fermé** : crée une version et envoie le fichier `.aab` (artefact **orbite-play-store**).
2. Ajoute tes testeurs par adresse e-mail (ou un groupe Google), puis partage-leur le lien d’inscription.
3. Chaque testeur s’inscrit avec ce lien, puis installe l’appli depuis le Play Store et la garde 14 jours.
4. Au bout des 14 jours : **Demander l’accès à la production**, réponds aux questions sur ton test, puis publie.

---

## App Store (iPhone)

L’appli est réglée pour l’iPhone uniquement, en portrait. Elle s’installe aussi sur iPad, en mode iPhone. Il ne faut donc que les captures iPhone 6,9 pouces.

### 1. Rejoindre l’Apple Developer Program

Sur https://developer.apple.com/programs/enroll/, inscris-toi comme **particulier** (99 $ par an). Il faut un identifiant Apple avec la double authentification. Ton vrai nom apparaîtra comme vendeur sur l’App Store.

### 2. Déclarer l’appli

1. Sur https://developer.apple.com/account/resources/identifiers, ajoute un **App ID** : type App, identifiant explicite `io.github.sarlfaguez.orbite`.
2. Sur https://appstoreconnect.apple.com, **Apps → +** : plateforme iOS, nom, langue principale **français**, l’identifiant ci-dessus, référence (SKU) `orbite`.
   Le nom doit être unique sur l’App Store. Si « Orbite » est déjà pris, essaie par exemple « Orbite : comète zen ». Sous l’icône du téléphone, l’appli s’appellera toujours « Orbite ».

### 3. Donner à GitHub le droit d’envoyer l’appli

1. Dans App Store Connect : **Utilisateurs et accès → Intégrations → App Store Connect API → Clés d’équipe**, génère une clé avec le rôle **Admin**.
2. Télécharge le fichier `.p8` (une seule fois possible) et note l’**ID de clé** et l’**ID de l’émetteur**.
3. Sur https://developer.apple.com/account, section **Adhésion**, note ton **Team ID**.
4. Dans le dépôt GitHub, **Settings → Secrets and variables → Actions → New repository secret**, crée :

| Secret | Contenu |
|---|---|
| `ASC_CLE_ID` | l’ID de clé |
| `ASC_EMETTEUR_ID` | l’ID de l’émetteur |
| `ASC_CLE_P8` | tout le contenu du fichier `.p8`, ouvert avec le Bloc-notes |
| `APPLE_EQUIPE_ID` | ton Team ID |

Ces quatre valeurs donnent accès à ton compte Apple : ne les colle nulle part ailleurs que dans les secrets GitHub.

Ensuite, chaque modification envoyée sur `main` fabrique l’appli, la signe et l’envoie vers **TestFlight**. Pour l’essayer sur ton iPhone, installe l’appli TestFlight et ajoute-toi comme testeur interne dans App Store Connect.

### 4. La fiche et l’envoi en vérification

- Textes : voir **Textes des fiches** plus bas.
- **Captures iPhone 6,9 pouces** : les fichiers `fiches/iphone-*.png` (1320 × 2868).
- **URL de la politique de confidentialité** : https://sarlfaguez-creator.github.io/orbite/confidentialite.html
- **URL d’assistance** : https://github.com/sarlfaguez-creator/orbite/issues
- **Catégories** : Jeux, sous-catégories Casual et Arcade.
- **Confidentialité de l’app** :
  - données collectées : **Nom** (le pseudo), **Identifiant utilisateur** (l’identifiant aléatoire), **Contenu de jeu** (les scores) ;
  - pour la **fonctionnalité de l’app**, sans pistage.
- **Classification par âge** : pas de violence ni d’achat. Il y a un contenu créé par les joueurs (les pseudos), filtré et signalable.
- **Notes pour la vérification** : « Aucun compte n’est nécessaire. Le pseudo du classement est facultatif. Les grossièretés sont filtrées. Toucher la ligne d’un autre joueur dans le classement permet de le signaler et de le masquer. »

Choisis la version envoyée par GitHub dans **Build**, puis **Soumettre pour vérification**.

---

## Publier une nouvelle version

1. Modifie `jeu.html`, puis envoie la modification sur GitHub : le site se met à jour tout seul.
2. Pour les stores, augmente le numéro de version affiché :
   - Android : `versionName` dans `android/app/build.gradle` ;
   - iPhone : `MARKETING_VERSION` dans `ios/App/App.xcodeproj/project.pbxproj` (deux lignes).
3. GitHub fabrique les nouvelles applis. Le numéro de fabrication augmente tout seul.
4. Envoie le nouveau `.aab` au Play Store, et choisis la nouvelle version dans App Store Connect.

---

## Textes des fiches

**Nom** : Orbite

**Sous-titre App Store** (30 caractères max) : Glisse d’astre en astre

**Description courte Play Store** (80 caractères max) :
Une touche pour glisser d’astre en astre. Jeu zen néon, infini, hors ligne.

**Texte promotionnel App Store** (170 caractères max) :
Chaque jour, un nouveau défi : 40 astres, le même parcours pour tous, et ton fantôme qui court à côté de toi.

**Mots-clés App Store** (100 caractères max) :
zen,néon,espace,comète,une touche,arcade,relaxant,hors ligne,défi du jour,étoiles,infini,casual

**Description complète** :

Ta comète tourne autour d’un astre. Touche l’écran pour te lâcher, et glisse jusqu’au suivant. Une seule touche, et un voyage qui ne s’arrête jamais.

VOYAGE ZEN
Infini et sans défaite : rater ne fait que remettre ta série à zéro. Enchaîne les captures parfaites pour faire grimper le multiplicateur, traverse des zones aux couleurs changeantes, frôle les trous noirs qui courbent ta trajectoire, suis les astres qui se déplacent.

DÉFI DU JOUR
Chaque jour, un parcours de 40 astres, le même pour tous les joueurs. Ton fantôme rejoue ta meilleure course à côté de toi : bats-le, puis compare-toi au classement mondial.

À COLLECTIONNER
Ramasse les poussières d’étoile pour débloquer 8 apparences de comète, et décroche 14 succès.

FAIT POUR TOUS LES MOMENTS
• Jouable entièrement hors ligne : aucune donnée mobile consommée
• Pas de publicité, pas d’achat, pas de compte
• Musique et sons générés en direct, vibrations légères
• Des parties de 10 secondes ou d’une heure, comme tu veux

Respire, vise, lâche-toi.
