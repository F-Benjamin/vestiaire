# E-mails d’authentification

Vestiaire utilise Resend pour envoyer les validations d’adresse et les liens de
réinitialisation du mot de passe. Aucun secret n’est enregistré dans Git.

## 1. Préparer Resend

1. Créez ou ouvrez votre compte sur Resend.
2. Dans **Domains**, ajoutez le domaine qui servira à l’envoi.
3. Ajoutez chez votre registrar les enregistrements DNS fournis par Resend.
4. Attendez que le domaine apparaisse comme validé.
5. Dans **API Keys**, créez une clé limitée à l’envoi d’e-mails et à ce domaine.
6. Copiez la clé une seule fois dans votre gestionnaire de secrets.

Pendant la mise au point, l’adresse de test Resend peut être utilisée selon les
limites de votre compte. Pour un envoi à de vrais utilisateurs, utilisez un
expéditeur rattaché à votre domaine validé.

## 2. Configurer Netlify

Dans `Project configuration → Environment variables`, créez :

| Variable | Exemple | Secrète |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_…` | oui |
| `EMAIL_FROM` | `Vestiaire <auth@example.com>` | non |
| `EMAIL_AUTH_ENABLED` | `true` | non |

Commencez par définir les valeurs sur les Deploy Previews. Testez l’inscription,
la validation et la récupération du mot de passe, puis reportez la configuration
en production.

Sur l’offre Netlify Free, **All scopes** est acceptable : ces variables restent
côté serveur car leur nom ne commence pas par `NEXT_PUBLIC_`.

Après chaque modification, déclenchez un nouveau déploiement.

## 3. Configurer le développement local

Dans `.env.local` :

```dotenv
EMAIL_AUTH_ENABLED=true
RESEND_API_KEY=re_votre_cle
EMAIL_FROM=Vestiaire <auth@votre-domaine.fr>
```

Ne copiez jamais ces valeurs réelles dans `.env.example`.

## 4. Vérifier le parcours

1. Créez un compte avec une adresse à laquelle vous avez accès.
2. Vérifiez que la connexion est refusée tant que l’adresse n’est pas validée.
3. Ouvrez le lien reçu, puis connectez-vous.
4. Déconnectez-vous et utilisez **Mot de passe oublié ?**.
5. Choisissez un nouveau mot de passe.
6. Vérifiez que l’ancien mot de passe ne fonctionne plus.

Les liens de validation et de réinitialisation expirent après une heure. Une
réinitialisation révoque aussi les sessions existantes.

## 5. En cas d’échec

Consultez les logs de la fonction Netlify et l’activité Resend. L’application
journalise uniquement le type d’e-mail et le message d’erreur du fournisseur :
elle ne journalise ni l’adresse du destinataire, ni le jeton, ni le lien.

Si l’envoi doit être désactivé temporairement, passez
`EMAIL_AUTH_ENABLED=false` et redéployez. Les écrans de connexion continueront
de fonctionner, mais les nouveaux comptes ne nécessiteront plus de validation
tant que la fonction restera désactivée.
