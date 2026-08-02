# Wearsona

Une garde-robe intelligente qui aide à porter la personne que l’on choisit
d’être aujourd’hui, construite avec Next.js, React et TypeScript.

Le projet réunit :

- l’interface de gestion de la garde-robe ;
- le studio de création de tenues ;
- les routes API qui accueilleront les services d’IA ;
- la configuration des secrets et futures intégrations.

## Démarrer le projet

Prérequis : Node.js 22 ou une version plus récente.

```bash
npm install
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

Pour vérifier la version de production :

```bash
npm run build
npm start
```

## Comprendre la structure

```text
app/
├── [locale]/
│   ├── (marketing)/
│   │   └── page.tsx                # Accueils /fr et /en
│   ├── (auth)/
│   │   ├── sign-in/page.tsx        # Connexion localisée
│   │   └── sign-up/page.tsx        # Création de compte
│   ├── (app)/
│   │   ├── layout.tsx              # Navigation de l'espace connecté
│   │   ├── wardrobe/page.tsx       # /fr/wardrobe et /en/wardrobe
│   │   ├── studio/page.tsx         # /fr/studio et /en/studio
│   │   ├── profile/page.tsx        # Centre de profil et sécurité
│   │   ├── loading.tsx             # État de chargement localisé
│   │   └── error.tsx               # Limite d’erreur localisée
│   ├── layout.tsx                  # Langue HTML et providers
│   ├── not-found.tsx               # Page 404 localisée
│   └── RouteState.module.scss      # États de route partagés
├── api/
│   ├── analyze/route.ts            # API d’analyse des vêtements
│   ├── auth/[...all]/route.ts       # API Better Auth
│   ├── account/export/route.ts      # Export privé du catalogue
│   ├── garments/
│   │   ├── route.ts                 # Liste et création privées
│   │   └── [id]/route.ts            # Modification et suppression privées
│   ├── wardrobe-images/
│   │   ├── route.ts                 # Upload privé vers Netlify Blobs
│   │   └── [...key]/route.ts         # Lecture et suppression privées
│   └── health/
│       ├── route.ts                 # Vérification du serveur
│       └── database/route.ts        # État de la connexion MongoDB
└── globals.scss                    # Tokens, thèmes et styles globaux

components/
├── auth/
│   ├── AuthPage.tsx                # Connexion et inscription
│   └── AuthPage.module.scss        # Styles des parcours de compte
├── profile/                         # Identité, préférences, sécurité et données
├── i18n/
│   ├── LocalizationProvider.tsx    # Dictionnaire actif
│   └── LocaleSwitcher.tsx          # Sélecteur FR / EN
├── marketing/
│   ├── LandingPage.tsx             # Présentation publique du produit
│   └── LandingPage.module.scss     # Styles de la page publique
├── theme/
│   ├── ThemeProvider.tsx           # Jour, nuit ou préférence système
│   ├── ThemeSwitcher.tsx           # Sélecteur accessible
│   └── ThemeSwitcher.module.scss   # Styles locaux du sélecteur
└── wardrobe/
    ├── AppHeader.tsx               # Navigation avec next/link
    ├── WardrobeContext.tsx         # États et actions partagés
    ├── WardrobeView.tsx            # Catalogue de vêtements
    ├── StudioView.tsx              # Édition et création de tenues
    ├── MultiField.tsx              # Sélection multiple réutilisable
    ├── UploadButton.tsx            # Import des photographies
    ├── WardrobeImage.tsx           # Affichage des photographies privées
    ├── wardrobe.constants.ts       # Listes du domaine
    └── wardrobe.types.ts           # Types TypeScript

lib/
├── api/                             # Session et réponses des routes métier
├── analyze-filename.ts             # Solution de secours par nom de fichier
├── vision-analysis.ts              # Analyse visuelle OpenAI côté serveur
├── auth.ts                         # Configuration Better Auth
├── auth-client.ts                  # Client React Better Auth
├── auth-session.ts                 # Session et protection des pages
├── auth-indexes.ts                 # Index MongoDB d'authentification
├── environment/mongodb.ts          # Validation des variables MongoDB
├── mongodb/client.ts               # Pool de connexions MongoDB partagé
├── repositories/                   # Accès serveur aux collections
├── schemas/                        # Validation Zod des données métier
├── storage/                        # Stockage privé des photographies
├── runtime-environment.ts          # Local, Deploy Preview ou production
├── wardrobe-api.ts                 # Client typé des API de garde-robe
└── wardrobe.ts                     # Logique pure de composition

docs/
├── BRAND.md                        # Plateforme de marque et architecture produit
├── AUTHENTICATION.md               # Sécurité et configuration Better Auth
├── ENVIRONMENTS.md                 # Configuration locale et Netlify
├── GARMENT_API.md                   # Contrat CRUD privé des vêtements
├── IMAGE_STORAGE.md                 # Upload et lecture des photographies
├── MONGODB.md                      # Création et sécurisation d'Atlas
├── PROFILE.md                      # Parcours du centre de profil
└── PRODUCT_BRIEF.md                # Vision, MVP, exigences et roadmap

i18n/
├── dictionaries/
│   ├── fr.ts                       # Tous les textes français
│   └── en.ts                       # Tous les textes anglais
├── dictionaries.ts                 # Chargement côté serveur
├── format.ts                       # Libellés et interpolation
└── routing.ts                      # Locales et construction des URLs

