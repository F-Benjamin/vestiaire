# Vestiaire

Une garde-robe intelligente construite avec Next.js, React et TypeScript.

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
│   ├── (app)/
│   │   ├── layout.tsx              # Future frontière authentifiée
│   │   ├── wardrobe/page.tsx       # /fr/wardrobe et /en/wardrobe
│   │   ├── studio/page.tsx         # /fr/studio et /en/studio
│   │   ├── loading.tsx             # État de chargement localisé
│   │   └── error.tsx               # Limite d’erreur localisée
│   ├── layout.tsx                  # Langue HTML et providers
│   ├── not-found.tsx               # Page 404 localisée
│   └── RouteState.module.scss      # États de route partagés
├── api/
│   ├── analyze/route.ts            # API d’analyse des vêtements
│   └── health/
│       ├── route.ts                 # Vérification du serveur
│       └── database/route.ts        # État de la connexion MongoDB
└── globals.scss                    # Tokens, thèmes et styles globaux

components/
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
    ├── wardrobe.constants.ts       # Listes du domaine
    └── wardrobe.types.ts           # Types TypeScript

lib/
├── analyze-filename.ts             # Analyse réutilisable côté serveur
├── environment/mongodb.ts          # Validation des variables MongoDB
├── mongodb/client.ts               # Pool de connexions MongoDB partagé
├── repositories/                   # Accès serveur aux collections
├── schemas/                        # Validation Zod des données métier
├── runtime-environment.ts          # Local, Deploy Preview ou production
└── wardrobe.ts                     # Logique pure de composition

docs/
├── ENVIRONMENTS.md                 # Configuration locale et Netlify
├── MONGODB.md                      # Création et sécurisation d'Atlas
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

Le groupe `(marketing)` contient la surface publique. Le layout du groupe
`(app)` installe le `WardrobeProvider` autour des routes localisées de la
garde-robe et du studio. Ce groupe constitue la future frontière de l’espace
connecté, sans simuler une authentification tant que le fournisseur et
l’hébergement ne sont pas choisis.
Les vues utilisent le hook `useWardrobe` pour accéder aux états et actions sans
props drilling. La navigation utilise `next/link`, avec `useRouter` uniquement
pour les changements programmatiques du studio.

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

Et pour tester l’analyse du nom d’un fichier :

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"filename":"blazer-beige-travail.jpg"}'
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

## Ajouter une API d’IA

1. Copiez `.env.example` vers `.env.local`.
2. Ajoutez la clé dans `OPENAI_API_KEY`.
3. Utilisez cette variable uniquement dans `app/api/analyze/route.ts`.
4. Ne préfixez jamais une clé secrète avec `NEXT_PUBLIC_`.

La route actuelle analyse le nom du fichier. Elle constitue le bon emplacement
pour brancher ensuite une API de vision, sans exposer la clé au navigateur.

## Déploiement et environnements

Netlify est l’hébergement de référence. `main` alimente la production et chaque
Pull Request obtient une Deploy Preview isolée.

Les réglages non secrets sont versionnés dans `netlify.toml`. Les clés privées
restent dans les variables d’environnement Netlify et peuvent avoir des valeurs
différentes en production et en preview.

La procédure complète est détaillée dans
[`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md).

## Stockage cible

La connexion MongoDB Atlas, la validation des vêtements et la couche
d'accès aux données sont maintenant prêtes côté serveur. La première version
garde néanmoins les vêtements sur l'appareil jusqu'à l'ajout de
l'authentification : aucune route publique ne doit pouvoir lire ou écrire les
données d'un utilisateur sans vérifier son identité.

La procédure Atlas est détaillée dans [`docs/MONGODB.md`](docs/MONGODB.md).
Les prochaines briques seront :

- Auth.js pour rattacher chaque vêtement à son propriétaire ;
- un stockage objet pour les photographies ;
- un worker pour les futurs traitements IA longs.
