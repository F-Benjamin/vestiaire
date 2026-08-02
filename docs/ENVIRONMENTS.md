# Environnements de Wearsona

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

En local, Wearsona active automatiquement une identité de développement
`Local admin`, sans création de compte ni connexion. Elle est disponible
uniquement avec `npm run dev` ou `netlify dev` et n’est jamais activée dans un
déploiement Netlify. Les données Mongo locales sont isolées dans une base dont
le nom reprend `MONGODB_DB_NAME` avec le suffixe `_local`.

## Configuration dans Netlify

Dans Netlify, ouvrez :

`Project configuration → Environment variables`

Ajoutez les variables suivantes en choisissant des valeurs contextuelles :

| Variable | Scope Netlify | Production | Deploy Previews | Branch deploys |
| --- | --- | --- | --- | --- |
| `APP_ENV` | All scopes | `production` | `preview` | `preview` |
| `MONGODB_URI` | All scopes sur Free, Functions sur Pro+ | URI de production | URI de test | URI de test |
| `MONGODB_DB_NAME` | All scopes | `vestiaire` | `vestiaire_preview` | `vestiaire_preview` |
| `BETTER_AUTH_SECRET` | All scopes sur Free, Functions sur Pro+ | secret de production | secret de test | secret de test |
| `EMAIL_AUTH_ENABLED` | All scopes | `true` après configuration | `true` après configuration | `true` après configuration |
| `RESEND_API_KEY` | All scopes sur Free, Functions sur Pro+ | clé Resend | clé Resend de test | clé Resend de test |
| `EMAIL_FROM` | All scopes | expéditeur validé | expéditeur validé | expéditeur validé |
| `OPENAI_API_KEY` | All scopes sur Free, Functions sur Pro+ | clé de production | clé de test limitée | clé de test limitée |
| `OPENAI_VISION_MODEL` | All scopes | `gpt-5.6` | `gpt-5.6` | `gpt-5.6` |
| `CLOUDINARY_CLOUD_NAME` | All scopes | identifiant Cloudinary | identifiant de test | identifiant de test |
| `CLOUDINARY_API_KEY` | All scopes | clé Cloudinary | clé Cloudinary de test | clé Cloudinary de test |
| `CLOUDINARY_API_SECRET` | All scopes sur Free, Functions sur Pro+ | secret Cloudinary | secret Cloudinary de test | secret Cloudinary de test |
| `WEARSONA_CRON_SECRET` | All scopes sur Free, Functions sur Pro+ | secret aléatoire | secret de test | secret de test |

Pour `MONGODB_URI`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY` et
`OPENAI_API_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` et
`WEARSONA_CRON_SECRET`, activez l'option **Contains secret values**.

Netlify réserve la sélection de scopes précis aux offres Pro et Enterprise. Sur
l’offre Free, laissez **All scopes** : une variable serveur ne devient pas
publique pour autant. Seules les variables préfixées par `NEXT_PUBLIC_` sont
intégrées au code envoyé au navigateur par Next.js.

`BETTER_AUTH_SECRET` est obligatoire avant de déployer l'authentification.
Générez des secrets d'au moins 32 caractères avec
`openssl rand -base64 32`. `OPENAI_API_KEY` peut rester absente : l’import
utilise alors seulement l’analyse de nom de fichier. `OPENAI_VISION_MODEL`
n’est pas un secret.

Cloudinary reste facultatif : sans ses trois variables, l’import et l’analyse
OpenAI fonctionnent normalement, mais aucun détourage n’est demandé. Les trois
valeurs sont disponibles dans **Cloudinary Console → Settings → API Keys**.

Générez `WEARSONA_CRON_SECRET` avec `openssl rand -base64 32`. Il autorise
uniquement la fonction Netlify planifiée à lancer la purge quotidienne ; il ne
doit jamais être utilisé dans le navigateur.

Conservez `EMAIL_AUTH_ENABLED=false` jusqu’à ce que le domaine expéditeur soit
validé dans Resend et que `RESEND_API_KEY` et `EMAIL_FROM` soient définies. La
procédure complète se trouve dans [`docs/EMAILS.md`](EMAILS.md).

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

La configuration de Better Auth est détaillée dans
[`docs/AUTHENTICATION.md`](AUTHENTICATION.md).
