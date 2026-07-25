# Product Brief — Vestiaire

| Champ | Valeur |
|---|---|
| Version | 0.1 |
| Statut | Document de cadrage initial |
| Date | 23 juillet 2026 |
| Produit | Vestiaire |
| Responsable produit | Projet personnel |

## 1. Résumé

Vestiaire est un assistant vestimentaire personnel qui aide une personne à
mieux utiliser les vêtements qu’elle possède déjà. Le produit organise la
garde-robe à partir de photographies, propose des associations cohérentes et
identifie les pièces qui augmenteraient réellement le nombre de tenues
possibles.

Le projet est un outil personnel et une étude de cas de portfolio. Il reste
déployé sur le web pour être utilisé par son créateur et présenter son
architecture, mais aucune ouverture publique du service n’est prévue à ce
stade.

## 2. Problème

Une personne peut posséder de nombreux vêtements tout en ayant l’impression de
ne rien avoir à porter. Les pièces sont difficiles à visualiser ensemble, les
associations déjà possibles restent inexploitées et les achats répondent souvent
à une impression de manque plutôt qu’à un besoin réel.

Les outils existants demandent fréquemment une saisie manuelle importante,
proposent des inspirations déconnectées des vêtements possédés ou encouragent
l’achat sans mesurer la complémentarité avec la garde-robe existante.

## 3. Vision

Faire de la garde-robe existante la première source d’inspiration vestimentaire,
avant tout nouvel achat.

À terme, Vestiaire doit être capable de :

1. comprendre automatiquement les vêtements présents sur une photographie ;
2. extraire et présenter chaque pièce proprement ;
3. composer des tenues adaptées au style, à la saison et au contexte ;
4. expliquer pourquoi une association fonctionne ;
5. simuler le rendu d’une tenue sur une représentation de l’utilisateur ;
6. recommander uniquement les achats qui débloquent de nouvelles possibilités.

## 4. Utilisateurs

### Utilisateur principal

Une personne qui souhaite mieux exploiter sa garde-robe, gagner du temps pour
s’habiller et limiter les achats peu utiles.

### Utilisateur initial

Le créateur du produit, qui utilise sa propre garde-robe pour valider les
parcours, la qualité des analyses et la valeur réelle des recommandations.

### Audience secondaire

Les recruteurs, développeurs et designers qui découvrent la vitrine du projet
comme étude de cas, sans accéder aux données personnelles de la garde-robe.

## 5. Jobs to be done

- Lorsque j’ajoute un vêtement, je veux qu’il soit classé automatiquement afin
  de ne pas remplir une fiche complète à la main.
- Lorsque je ne sais pas quoi porter, je veux partir d’une pièce ou d’une allure
  afin d’obtenir une tenue composée uniquement de vêtements que je possède.
- Lorsque l’IA se trompe, je veux corriger facilement ses propositions afin de
  garder le contrôle sur ma garde-robe.
- Lorsque j’envisage un achat, je veux comprendre ce qu’il ajouterait à ma
  garde-robe afin d’éviter les doublons et les achats inutiles.
- Lorsque je découvre le projet, je veux comprendre rapidement le problème
  traité, la solution proposée et les choix techniques réalisés.

## 6. Proposition de valeur

**Vestiaire révèle les tenues déjà présentes dans votre garde-robe et vous aide
à compléter uniquement ce qui manque vraiment.**

### Différenciation

- recommandations fondées sur les vêtements réellement possédés ;
- attributs proposés par l’IA mais toujours modifiables ;
- explication des associations et recommandations ;
- priorité donnée à la réutilisation avant l’achat ;
- prise en compte progressive du style personnel plutôt qu’une application
  uniforme des tendances.

## 7. Principes produit

1. **Contrôle utilisateur** — aucune analyse IA n’est considérée comme
   incontestable.
2. **Explicabilité** — une tenue ou un achat recommandé doit être justifié.
3. **Vie privée par défaut** — les photographies et données corporelles sont
   privées, révocables et supprimables.
4. **Utilité avant engagement** — le produit optimise la garde-robe, pas le temps
   passé dans l’application.
5. **Progression réaliste** — l’essayage 2D est validé avant d’investir dans la
   reconstruction 3D.
6. **Tendances contextualisées** — les tendances complètent les préférences
   personnelles sans les remplacer.

