# Authentification

Vestiaire utilise Better Auth avec l'adaptateur MongoDB officiel. Auth.js
recommande Better Auth pour les nouveaux projets ; ce choix évite de démarrer
avec `next-auth@beta` puis d'organiser une migration.

## Fonctionnalités actuelles

- inscription par nom, e-mail et mot de passe ;
- connexion et déconnexion ;
- validation de l’adresse e-mail avant la première connexion ;
- récupération et réinitialisation du mot de passe ;
- modification du nom et du mot de passe depuis le profil ;
- consultation et révocation des sessions actives ;
- suppression du compte avec confirmation du mot de passe ;
- sessions persistantes pendant sept jours ;
- mots de passe hachés avec `scrypt` par Better Auth ;
- limitation des tentatives stockée dans MongoDB ;
- protection serveur de `/[locale]/wardrobe`, `/[locale]/studio` et
  `/[locale]/profile` ;
- retour à la page initialement demandée après la connexion ;
- écrans français et anglais, accessibles en thème clair ou sombre.

L'inscription ne connecte pas immédiatement l'utilisateur. Un lien de
validation valable une heure est envoyé par Resend. Une tentative de connexion
avec une adresse non validée renvoie un message générique et déclenche un
nouvel envoi.

La récupération du mot de passe renvoie toujours la même confirmation, que
l’adresse soit connue ou non. Le lien expire après une heure et toutes les
sessions existantes sont révoquées lorsque le mot de passe est remplacé.

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

## Envoi des e-mails

Les parcours e-mail sont activés uniquement lorsque
`EMAIL_AUTH_ENABLED=true`. Cette activation nécessite aussi :

- `RESEND_API_KEY`, une clé API privée Resend ;
- `EMAIL_FROM`, un expéditeur appartenant à un domaine validé, par exemple
  `Vestiaire <auth@example.com>`.

Si l’activation reste à `false`, les inscriptions et connexions existantes
continuent de fonctionner sans validation d’adresse et le lien « Mot de passe
oublié ? » n’est pas affiché. Ce garde-fou permet aux builds CI et aux previews
de fonctionner avant la configuration du fournisseur.

Les e-mails sont planifiés avec `after()` de Next.js. La réponse
d’authentification n’attend donc pas le fournisseur, ce qui limite les écarts de
temps susceptibles de révéler l’existence d’un compte. Les erreurs d’envoi sont
consignées sans adresse, jeton ni URL.

La procédure Resend et Netlify est détaillée dans
[`docs/EMAILS.md`](EMAILS.md).

## Limites volontaires du MVP

L’authentification sociale, les clés d’accès et la double authentification ne
font pas encore partie du MVP.

Les vêtements et leurs photographies sont reliés à l’utilisateur connecté via
les API privées. Aucune donnée de garde-robe n’est conservée dans
`localStorage`.

Le changement de mot de passe demande le mot de passe actuel et révoque les
autres sessions. La suppression du compte demande également le mot de passe,
puis supprime les données Better Auth, les vêtements MongoDB et les
photographies Netlify Blobs. Le détail des parcours se trouve dans
[`docs/PROFILE.md`](PROFILE.md).
