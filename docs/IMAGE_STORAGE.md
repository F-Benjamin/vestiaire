# Stockage privé des photographies

Les photographies sont stockées dans Netlify Blobs, dans le store
`wardrobe-images`. MongoDB conserve uniquement une clé opaque associée à chaque
vêtement.

## Pourquoi Netlify Blobs

Le stockage est intégré à l’hébergement Netlify et ne demande aucune variable
secrète supplémentaire en production. Les Route Handlers Next.js restent le
seul point d’accès : le navigateur ne reçoit aucun jeton Netlify.

Cette première intégration privilégie la confidentialité. Une photographie
n’est pas publique et ne peut être téléchargée que par son propriétaire
connecté.

Netlify présente encore Blobs comme une fonctionnalité bêta. Toute son
utilisation est donc isolée dans `lib/storage/wardrobe-image-store.ts` afin de
pouvoir remplacer le fournisseur sans réécrire les routes métier.

Le `package.json` force temporairement `@opentelemetry/core` en version `2.9.0`
pour corriger un avis de sécurité présent dans la dépendance transitive de
`@netlify/blobs`. Cet override devra être retiré lorsque Netlify alignera
directement sa dépendance.

## Contraintes

- formats acceptés : JPEG, PNG et WebP ;
- taille maximale : 4 Mo par fichier ;
- quota : 500 photographies par compte ;
- validation des octets de signature du fichier côté serveur ;
- nom original non conservé dans les métadonnées ;
- clés regroupées sous un préfixe dérivé par SHA-256 de l’utilisateur ;
- lecture avec `Cache-Control: private` et `X-Content-Type-Options: nosniff`.

La limite de 4 Mo reste volontairement sous la limite effective d’environ
4,5 Mo des fichiers binaires reçus par une fonction Netlify.

## Routes

| Méthode | Route | Usage |
| --- | --- | --- |
| `POST` | `/api/wardrobe-images` | Upload multipart avec le champ `file` |
| `GET` | `/api/wardrobe-images/:key` | Lecture privée de la photographie |
| `DELETE` | `/api/wardrobe-images/:key` | Suppression d’un upload orphelin |

L’upload renvoie :

```json
{
  "data": {
    "key": "…",
    "url": "/api/wardrobe-images/…",
    "contentType": "image/jpeg",
    "size": 123456
  }
}
```

La clé peut ensuite être envoyée dans `imageKey` lors de la création ou de la
modification d’un vêtement. Le serveur vérifie son propriétaire avant toute
écriture MongoDB.

Lorsqu’une photo est remplacée ou qu’un vêtement est supprimé, l’ancien blob
est supprimé s’il n’est plus référencé par une autre pièce. La suppression
directe d’une photo encore utilisée reçoit un statut `409`. Une erreur de
nettoyage est journalisée sans empêcher la suppression du vêtement.

La suppression du compte parcourt le préfixe privé de l’utilisateur et efface
les blobs par lots limités afin d’éviter une rafale de requêtes au fournisseur.

## Développement local

Netlify Dev utilise un store local isolé de la production :

```bash
npx netlify dev
```

À la première utilisation, la CLI peut demander d’associer le dossier au
projet Netlify `todaywardrobe`. Les uploads locaux ne lisent ni ne modifient les
blobs de production.

`npm run dev` reste utilisable pour les écrans qui n’accèdent pas aux blobs,
mais l’upload nécessite le contexte fourni par Netlify Dev.

Références officielles :

- [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/) ;
- [développement local avec Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/local-development/) ;
- [limites des fonctions Netlify](https://docs.netlify.com/build/functions/configuration/).

## Sécurité des mutations

Les routes `POST`, `PATCH` et `DELETE` vérifient désormais l’en-tête `Origin`
en plus de la session Better Auth. Cela protège les cookies de session contre
les requêtes intersites. Un client serveur-à-serveur devra, plus tard, utiliser
une authentification dédiée plutôt que de reproduire un cookie navigateur.
