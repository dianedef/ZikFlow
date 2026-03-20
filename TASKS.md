# Tasks — ZikFlow

> **Priority:** 🔴 P0 blocker · 🟠 P1 high · 🟡 P2 normal · 🟢 P3 low · ⚪ deferred
> **Status:** 📋 todo · 🔄 in progress · ✅ done · ⛔ blocked · 💤 deferred

_Last updated: 2026-03-20_

---

> **⚠️ Blocker Flutter SDK**
>
> Tant que le SDK Flutter n'a pas généré le vrai projet Android dans `app-flutter/`
> avec les dossiers `android/`, `ios/`, `web/`, etc. et le reste du scaffold complet,
> le workflow CI (`flutter-ci.yml`) ne passera pas jusqu'au bout.
> La CI est prête (format, analyze, test, build APK, upload artifact), mais le projet
> Flutter est encore un squelette manuel — il manque les dossiers platform générés par
> `flutter create`.
>
> **Action requise :** exécuter `flutter create --project-name zikflow_instrument .`
> depuis `app-flutter/` sur une machine avec le SDK Flutter installé.

---

## Fait

| Pri | Task | Status |
|-----|------|--------|
| 🟠 | Auditer le repo initial et identifier les prototypes utiles | ✅ done |
| 🟠 | Archiver les anciens prototypes JavaScript dans `archive-javascript/` | ✅ done |
| 🟠 | Rédiger un plan produit/tech React dans `PLAN_APP_MUSICALE.md` | ✅ done |
| 🟠 | Rédiger un plan produit/tech Flutter dans `PLAN_APP_MUSICALE_FLUTTER.md` | ✅ done |
| 🔴 | Créer un squelette Flutter dans `app-flutter/` | ✅ done |
| 🟠 | Ajouter une première surface musicale plein écran | ✅ done |
| 🟡 | Ajouter un mapping visuel position → note / fréquence | ✅ done |
| 🟡 | Ajouter une première CI GitHub Actions Flutter | ✅ done |

---

## Setup SDK & Validation

| Pri | Task | Status |
|-----|------|--------|
| 🔴 | Installer le SDK Flutter sur le serveur de dev | ⛔ blocked |
| 🔴 | Générer le scaffold complet (`flutter create`) — dossiers `android/`, `ios/`, `web/` | ⛔ blocked |
| 🔴 | Exécuter `flutter pub get` | ⛔ blocked |
| 🟠 | Exécuter `dart format` | ⛔ blocked |
| 🟠 | Exécuter `flutter analyze` | ⛔ blocked |
| 🟠 | Exécuter `flutter test` | ⛔ blocked |
| 🟠 | Exécuter `flutter build web` | ⛔ blocked |

---

## Produit — Audio temps réel

| Pri | Task | Status |
|-----|------|--------|
| 🔴 | Ajouter la vraie couche audio temps réel Flutter | 📋 todo |
| 🟠 | Valider sustain à l'appui et coupure au relâchement | 📋 todo |
| 🟠 | Gérer plusieurs doigts simultanément (multitouch) | 📋 todo |
| 🟡 | Ajouter un mode quantifié | 📋 todo |
| 🟡 | Ajouter un mode continu | 📋 todo |
| 🟡 | Ajouter le panneau de contrôles timbre / filtre / release | 📋 todo |
| 🟢 | Ajouter presets et sauvegarde d'états | 📋 todo |

---

## Structure projet

| Pri | Task | Status |
|-----|------|--------|
| 🔴 | Vérifier que `app-flutter/` est la base officielle de la V1 | 📋 todo |
| 🔴 | Ajouter les fichiers Flutter manquants générés par le SDK (`flutter create`) | ⛔ blocked |
| 🟠 | Initialiser les platforms cibles : web, android, ios, linux, macos, windows | ⛔ blocked |

---

## CI/CD

| Pri | Task | Status |
|-----|------|--------|
| 🔴 | Vérifier le workflow GitHub Actions sur une vraie exécution (bloqué par scaffold) | ⛔ blocked |
| 🟡 | Cache Flutter et pub dans le workflow | ✅ done |
| 🟡 | Build Android APK dans le workflow | ✅ done |
| 🟡 | Upload artefacts de build dans le workflow | ✅ done |
| 🟢 | Ajouter build iOS si runner macOS disponible | 💤 deferred |

---

## Risques techniques

| Pri | Task | Status |
|-----|------|--------|
| 🔴 | Latence audio sur Flutter Web — évaluer et prototyper | 📋 todo |
| 🟠 | Stratégie de synthèse temps réel en Flutter (package audio) | 📋 todo |
| 🟡 | Stabilité multitouch selon la plateforme | 📋 todo |
| 🟡 | Performance visuelle mobile avec particules et halos | 📋 todo |

---

## Backlog

| Pri | Task | Status |
|-----|------|--------|
| 🟢 | Thème sombre / clair adaptable | 💤 deferred |
| 🟢 | Export audio / enregistrement de session | 💤 deferred |
| ⚪ | Publication Play Store / App Store | 💤 deferred |
| ⚪ | PWA web si Flutter Web performant | 💤 deferred |

---

## Notes

- Le squelette `app-flutter/` contient `lib/`, `test/`, `pubspec.yaml`, `analysis_options.yaml` — mais **pas** les dossiers platform (`android/`, `ios/`, `web/`).
- Le workflow CI (`flutter-ci.yml`) est complet : checkout → setup Flutter → cache → pub get → format → analyze → test → build APK → upload artifact.
- Le principal risque technique reste l'audio temps réel, pas la surface UI.
- Les anciens prototypes JavaScript (v0-*) sont archivés dans `archive-javascript/`.

---

## Audit Findings
<!-- Populated by /shipflow-audit — dated sections with Fixed: / Remaining: -->