proxy.ts                    # Détection de la langue du navigateur
.env.example               # Exemple de variables secrètes
netlify.toml               # Compilation et réglages publics Netlify
```

Chaque composant visuel possède un fichier `*.module.scss` colocalisé. Les
classes sont donc isolées par composant. `globals.scss` reste volontairement
limité aux variables CSS des thèmes, aux tokens de design, au reset, à la
typographie générale et aux préférences d’accessibilité. Les variables CSS
restent dynamiques au runtime ; SCSS sert à organiser les sélecteurs, états et
media queries.

## Les deux côtés de Next.js

Les fichiers `page.tsx` et `layout.tsx` sont des **Server Components** par
défaut. Ils peuvent lire une base de données ou appeler un service interne sans
envoyer ce code au navigateur.

Le segment `[locale]` produit les versions françaises et anglaises. Une visite
sur une URL sans préfixe est redirigée vers `/fr` ou `/en` selon l’en-tête
`Accept-Language` du navigateur. Tous les textes d’interface sont centralisés
dans `i18n/dictionaries`.

Le groupe `(marketing)` contient la vitrine du projet et `(auth)` les parcours
de connexion et d'inscription. Le groupe `(app)` contient la garde-robe, le
studio et le centre de profil. Chacune de ces pages vérifie sa session côté
serveur avant de charger la vue. Le layout lit les vêtements de l’utilisateur
dans MongoDB, puis installe le `WardrobeProvider` avec ces données initiales.
Les vues utilisent le hook `useWardrobe` pour accéder aux états et actions sans
props drilling. Toutes les mutations passent par le client API typé, sans
stockage local de la garde-robe. La navigation utilise `next/link`, avec
`useRouter` uniquement pour les changements programmatiques du studio.

Les fichiers `app/api/**/route.ts` sont des points d’entrée backend. Par
exemple :

```bash
curl http://localhost:3000/api/health
```

Cette route indique également si l’application s’exécute en environnement
`development`, `preview` ou `production`.

La connexion à MongoDB peut être contrôlée séparément :

```bash
curl http://localhost:3000/api/health/database
```

## UX et accessibilité

L’interface vise WCAG 2.2 AA :

- navigation clavier et lien d’évitement ;
- indicateurs de focus visibles ;
- cibles tactiles dimensionnées et espacées ;
- filtres et choix multiples exposés avec `aria-pressed` ;
- navigation active annoncée avec `aria-current` ;
- animations neutralisées avec `prefers-reduced-motion` ;
- mise en page refluide à partir de 320 px ;
- états de chargement, d’erreur et messages de statut accessibles.

Le thème est appliqué avant l’hydratation pour éviter un flash de couleur
incorrect. Le choix `Jour`, `Nuit` ou `Système` est conservé dans
`localStorage`, et les animations respectent `prefers-reduced-motion`.

## Analyse visuelle des vêtements

1. Copiez `.env.example` vers `.env.local`.
2. Ajoutez une clé de projet dans `OPENAI_API_KEY`.
3. Conservez `OPENAI_VISION_MODEL=gpt-5.6`, ou choisissez explicitement un
   autre modèle compatible avec les images.
4. Ne préfixez jamais une clé secrète avec `NEXT_PUBLIC_`.

À chaque import, `/api/analyze` reçoit la photo authentifiée sous forme de
`multipart/form-data`, l’envoie à l’API Responses d’OpenAI en données d’image,
puis propose catégorie, couleurs, saisons, styles et motifs avec une confiance
par attribut. `store: false` est demandé à l’API. La photo n’est jamais rendue
publique pour cette analyse et n’est pas conservée en base64 dans MongoDB.

La petite étoile du studio indique une valeur proposée. Une modification dans
le studio retire immédiatement l’étoile de l’attribut concerné, côté interface
et côté MongoDB : une correction humaine n’est donc jamais écrasée par une
proposition historique. Sans `OPENAI_API_KEY`, ou si le service échoue,
l’import continue avec l’analyse de nom de fichier existante.

Le détourage est optionnel et asynchrone via Cloudinary. Ses variables serveur
(`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) sont
décrites dans [`docs/IMAGE_ANALYSIS.md`](docs/IMAGE_ANALYSIS.md). La version
détourée devient automatiquement principale. L’original reste privé puis est
purgé automatiquement après 10 jours.

## Déploiement et environnements

Netlify est l’hébergement de référence. `main` alimente la production et chaque
Pull Request obtient une Deploy Preview isolée.

Les réglages non secrets sont versionnés dans `netlify.toml`. Les clés privées
restent dans les variables d’environnement Netlify et peuvent avoir des valeurs
différentes en production et en preview.

La procédure complète est détaillée dans
[`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md).

## Authentification et stockage

La connexion MongoDB Atlas, la validation des vêtements et leur API CRUD privée
sont prêtes côté serveur. Better Auth fournit l'inscription, la connexion, les
sessions MongoDB et la protection des pages. Chaque opération sur un vêtement
est filtrée avec l'identifiant de l'utilisateur connecté. Les mots de passe
sont hachés par Better Auth et ne sont jamais stockés en clair.

La procédure Atlas est détaillée dans [`docs/MONGODB.md`](docs/MONGODB.md).
La configuration de l'authentification est détaillée dans
[`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).
Le contrat des vêtements est documenté dans
[`docs/GARMENT_API.md`](docs/GARMENT_API.md).
Le stockage des photographies est détaillé dans
[`docs/IMAGE_STORAGE.md`](docs/IMAGE_STORAGE.md).
Le centre de profil est détaillé dans [`docs/PROFILE.md`](docs/PROFILE.md).

La garde-robe utilise désormais MongoDB pour les attributs et Netlify Blobs
pour les photographies. Les prochaines briques seront :

- détouré des photographies ;
- un worker pour les futurs traitements IA longs.
