---
name: Apple App Store Compliance — Anssam
description: Toutes les corrections appliquées pour passer la validation Apple du premier coup pour l'app Anssam (Expo managed)
---

# Apple App Store Compliance — Anssam

**Why:** L'app avait plusieurs problèmes qui causent un rejet automatique ou humain lors de la review Apple.

## Corrections appliquées

### 1. expo-image-picker retiré (CRITIQUE)
- Installé mais jamais utilisé dans le code
- iOS inclut automatiquement AVFoundation/Photos.framework via autolinking Expo
- Apple rejette si framework camera/photo présent sans NSCameraUsageDescription
- **Fix:** retiré de package.json

### 2. NSMotionUsageDescription ajouté
- Qibla utilise `Location.watchHeadingAsync` (boussole/magnétomètre)
- Ajouté dans ios.infoPlist même si CLLocationManager (pas CoreMotion) pour belt-and-suspenders

### 3. NSCameraUsageDescription & NSPhotoLibraryUsageDescription
- Ajoutés comme strings de non-usage ("Anssam n'utilise pas la caméra")
- Protège si une dépendance transitoire lie AVFoundation

### 4. LSApplicationQueriesSchemes
- mosques.tsx et halal.tsx ouvrent Google Maps via Linking.openURL
- Ajouté: comgooglemaps, googlemaps, maps, tel, mailto

### 5. expo-router origin corrigé
- Était "https://replit.com/" → changed to "https://anssamapp.com"
- Affecte les universal links / deep linking en production

### 6. Privacy Manifest complété
- Ajouté NSPrivacyAccessedAPICategorySystemBootTime (35F9.1) — React Native timing
- Ajouté NSPrivacyAccessedAPICategoryDiskSpace (E174.1) — certains libs expo
- Déjà présent: UserDefaults (CA92.1), FileTimestamp (C617.1)

### 7. CFBundleDisplayName ajouté
- Sans cela, l'app affiche "Anssam — أنسام" (trop long) sur l'icône home screen
- Set to "Anssam"

### 8. CFBundleDevelopmentRegion fr
- App principalement en français, corrigé depuis "en"

### 9. Android blockedPermissions étendu
- Ajouté READ/WRITE_EXTERNAL_STORAGE

## Checklist restante (App Store Connect — hors code)
- [ ] Privacy Policy URL live: https://anssamapp.com/privacy
- [ ] Screenshots iPhone 6.7" obligatoires
- [ ] Nutrition label vie privée remplie (aucune donnée collectée)
- [ ] EAS build avec profil production avant soumission
- [ ] Compte Apple Developer actif (99$/an)

## Comment à utiliser
**How to apply:** À chaque nouveau build EAS iOS, vérifier que expo-image-picker n'a pas été réinstallé et que tous les strings de permission sont présents. Lancer `eas build --platform ios --profile production` puis `eas submit`.
