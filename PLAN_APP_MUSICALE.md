# Plan App Musicale

## 1. Ce que contient ce repo

Le projet n'est pas une application unique. C'est un ensemble de prototypes `v0-*`, surtout en Next.js, React et TypeScript, qui servent de banque d'inspiration visuelle et interactive.

### Dossiers racine

| Dossier | Rôle | Intérêt pour l'app musicale |
| --- | --- | --- |
| `.flox/` | Environnement local outillé. | Utile pour la reproductibilité du setup, pas pour l'UI ou l'audio. |
| `.git/` | Historique Git du projet. | Aucun intérêt fonctionnel pour le produit, uniquement pour le versioning. |
| `v0-100-000-particles-visualisation/` | Expérimentation canvas/WebGPU orientée particules massives et réaction à l'audio. | Très utile pour un fond vivant, des halos de notes, ou des traînées de doigt. |
| `v0-3-d-galaxy-page/` | Viewer 3D plein écran avec contrôles, overlay et paramètres. | Utile comme référence d'expérience immersive plein écran, moins pertinent pour un instrument tactile direct. |
| `v0-3-d-galaxy-simulation/` | Scène 3D immersive plus simple, centrée sur le rendu temps réel. | Peut inspirer la profondeur visuelle, mais c'est secondaire pour une V1 musicale. |
| `v0-audio-visualizer/` | Visualiseur audio canvas multi-scènes, lecture audio, analyseur et effets. | Très utile pour la couche visuelle réactive à la fréquence et à l'énergie. |
| `v0-beat-bot/` | Séquenceur/synthé basé sur `Tone.js`, avec presets et transport. | C'est la meilleure base audio actuelle du repo pour la synthèse et le contrôle du son. |
| `v0-folders-ui/` | UI de cartes/dossiers avec animations, apparition, loader, feedback visuel. | Utile pour les futurs écrans de presets, projets, banques de sons ou scènes. |
| `v0-geometric-bb/` | Visualisation WebGL2 temps réel avec toggles d'effets GLSL. | Utile pour des shaders abstraits liés à la hauteur ou au timbre. |
| `v0-geometric-y/` | Visualisation WebGL2 fractale avec contrôle à la souris. | Utile comme inspiration de langage visuel plus organique ou hypnotique. |
| `v0-interactive-v0-piano/` | Piano classique horizontal avec calcul de fréquences et déclenchement audio. | Très utile pour la logique note -> fréquence, mais l'interface devra être entièrement repensée. |
| `v0-logo-particles-gpt-5/` | Particules 2D qui se déforment autour du pointeur/doigt. | Très utile pour les effets de proximité autour du toucher. |
| `v0-music-player-component/` | Composant de player centré sur la présentation et les contrôles média. | Peu utile pour l'instrument, sauf pour l'inspiration du futur panneau de contrôles. |
| `v0-neon-maze/` | Expérience plein écran très graphique, orientée labyrinthe/isométrie néon. | Intérêt surtout esthétique: ambiance, glow, contraste, profondeur. |
| `v0-zikflows-project-card-select/` | Slider plein écran très abouti avec drag, wheel, clavier et fond ambiant dynamique. | Très utile pour la qualité d'interaction plein écran et les transitions d'ambiance. |
| `v0-zikflowz-graphene-3-d-model/` | Modèle 3D instancié performant avec overlay d'information. | Intérêt limité pour la V1, mais bon exemple de performance et d'overlay sur fond 3D. |

### Structure interne récurrente

La plupart des dossiers `v0-*` reprennent la même structure :

| Dossier interne | Rôle |
| --- | --- |
| `app/` | Point d'entrée Next.js, pages et layout. |
| `components/` | Composants UI et blocs d'interaction. |
| `hooks/` | Logique réutilisable de gestes, navigation, animation ou état. |
| `lib/` | Fonctions utilitaires, constantes, données ou logique métier légère. |
| `public/` | Assets statiques. |
| `styles/` | CSS, tokens et styles globaux. |
| `constants/`, `types/`, `data/`, `contexts/` | Dossiers spécialisés présents selon les prototypes. |

## 2. Ce que je garderais pour le nouveau projet

### À reprendre presque tel quel comme référence

1. `v0-beat-bot/`
   Base la plus crédible pour l'audio interactif, l'initialisation du moteur sonore et les paramètres de synthèse.
2. `v0-zikflows-project-card-select/`
   Très bon niveau de finition sur le plein écran, les interactions tactiles et l'ambiance visuelle.
