# Authentification

Vestiaire utilise Better Auth avec l'adaptateur MongoDB officiel. Auth.js
recommande Better Auth pour les nouveaux projets ; ce choix évite de démarrer
avec `next-auth@beta` puis d'organiser une migration.

## Fonctionnalités actuelles

- inscription par nom, e-mail et mot de passe ;
- connexion et déconnexion ;
- sessions persistantes pendant sept jours ;
- mots de passe hachés avec `scrypt` par Better Auth ;
- limitation des tentatives stockée dans MongoDB ;
- protection serveur de `/[locale]/wardrobe` et `/[locale]/studio` ;
- retour à la page initialement demandée après la connexion ;
- écrans français et anglais, accessibles en thème clair ou sombre.

L'inscription ne connecte pas immédiatement l'utilisateur. Ce comportement
évite de confirmer publiquement si une adresse e-mail possède déjà un compte.

## Collections MongoDB

Better Auth gère les collections suivantes :

- `user` ;
- `account` ;
- `session` ;
- `verification` ;
- `rateLimit`.

L'application crée les index recommandés sur l'e-mail, les comptes, les
utilisateurs de session, les jetons de session et les vérifications.

## Secret de production

`BETTER_AUTH_SECRET` sert à signer et chiffrer les éléments sensibles de
l'authentification. Il doit contenir au moins 32 caractères aléatoires.

Générez un secret dans votre terminal :

```bash
openssl rand -base64 32
```

Copiez directement le résultat dans Netlify :

`Project configuration → Environment variables → BETTER_AUTH_SECRET`

Configuration recommandée :

| Contexte | Valeur |
| --- | --- |
| Production | secret de production |
| Deploy Previews | secret de test distinct |
| Branch deploys | même secret de test |

Activez **Contains secret values**. Ne transmettez pas les secrets dans une
conversation et ne les ajoutez jamais dans Git.

Le développement local utilise une valeur réservée à l'ordinateur si aucune
variable n'est définie. Vous pouvez aussi générer un secret distinct et le
placer dans `.env.local`.

## Domaines autorisés

Better Auth utilise une URL de base dynamique limitée à :

- `localhost:3000` ;
- `todaywardrobe.netlify.app` ;
- les Deploy Previews propres à `todaywardrobe.netlify.app`.

Cette liste permet aux previews Netlify de fonctionner sans accepter un
en-tête d'hôte arbitraire.

## Limites volontaires du MVP

La vérification de l'adresse e-mail et la réinitialisation du mot de passe
nécessitent un service d'envoi d'e-mails. Elles seront ajoutées avant une
ouverture publique plus large.

Les vêtements et leurs photographies sont reliés à l’utilisateur connecté via
les API privées. Aucune donnée de garde-robe n’est conservée dans
`localStorage`.
