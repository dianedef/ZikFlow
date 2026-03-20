# Plan App Musicale Flutter

## Décision

Oui, construire la V1 en `Flutter` puis la builder via `GitHub Actions` est tout à fait possible.

La bonne lecture du repo devient :

- `archive-javascript/` = archive d'inspiration visuelle et produit
- futur dossier Flutter = base réelle du produit

## Ce que valent encore les anciens prototypes

Les anciens projets JavaScript restent utiles pour :

1. le design d'interface,
2. les gestes plein écran,
3. le mapping musical,
4. les idées de rendu visuel,
5. les paramètres audio et de synthèse.

Ils ne servent plus comme base technique directe.

## Recommandation de stack Flutter

### Base

1. `Flutter`
2. `Dart`
3. cibles initiales : `Android`, `iOS`, `Web`, puis `macOS`/`Windows` si besoin

### Audio

Pour une V1 instrumentale, il faudra distinguer deux besoins :

1. lecture simple d'audio,
2. synthèse temps réel / fréquence continue.

La V1 décrite ici ressemble plus à un **instrument de synthèse** qu'à un player. Il faut donc prévoir soit :

1. un moteur audio Flutter/Dart orienté synthèse temps réel,
2. soit un pont natif si un package Dart seul est insuffisant pour la qualité attendue.

Conclusion pratique :

- Flutter est un bon choix produit et UI.
- La partie audio est le vrai point technique à valider tôt avec un prototype minimal.

## Interface recommandée

Je garde la même recommandation produit :

1. surface plein écran,
2. pas de clavier horizontal,
3. cartographie en **arc de cercle harmonique**,
4. sustain tant que le doigt reste posé,
5. arrêt du son au relâchement,
6. panneau secondaire pour timbre, filtre, quantification et effets.

## Architecture Flutter proposée

### Dossiers

| Dossier | Rôle |
| --- | --- |
| `lib/app/` | shell de l'application, thème, routing |
| `lib/features/instrument/` | surface de jeu musicale |
| `lib/features/audio/` | moteur audio, voix actives, enveloppes |
| `lib/features/mapping/` | conversion position -> note / fréquence |
| `lib/features/visuals/` | halos, particules, shaders, feedback |
| `lib/features/controls/` | potentiomètres, réglages, presets |
| `lib/shared/` | types, constantes, utilitaires |
| `test/` | tests unitaires du mapping et logique audio |

### Briques Flutter à privilégier

1. `CustomPainter` pour une V1 lisible et performante
2. `GestureDetector` ou `Listener` pour le multitouch
3. `AnimationController` si nécessaire pour les transitions pilotées
4. shaders ou rendu avancé plus tard, pas avant la première version jouable

## Plan de réalisation

### Phase 0. Validation technique audio

1. créer un projet Flutter neuf,
2. afficher une surface plein écran,
3. capter un doigt,
4. démarrer un son,
5. maintenir le sustain,
6. couper proprement au relâchement,
7. vérifier la latence sur mobile et web.

Critère de sortie :
on sait que Flutter convient réellement à l'instrument.

### Phase 1. Surface jouable

1. construire l'arc de cercle,
2. mapper angle/rayon vers note et octave,
3. afficher un halo sous le doigt,
4. gérer plusieurs doigts,
5. stabiliser le comportement du sustain.

### Phase 2. Expression

1. mode quantifié,
2. mode continu,
3. vibrato fin par glissement,
4. modulation de timbre,
5. premières particules et couleurs.

### Phase 3. Contrôles

1. panneau de potentiomètres,
2. presets,
3. gamme,
4. snap,
5. filtre, attack, release, reverb, delay.

### Phase 4. Produit

1. tests,
2. optimisation,
3. builds de preview,
4. packaging release.

## GitHub Actions

Oui, le pipeline reste possible.

### CI minimum

1. installation du SDK Flutter
2. `flutter pub get`
3. `flutter analyze`
4. `dart format --output=none --set-exit-if-changed .`
5. `flutter test`
6. `flutter build web`

### Ensuite

1. build Android sur tags ou `main`
2. build iOS si runner macOS disponible
3. artefacts attachés aux workflows

## Recommandation nette

Si ton objectif est :

1. une vraie app mobile,
2. potentiellement desktop,
3. une base unique UI/produit,

alors Flutter est un choix cohérent.

Mais il faut **prototyper l'audio en premier**, parce que c'est le risque principal du projet, pas l'interface.