3. `v0-audio-visualizer/`
   Bon réservoir d'idées pour rendre la musique visible, pas seulement audible.
4. `v0-logo-particles-gpt-5/`
   Très bon point de départ pour faire "vivre" la zone autour du doigt.
5. `v0-interactive-v0-piano/`
   À reprendre uniquement pour la logique note/fréquence et certains choix de mapping musical.

### À garder comme inspiration secondaire

1. `v0-100-000-particles-visualisation/`
   Intéressant si on veut une version "spectaculaire GPU", mais probablement trop lourd pour la première itération.
2. `v0-neon-maze/`, `v0-geometric-bb/`, `v0-geometric-y/`
   Bon vocabulaire visuel pour une version plus expérimentale ou performative.
3. `v0-folders-ui/`, `v0-music-player-component/`
   À réutiliser plus tard pour les écrans annexes, pas pour la surface de jeu principale.

### À ne pas utiliser comme base de produit

1. Les démos 3D pures de galaxie et de graphène.
   Elles sont belles, mais elles éloignent le projet de son besoin principal: un instrument tactile immédiat, stable et lisible.

## 3. Direction produit recommandée

### Positionnement

L'application ne doit pas être un "piano dessiné autrement". Elle doit être un instrument tactile continu, où la hauteur, le timbre et l'intensité naissent d'une cartographie spatiale.

### Concept de V1

Une surface musicale plein écran, multitouch, avec :

1. un son continu tant que le doigt reste posé,
2. un arrêt net ou relâché quand le doigt quitte l'écran,
3. une cartographie de la fréquence selon la position,
4. une identité visuelle très lisible autour du point de contact,
5. un panneau secondaire pour les paramètres de timbre et de quantification.

## 4. Interface à explorer

### Option A: arc de cercle harmonique

C'est l'option la plus prometteuse pour la V1.

- La surface principale est un grand arc ou presque un disque.
- Le grave vit plutôt en bas/gauche ou vers l'extérieur.
- L'aigu vit plutôt en haut/droite ou vers le centre.
- La distance au centre peut moduler l'octave.
- L'angle peut moduler la note dans une gamme.
- La couleur et la densité de particules changent selon la hauteur.

Pourquoi c'est fort :

- Le geste est mémorisable.
- On évite l'effet "clavier déguisé".
- On peut jouer en glissé, en pédale, en motifs circulaires.

### Option B: nuage libre sans touches visibles

- Aucun clavier affiché.
- Seulement des halos, particules, gradients et orbites.
- Le mapping musical est caché derrière une grille continue ou une quantification.

Pourquoi c'est intéressant :

- Très beau pour une expérience ambient.
- Plus organique.

Pourquoi je ne le prendrais pas pour la première version :

- Lisibilité musicale plus faible.
- On risque une interface jolie mais difficile à apprendre.

### Option C: spirale / escargot

- Les notes progressent en spirale, avec les aigus vers le centre ou l'extérieur.
- Très cohérent avec la répétition des octaves.

Pourquoi je la garde pour plus tard :

- Excellente idée conceptuellement.
- Plus difficile à rendre immédiatement jouable qu'un arc simple.

### Recommandation

Commencer par un **arc de cercle quantifié**, puis ouvrir un mode **continu/theremin** plus tard.

## 5. Mapping musical recommandé

### Surface de jeu

- `x` ou angle: position dans la gamme
- `y` ou rayon: registre / octave
- pression ou vitesse initiale: attaque / vélocité simulée
- mouvement après contact: vibrato fin, bend ou filtre
- durée de contact: sustain

### Modes musicaux

1. Mode `Quantized`
   La position se cale sur une note d'une gamme.
2. Mode `Continuous`
   La fréquence suit la position de manière continue en Hz.
3. Mode `Chord`
   Une zone déclenche plusieurs fréquences liées.
4. Mode `Drone`
   Appui long avec maintien stable et modulation lente.

## 6. Architecture technique recommandée

### Choix de stack

Pour une première version solide, je recommande :

1. `Expo` comme socle de projet React,
2. `Expo Web` comme première cible d'exécution,
3. `Tone.js` ou moteur Web Audio côté web pour la synthèse de la V1,
4. `React Native Skia` ou canvas/shader selon la cible retenue pour le rendu visuel,
5. `GitHub Actions` pour lint, typecheck et build.

### Pourquoi ce choix