## 8. Périmètre du MVP personnel et portfolio

### Vitrine du portfolio

- page d’accueil présentant la promesse et le concept ;
- présentation visuelle du prototype sans ouverture des données personnelles ;
- présentation du projet comme étude de cas ;
- explication des choix produit, techniques et UX.

### Expérience connectée

- création de compte et connexion ;
- profil utilisateur minimal ;
- garde-robe privée par utilisateur ;
- ajout de plusieurs photographies ;
- stockage persistant des pièces et des images ;
- analyse automatique de la catégorie et des attributs principaux ;
- indication visuelle des attributs proposés par l’analyse ;
- correction manuelle de tous les attributs ;
- filtrage et consultation de la garde-robe ;
- composition d’une tenue autour d’une pièce et d’une allure ;
- suppression d’une pièce et de ses images.

### Fondations techniques

- application Next.js avec App Router ;
- séparation des routes publiques et applicatives ;
- couche d’accès aux données centralisée ;
- base MongoDB Atlas ;
- stockage objet compatible S3 ;
- authentification éprouvée ;
- traitements IA exécutés côté serveur ;
- journalisation des analyses, versions de modèles et corrections.

## 9. Hors périmètre du MVP

- reconstruction 3D fidèle des vêtements ;
- avatar corporel 3D ;
- essayage virtuel garantissant la coupe ou la taille ;
- application mobile native ;
- marketplace intégrée ;
- achats et paiements ;
- ingestion autonome et non contrôlée de l’ensemble du Web ;
- réseau social ou partage public des garde-robes ;
- entraînement d’un modèle propriétaire.

Ces sujets restent dans la roadmap ou dans le laboratoire de recherche.

## 10. Parcours principaux

### Première utilisation

1. L’utilisateur découvre la page publique.
2. Il crée un compte ou se connecte.
3. Il importe quelques photographies.
4. L’application analyse et détoure les pièces.
5. L’utilisateur confirme ou corrige les attributs.
6. Il génère sa première tenue.

### Utilisation régulière

1. L’utilisateur ouvre sa garde-robe.
2. Il filtre ou sélectionne une pièce.
3. Il choisit une allure et éventuellement un contexte.
4. Vestiaire propose une tenue et explique l’association.
5. L’utilisateur conserve, régénère ou ajuste la proposition.

### Recommandation d’achat future

1. Vestiaire analyse la couverture de la garde-robe.
2. Le système détecte les catégories ou associations limitées.
3. Il propose une pièce générique, pas nécessairement un produit marchand.
4. Il affiche les nouvelles tenues rendues possibles.
5. L’utilisateur précise son budget et ses préférences.

## 11. Exigences IA

Chaque analyse doit produire :

- la catégorie de la pièce ;
- une ou plusieurs couleurs ;
- les motifs éventuels ;
- les saisons plausibles ;
- les styles potentiels ;
- un score de confiance par attribut ;
- l’identifiant et la version du modèle ;
- la date de l’analyse.

Le système doit également :

- distinguer les valeurs proposées des valeurs confirmées ;
- ne jamais écraser silencieusement une correction humaine ;
- permettre de relancer une analyse ;
- conserver les erreurs utiles à l’évaluation ;
- mesurer le coût, la latence et la qualité par version de modèle.

## 12. Indicateurs de réussite initiaux

Ces objectifs sont des hypothèses à valider :

| Indicateur | Cible initiale |
|---|---|
| Temps jusqu’à la première tenue | Moins de 10 minutes |
| Import de cinq pièces terminé | Au moins 60 % des nouveaux utilisateurs |
| Catégorie acceptée sans correction | Au moins 85 % |
| Couleur principale acceptée sans correction | Au moins 85 % |
| Import technique réussi | Au moins 98 % |
| Accessibilité | WCAG 2.2 AA sur les parcours principaux |

Les indicateurs de rétention et de recommandation d’achat seront définis après
validation de l’usage personnel et du MVP.

## 13. Architecture cible

Le produit reste initialement un monolithe Next.js modulaire :

```text
Navigateur
    → Next.js (pages, Server Actions, Route Handlers)
        → Authentification
        → Couche d’accès aux données
            → MongoDB Atlas
        → Service de stockage d’images
        → File de traitements
            → Fournisseurs IA
```

