# Environnements de Vestiaire

Vestiaire distingue trois environnements :

| Environnement | Usage | Source |
| --- | --- | --- |
| `development` | Développement sur votre ordinateur | `.env.local` |
| `preview` | Pull Requests et branches de démonstration | Netlify Deploy Previews |
| `production` | Version accessible aux utilisateurs | Netlify Production |

## Principes de sécurité

- Aucun secret réel ne doit être ajouté dans Git.
- Une variable préfixée par `NEXT_PUBLIC_` est envoyée au navigateur et ne doit
  jamais contenir une clé privée.
- Les Deploy Previews ne doivent pas utiliser la future base MongoDB de
  production.
- Une modification de variables Netlify nécessite un nouveau déploiement pour
  être prise en compte.

## Développement local

Créez le fichier local à partir du modèle :

```bash
cp .env.example .env.local
```

Conservez `APP_ENV=development`, puis renseignez uniquement les services dont
vous avez besoin. `.env.local` est ignoré par Git.

## Configuration dans Netlify

Dans Netlify, ouvrez :

`Project configuration → Environment variables`

Ajoutez les variables suivantes en choisissant des valeurs contextuelles :

| Variable | Scope Netlify | Production | Deploy Previews | Branch deploys |
| --- | --- | --- | --- | --- |
| `APP_ENV` | All scopes | `production` | `preview` | `preview` |
| `MONGODB_URI` | All scopes sur Free, Functions sur Pro+ | URI de production | URI de test | URI de test |
| `MONGODB_DB_NAME` | All scopes | `vestiaire` | `vestiaire_preview` | `vestiaire_preview` |
| `AUTH_SECRET` | All scopes sur Free, Functions sur Pro+ | secret de production | secret distinct | secret distinct |
| `OPENAI_API_KEY` | All scopes sur Free, Functions sur Pro+ | clé de production | clé de test limitée | clé de test limitée |

Pour `MONGODB_URI`, `AUTH_SECRET` et `OPENAI_API_KEY`, activez l'option
**Contains secret values**.

Netlify réserve la sélection de scopes précis aux offres Pro et Enterprise. Sur
l’offre Free, laissez **All scopes** : une variable serveur ne devient pas
publique pour autant. Seules les variables préfixées par `NEXT_PUBLIC_` sont
intégrées au code envoyé au navigateur par Next.js.

`AUTH_SECRET` et `OPENAI_API_KEY` peuvent rester absentes tant que
l'authentification et l'analyse IA ne sont pas encore branchées.

## Variables versionnées

`netlify.toml` contient uniquement des réglages non secrets :

- Node.js 22 ;
- désactivation de la télémétrie Next.js pendant la compilation ;
- protection contre les décalages de version pendant un nouveau déploiement.

Netlify fournit aussi automatiquement `CONTEXT`. L’application l’utilise comme
solution de secours pour distinguer une Deploy Preview de la production.

## Vérification

Après un nouveau déploiement, ouvrez `/api/health`.

La réponse doit contenir :

```json
{
  "status": "ok",
  "application": "Vestiaire",
  "environment": "preview",
  "timestamp": "..."
}
```

Sur le domaine de production, `environment` doit valoir `production`. Sur une
Pull Request Netlify, il doit valoir `preview`.

La connexion MongoDB possède son propre contrôle :

```text
/api/health/database
```

La configuration complète d'Atlas est détaillée dans
[`docs/MONGODB.md`](MONGODB.md).