- `Expo` permet de garder une trajectoire iOS / Android / Web.
- La V1 a surtout besoin d'un moteur audio interactif simple à itérer.
- Le web donne une boucle de test très rapide pour le multitouch, le visuel et le mapping.
- `Tauri` est intéressant pour du desktop, mais ce n'est pas le meilleur premier choix si l'instrument doit vivre sur téléphone ou tablette.

### Répartition logique du futur projet

| Domaine | Responsabilité |
| --- | --- |
| `audio/` | oscillateurs, enveloppes, sustain, voix actives, effets |
| `mapping/` | conversion position -> note / fréquence / gamme |
| `visual/` | halos, particules, shaders, feedback de contact |
| `gestures/` | multitouch, drag continu, release, vélocité initiale |
| `controls/` | timbre, gamme, quantification, sustain global, effets |
| `presets/` | scènes sonores et mappings sauvegardés |

## 7. Plan de réalisation

### Phase 0. Cadrage

1. Choisir la cible de V1: web tactile d'abord.
2. Choisir le mapping principal: arc de cercle quantifié.
3. Définir 3 modes seulement pour commencer: `Quantized`, `Continuous`, `Drone`.

### Phase 1. Prototype musical jouable

1. Créer un projet Expo propre.
2. Mettre une surface plein écran sans clavier visible.
3. Gérer un ou plusieurs doigts avec identifiants de contact.
4. Démarrer une voix audio à l'appui.
5. Maintenir la voix tant que le doigt reste posé.
6. Couper proprement la voix au relâchement.
7. Afficher un halo net et lisible sous chaque doigt.

Critère de sortie :
on peut jouer des notes, les maintenir, et faire des motifs rapides.

### Phase 2. Mapping musical propre

1. Construire la carte position -> note/fréquence.
2. Ajouter les gammes majeures, mineures, pentatoniques et chromatiques.
3. Ajouter l'affichage discret des zones de hauteur.
4. Prévoir un snap réglable entre continu et quantifié.

Critère de sortie :
la surface paraît expressive sans devenir confuse.

### Phase 3. Design visuel instrument

1. Ajouter un fond ambiant réactif.
2. Ajouter des particules autour des points de contact.
3. Faire varier la couleur selon la hauteur.
4. Faire varier la matière visuelle selon le timbre.
5. Optimiser pour garder 60 fps sur mobile correct.

Critère de sortie :
le visuel aide le jeu au lieu de le parasiter.

### Phase 4. Contrôles sonores

1. Ajouter un tiroir ou une seconde vue pour les potentiomètres.
2. Paramètres minimum:
   filtre, attaque, release, waveform, réverbération, delay, quantification, gamme.
3. Sauvegarder 3 à 5 presets.

Critère de sortie :
on peut changer radicalement le caractère de l'instrument.

### Phase 5. Produit et build

1. Ajouter lint, typecheck et tests unitaires sur le mapping.
2. Ajouter GitHub Actions.
3. Déclencher build web à chaque PR.
4. Préparer build preview et build release.
5. Si la cible mobile se confirme, brancher EAS ensuite.

## 8. Pipeline GitHub Actions proposé

### Workflow minimum

1. `install`
2. `lint`
3. `typecheck`
4. `test`
5. `build-web`

### Workflow release ensuite

1. build de preview sur `pull_request`
2. build production sur `main`
3. publication web
4. build mobile via EAS plus tard si on garde Expo jusqu'au bout

## 9. Ce que je ferais maintenant

### Décision de base

Je partirais sur :

1. un nouveau projet Expo dédié,
2. une V1 `web first`,
3. une surface en arc de cercle,
4. `Tone.js` pour la première couche de synthèse,
5. reprise d'idées depuis `v0-beat-bot`, `v0-zikflows-project-card-select`, `v0-audio-visualizer` et `v0-logo-particles-gpt-5`.

### Ce que je ne ferais pas maintenant

1. ne pas démarrer par une scène 3D lourde,
2. ne pas démarrer par une spirale complexe,
3. ne pas mélanger tout de suite séquenceur, instrument, sampleur et DAW miniature,
4. ne pas choisir Tauri comme base initiale.

## 10. Résumé très court

Le repo contient plusieurs briques d'inspiration utiles, mais pas une base produit prête à l'emploi. Pour ce projet, la bonne trajectoire est une app Expo orientée web tactile en première étape, avec une surface musicale plein écran en arc de cercle, un moteur audio simple mais expressif, puis une montée progressive vers les particules, les presets et le build CI/CD.