Les appels IA passent par une interface interne indépendante du fournisseur.
Les opérations longues, comme le détourage et l’essayage virtuel, doivent être
traitées en arrière-plan plutôt que de bloquer une requête web.

## 14. Organisation des routes

```text
app/
└── [locale]/             # Français et anglais
    ├── (marketing)/      # Pages accessibles sans connexion
    │   └── page.tsx      # /fr et /en
    ├── (auth)/           # Parcours publics de compte
    │   ├── sign-in/
    │   └── sign-up/
    └── (app)/            # Espace personnel protégé
        ├── wardrobe/     # /fr/wardrobe et /en/wardrobe
        ├── studio/       # /fr/studio et /en/studio
        └── profile/      # /fr/profile et /en/profile
```

Chaque page du groupe `(app)` vérifie une session Better Auth côté serveur.
Les utilisateurs, comptes et sessions sont stockés dans MongoDB Atlas. Les
URLs sans langue sont redirigées vers le français ou l’anglais à partir des
préférences du navigateur.

## 15. Données et vie privée

- aucune clé secrète n’est envoyée au navigateur ;
- chaque enregistrement de garde-robe appartient à un utilisateur ;
- les contrôles d’autorisation sont effectués côté serveur et au plus près des
  données ;
- les images originales et dérivées disposent d’une politique de suppression ;
- l’utilisateur peut supprimer son compte et ses données ;
- les données corporelles ne servent pas à entraîner un modèle sans consentement
  distinct et explicite ;
- les simulations visuelles sont présentées comme approximatives ;
- la durée de conservation et les sous-traitants IA sont documentés.

## 16. Risques principaux

| Risque | Réponse |
|---|---|
| Analyse imprécise | Scores de confiance et validation humaine |
| Coût élevé de l’IA | Mesure par analyse, cache et pipeline progressif |
| Images trop volumineuses | Redimensionnement, compression et stockage objet |
| Atteinte à la vie privée | Minimisation, chiffrement, suppression et consentement |
| Essayage visuellement trompeur | Mention explicite de simulation et tests qualité |
| Périmètre trop ambitieux | MVP limité, fonctionnalités R&D séparées |
| Tendances peu fiables | Sources datées, sélectionnées et traçables |

## 17. Roadmap

### Phase 0 — Fondations

- Product Brief ;
- séparation public/application ;
- dépôt GitHub ;
- stratégie de nom et domaine ;
- documentation du projet.

### Phase 1 — MVP Portfolio

- page publique ;
- garde-robe et studio accessibles comme prototype ;
- étude de cas ;
- déploiement initial.

### Phase 2 — Produit connecté

- authentification par e-mail et mot de passe ;
- profil ;
- MongoDB Atlas ;
- stockage objet ;
- suppression définitive de l’ancien stockage local de la garde-robe.

### Phase 3 — Intelligence visuelle

- analyse d’image réelle ;
- détourage ;
- scores de confiance ;
- boucle de correction et évaluation.

### Phase 4 — Recommandations

- graphe de compatibilité ;
- analyse des manques ;
- recommandations explicables ;
- préférences de budget et de consommation.

### Phase 5 — Essayage virtuel

- preuve de concept 2D ;
- évaluation de la fidélité ;
- gestion des données corporelles ;
- étude de viabilité de la 3D.

## 18. Questions ouvertes

- Quel nom définitif et quel positionnement de marque retenir ?
- Le code du portfolio sera-t-il public ou le produit restera-t-il privé ?
- Quel service d’e-mail transactionnel utiliser pour la vérification et la
  récupération de mot de passe ?
- Quelles photographies minimales demander pour une analyse fiable ?
- Quelles sources de tendances peuvent être utilisées légalement ?
- Quel niveau de fidélité rend l’essayage virtuel réellement utile ?
- Faut-il privilégier la seconde main dans les recommandations ?
- Quelle part des recommandations doit être déterministe et explicable ?

## 19. Définition de réussite du MVP

Le MVP est considéré comme réussi lorsqu’un visiteur peut comprendre le produit
depuis la page publique et qu’un utilisateur peut importer plusieurs vêtements,
corriger leur analyse, consulter sa garde-robe et générer une tenue sans aide
extérieure, sur mobile comme sur ordinateur.
