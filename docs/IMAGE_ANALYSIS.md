# Analyse visuelle des vêtements

## Objectif de la phase 3.1

À l’import d’une photo, Wearsona propose les attributs d’une pièce : catégorie,
couleurs, saisons, styles et motifs. Chaque groupe de valeurs est accompagné
d’un score de confiance compris entre `0` et `1`.

Cette phase ne détoure pas encore les vêtements et ne produit pas de rendu 3D.
Elle est synchrone et conçue pour les imports personnels actuels ; un worker
sera préférable avant des traitements volumineux ou ouverts au public.

## Flux privé

1. Le navigateur envoie la photo à `POST /api/analyze` avec la session active.
2. La route vérifie l’origine et la session, puis transmet l’image en data URL
   à l’API Responses d’OpenAI.
3. OpenAI renvoie un JSON contraint au catalogue Wearsona.
4. La photo est ensuite stockée de façon privée dans Netlify Blobs et les
   métadonnées dans MongoDB.

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
```

`OPENAI_VISION_MODEL` est facultative. Sans `OPENAI_API_KEY`, ou si OpenAI ne
répond pas, l’import reste fonctionnel grâce à l’analyse de nom de fichier.

## Limites actuelles

- une seule pièce doit être visible par photographie pour une analyse fiable ;
- les propositions doivent être vérifiées par l’utilisateur ;
- la confiance est une estimation du modèle, pas une mesure de vérité ;
- l’analyse ne garde pas les corrections comme données d’entraînement.
