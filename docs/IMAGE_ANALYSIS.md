# Analyse visuelle des vêtements

## Objectif de la phase 3.1

À l’import d’une photo, Wearsona propose les attributs d’une pièce : catégorie,
couleurs, saisons, styles et motifs. Chaque groupe de valeurs est accompagné
d’un score de confiance compris entre `0` et `1`.

Cette phase ne détoure pas encore les vêtements et ne produit pas de rendu 3D.
L’analyse visuelle est synchrone ; le détourage est asynchrone et conçu pour
les imports personnels actuels.

## Flux privé

1. Le navigateur convertit chaque photo en JPEG optimisé de 2 Mo maximum.
2. Le navigateur envoie la photo à `POST /api/analyze` avec la session active.
3. La route vérifie l’origine et la session, puis transmet l’image en data URL
   à l’API Responses d’OpenAI.
4. OpenAI renvoie un JSON contraint au catalogue Wearsona.
5. La photo optimisée est ensuite stockée de façon privée dans Netlify Blobs et les
   métadonnées dans MongoDB.

## Détourage Cloudinary

Après la création d’une pièce, Wearsona envoie une copie temporaire de
l’original privé à Cloudinary avec le type de livraison `authenticated`.
Wearsona demande ensuite une transformation moderne pré-générée (`eager`) de
détourage et vérifie périodiquement si le PNG transparent est prêt. Cette
stratégie est nécessaire pour conserver la protection `authenticated` des
assets temporaires. Lorsqu’il l’est, Wearsona le rapatrie dans Netlify Blobs
puis efface l’actif temporaire Cloudinary. Aucun webhook public n’est
nécessaire.

Si l’original dépasse 9 Mo, Wearsona crée uniquement pour Cloudinary une copie
JPEG optimisée et redimensionnée si besoin. L’original privé stocké dans
Netlify Blobs reste inchangé.

Un PNG transparent peut être bien plus lourd que la photo JPEG reçue. Avant de
stocker un détourage de plus de 4 Mo, Wearsona le convertit localement en WebP
transparent, avec redimensionnement progressif si nécessaire. Cela préserve la
transparence tout en respectant la limite de stockage.

L’interface affiche l’état du traitement et la qualité estimée par Cloudinary.
L’utilisateur peut alors valider la version détourée. Cette validation la rend
principale et programme la suppression de l’original privé après 30 jours. Une
tâche planifiée Netlify s’exécute chaque jour pour effectuer cette purge.

La requête OpenAI utilise `store: false`. Wearsona ne crée pas d’URL publique
pour analyser une photographie et ne stocke jamais une image en base64 dans
MongoDB.

## Contrôle de l’utilisateur

Les valeurs encore issues de l’analyse affichent une étoile dans le studio.
Modifier un attribut retire l’étoile de ce groupe de valeurs, immédiatement
dans l’interface puis durablement dans MongoDB. L’analyse n’écrase jamais une
correction manuelle.

## Configuration

Ajoutez ces variables uniquement côté serveur :

```bash
OPENAI_API_KEY=...
OPENAI_VISION_MODEL=gpt-5.6
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
WEARSONA_CRON_SECRET=...
```

`OPENAI_VISION_MODEL` est facultative. Sans `OPENAI_API_KEY`, ou si OpenAI ne
répond pas, l’import reste fonctionnel grâce à l’analyse de nom de fichier.
Sans les trois variables Cloudinary, le détourage est signalé comme indisponible
et l’original reste utilisé.

## Limites actuelles

- une seule pièce doit être visible par photographie pour une analyse fiable ;
- les propositions doivent être vérifiées par l’utilisateur ;
- la confiance est une estimation du modèle, pas une mesure de vérité ;
- l’analyse ne garde pas les corrections comme données d’entraînement ;
- le détourage ne remplace jamais l’original avant validation utilisateur.
