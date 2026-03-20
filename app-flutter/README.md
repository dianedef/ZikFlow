# app-flutter

Base Flutter pour la V1 de l'instrument tactile Zikflow.

## Objectif

Construire une surface musicale plein ecran avec :

- mapping spatial de la frequence,
- sustain tant que le doigt reste pose,
- multitouch,
- visualisation immediate autour des points de contact,
- futurs controles de timbre et presets.

## Etat actuel

- structure Flutter initiale manuelle,
- ecran plein ecran de V1,
- surface instrument en arc de cercle,
- mapping visuel preliminaire,
- GitHub Action de CI ajoutee au repo.

## Quand le SDK Flutter est installe

```bash
cd app-flutter
flutter pub get
flutter run -d chrome
```
