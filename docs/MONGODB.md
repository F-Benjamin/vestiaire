# MongoDB Atlas

Cette étape prépare le stockage persistant de Vestiaire sans exposer la base
directement au navigateur. L’API privée des vêtements est maintenant reliée à
MongoDB et rattache chaque requête à l’utilisateur connecté. L’interface charge
les pièces depuis MongoDB et enregistre toutes les mutations via cette API.

## 1. Créer le projet Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Créez une organisation, puis un projet nommé `today-wardrobe`.
3. Créez un cluster gratuit.
4. Choisissez une région européenne proche des fonctions Netlify.

Un seul cluster suffit pour le MVP. Les données restent isolées grâce à trois
bases :

| Environnement | Base |
| --- | --- |
| Développement local | `vestiaire_dev` |
| Deploy Previews | `vestiaire_preview` |
| Production | `vestiaire` |

## 2. Créer l'utilisateur applicatif

Dans `Security → Database Access` :

1. créez un utilisateur dédié à l'application, et non votre compte personnel ;
2. générez un mot de passe long et unique ;
3. accordez-lui uniquement le rôle `readWrite` sur les bases utilisées ;
4. conservez le mot de passe dans un gestionnaire de mots de passe.

Pour renforcer l'isolation, créez à terme un utilisateur distinct pour la
production et un autre pour le développement et les previews.

## 3. Autoriser les connexions réseau

Dans `Security → Network Access` :

- ajoutez votre adresse IP actuelle pour le développement local ;
- pour les fonctions Netlify du MVP, ajoutez temporairement `0.0.0.0/0`.

Cette seconde règle autorise une tentative de connexion depuis n'importe quelle
adresse IP. Elle ne donne cependant pas accès à la base sans l'URI, le nom
d'utilisateur et le mot de passe. Elle est nécessaire sur l'offre Netlify
standard car les adresses IP sortantes des fonctions peuvent changer.

Mesures compensatoires obligatoires :

- mot de passe unique et robuste ;
- droits `readWrite` limités aux bases de l'application ;
- URI présente uniquement dans les variables serveur ;
- option **Contains secret values** activée dans Netlify ;
- rotation immédiate du mot de passe en cas de fuite ;
- suppression de `0.0.0.0/0` lors du passage à une solution avec IP sortantes
  fixes ou connectivité privée.

## 4. Récupérer l'URI

Dans `Database → Connect → Drivers` :

1. sélectionnez le pilote Node.js ;
2. copiez l'URI commençant par `mongodb+srv://` ;
3. remplacez le mot de passe dans l'URI ;
4. ne copiez jamais cette URI dans Git, une capture d'écran, un ticket ou une
   conversation.

Si le mot de passe contient des caractères spéciaux, utilisez la version
encodée proposée par Atlas ou encodez ces caractères pour une URL.

## 5. Configurer le développement local

Créez `.env.local` à partir du modèle :

```bash
cp .env.example .env.local
```

Puis renseignez :

```dotenv
APP_ENV=development
MONGODB_URI=mongodb+srv://UTILISATEUR:MOT_DE_PASSE@CLUSTER/...
MONGODB_DB_NAME=vestiaire_dev
```

Redémarrez `npm run dev`, puis ouvrez :

```text
http://localhost:3000/api/health/database
```

La réponse attendue est :

```json
{
  "status": "ok",
  "database": "connected",
  "environment": "development"
}
```

## 6. Configurer Netlify

Dans `Project configuration → Environment variables`, ajoutez :

| Variable | Production | Deploy Previews et branches |
| --- | --- | --- |
| `MONGODB_URI` | URI de production | URI de test |
| `MONGODB_DB_NAME` | `vestiaire` | `vestiaire_preview` |

Sur l'offre Free, conservez `All scopes`. Activez **Contains secret values**
pour `MONGODB_URI`, puis déclenchez un nouveau déploiement.

Vérifiez ensuite :

```text
https://todaywardrobe.netlify.app/api/health/database
```

L'endpoint ne renvoie jamais l'URI, le nom du cluster ou les identifiants.

## Architecture ajoutée au projet

- `lib/mongodb/client.ts` crée et réutilise le pool de connexions ;
- `lib/environment/mongodb.ts` valide la configuration serveur ;
- `lib/schemas/garment.ts` valide les données métier avec Zod ;
- `lib/repositories/garment-repository.ts` centralise l'accès aux vêtements ;
- `app/api/garments/**` expose le CRUD uniquement aux utilisateurs connectés ;
- `app/api/health/database/route.ts` vérifie la connexion sans exposer de
  secret.

Les opérations de lecture et d'écriture ne sont pas publiques. Elles ignorent
tout propriétaire envoyé par le client et utilisent obligatoirement
l'identifiant issu de la session Better Auth.
