---
name: Video artifact tsconfig DOM lib
description: Le tsconfig de anssam-promo (et probablement tout artifact video-js) n'inclut pas "dom" par défaut, causant des erreurs TS sur window/document/HTMLAudioElement
---

# Video artifact tsconfig — lib DOM manquante

**Why:** Le tsconfig.base.json du monorepo a `"lib": ["es2022"]` sans DOM. Les artifacts video-js utilisent des APIs browser (window, document, HTMLAudioElement, PointerEvent) dans leurs hooks et composants. Sans `dom` dans lib, tsc rapporte des erreurs sur toutes ces APIs.

**Fix appliqué:** Ajouter dans `tsconfig.json` de l'artifact:
```json
"lib": ["es2022", "dom", "dom.iterable"],
"types": ["vite/client"]
```
(retirer "node" de types — Node types ne sont pas nécessaires dans le code source du front)

**How to apply:** Tout nouvel artifact video-js doit avoir cette correction dans son tsconfig.json dès la création. Vite compile sans tsc donc les erreurs n'empêchent pas le serveur de démarrer, mais causent confusion dans l'IDE et peuvent bloquer CI.
