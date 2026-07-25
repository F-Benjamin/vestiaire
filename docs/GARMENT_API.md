# API privée des vêtements

L’API `/api/garments` persiste les métadonnées des vêtements dans MongoDB.
Toutes ses routes exigent une session Better Auth valide et déduisent le
propriétaire de cette session. Le client ne peut jamais choisir ou modifier un
`ownerId`.

## Contrat

Un vêtement accepté par l’API possède la forme suivante :

```json
{
  "name": "Blazer beige",
  "category": "Vestes",
  "colors": ["Beige"],
  "seasons": ["Automne", "Hiver"],
  "styles": ["Travail", "Chic"],
  "patterns": ["Uni"],
  "imageUrl": null
}
```

`imageUrl` accepte uniquement une URL `https://` ou `http://`, ou `null`. Les
images encodées en base64 et les URL `data:` sont refusées : elles ne doivent
pas être stockées dans MongoDB. Un futur service de stockage objet fournira
l’URL persistante.

Les réponses utilisent une enveloppe `{ "data": ... }`. Un vêtement renvoyé
contient également `id`, `createdAt` et `updatedAt`, mais jamais `ownerId`.

## Routes

| Méthode | Route | Résultat |
| --- | --- | --- |
| `GET` | `/api/garments` | Liste les vêtements de l’utilisateur connecté |
| `POST` | `/api/garments` | Crée un vêtement, statut `201` |
| `PATCH` | `/api/garments/:id` | Modifie les attributs fournis |
| `DELETE` | `/api/garments/:id` | Supprime le vêtement, statut `204` |

Les modifications partielles acceptent un ou plusieurs attributs du contrat.
Les attributs inconnus, les tableaux vides, les doublons et les valeurs hors
catalogue sont rejetés avec un statut `400`.

## Sécurité

- une requête sans session reçoit `401 UNAUTHORIZED` ;
- toutes les lectures et écritures filtrent par `ownerId` côté serveur ;
- un identifiant invalide, inexistant ou appartenant à un autre utilisateur
  reçoit le même `404 GARMENT_NOT_FOUND` ;
- les erreurs internes ne renvoient ni secret ni détail MongoDB ;
- la liste est actuellement limitée aux 200 vêtements les plus récemment
  modifiés.

Cette réponse `404` uniforme évite de révéler si un vêtement appartient à un
autre compte.

## État de la migration

Le catalogue visible continue temporairement à utiliser `localStorage`, car il
contient aujourd’hui les photos sous forme de données locales. La prochaine
étape est de mettre en place le stockage objet et son upload signé, puis de
brancher `WardrobeContext` sur cette API sans envoyer les images à MongoDB.
