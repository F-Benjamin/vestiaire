# Centre de profil

La route privée `/[locale]/profile` regroupe les réglages utiles à
l’utilisation personnelle de Vestiaire. Elle est accessible depuis l’avatar
dans l’en-tête.

## Fonctionnalités

### Identité

- affichage du nom, de l’adresse e-mail et de son état de validation ;
- date de création du compte ;
- modification du nom avec `authClient.updateUser` ;
- compteur de pièces et de photographies.

L’adresse e-mail reste en lecture seule. Le changement d’adresse n’est pas
activé tant que l’application utilise le domaine de test Resend.

### Préférences

- choix du thème système, clair ou sombre ;
- choix de la langue française ou anglaise ;
- application immédiate sans rechargement complet.

Ces préférences restent volontairement dans le navigateur. Elles ne contiennent
aucune donnée de garde-robe et ne nécessitent pas de nouvelle collection.

### Sécurité

- confirmation du mot de passe actuel ;
- nouveau mot de passe de 12 à 128 caractères ;
- double saisie du nouveau mot de passe ;
- révocation automatique des autres sessions après modification.

Better Auth effectue la vérification et le hachage côté serveur. Aucun mot de
passe ne traverse une route applicative personnalisée.

### Appareils connectés

- liste des sessions actives ;
- identification indicative du navigateur et du type d’appareil ;
- date de dernière activité et d’expiration ;
- fermeture d’une session distante ;
- fermeture de toutes les autres sessions.

Les jetons nécessaires à la révocation sont obtenus directement auprès de
Better Auth après le chargement de la page. Ils ne sont ni affichés, ni inclus
dans le HTML rendu par le serveur.

### Données

`GET /api/account/export` télécharge un JSON privé contenant :

- le profil non sensible ;
- les attributs du catalogue ;
- les dates de création et de modification ;
- l’indication de présence d’une photographie.

Le fichier exclut les identifiants de propriétaire, clés de stockage, jetons de
session et fichiers photographiques.

### Suppression du compte

La suppression demande :

1. l’adresse e-mail exacte du compte ;
2. le mot de passe actuel ;
3. une confirmation explicite dans une boîte de dialogue modale.

Better Auth supprime l’utilisateur, ses comptes et ses sessions. Le callback de
nettoyage supprime ensuite ses vêtements MongoDB et ses photographies Netlify
Blobs. Les erreurs de nettoyage sont journalisées sans identifiant utilisateur.

## Accessibilité

- structure par sections et titres ;
- navigation d’ancrage ;
- retours d’erreur avec `role="alert"` ;
- confirmations avec `role="status"` ;
- champs associés à leurs libellés ;
- focus visible et boîte de dialogue native ;
- mise en page adaptée au clavier, mobile et zoom ;
- animations respectant `prefers-reduced-motion`.
