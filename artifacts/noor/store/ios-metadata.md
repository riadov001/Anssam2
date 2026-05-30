# Anssam — أنسام · App Store Metadata

## App Name
Anssam — أنسام

## Subtitle (30 chars max)
Prières · Coran · Qibla · IA

## Category
Primary: Reference
Secondary: Lifestyle

## Age Rating
4+ (Aucun contenu répréhensible)

## Privacy Policy URL
https://anssamapp.com/privacy
(Page déclarant qu'aucune donnée n'est collectée, stockée ou partagée)

## Keywords (100 chars, virgule-séparés)
priere,coran,islam,adhan,qibla,tasbih,dua,hijri,muslim,salah,fajr,isha,dhikr,allah,99noms

## Description (4000 chars max)
Anssam (أنسام — « Brises douces ») est un compagnon islamique premium, respectueux de la vie privée, conçu pour les musulmans du monde entier.

✦ HORAIRES DE PRIÈRES
Des heures de salah précises calculées localement grâce à l'algorithme adhan — sans serveur. Prend en charge toutes les méthodes de calcul (MWL, ISNA, Égypte, La Mecque, Karachi, Golfe, Koweït, Qatar, Singapour, France, Turquie) et les madhabs Shafi et Hanafi. Un compte à rebours en direct indique le temps restant jusqu'à la prochaine prière.

✦ SAINT CORAN
Les 114 Sourates avec le texte arabe complet, la translittération et les traductions en anglais, français et turc (via l'API fiable AlQuran.cloud). Une belle expérience de lecture avec la bismillah et un affichage verset par verset.

✦ DIRECTION QIBLA
Cap précis de la Qibla calculé depuis votre position vers La Mecque. Boussole animée en temps réel.

✦ COMPTEUR TASBIH
Compteur de dhikr numérique pour Subḥān Allāh, Al-ḥamdu lillāh, Allāhu Akbar et plus encore — avec retour haptique et anneau de progression visuelle. Suit les séries complètes.

✦ 99 NOMS D'ALLAH
Les 99 Asmāʾ ul-Ḥusnā avec l'arabe, la translittération et le sens dans votre langue.

✦ COLLECTION DE DOU'AS
Dou'as authentiques sélectionnées pour le matin, le soir, le sommeil, le réveil, les repas, le voyage, la mosquée et les occasions générales — avec l'arabe, la translittération, la traduction et la source hadith.

✦ AGENDA ISLAMIQUE
Affichage magnifique de la date hégirique actuelle avec le calendrier grégorien.

✦ MULTI-LANGUE
Interface complète et traductions du Coran en anglais, العربية, Français et Türkçe.

✦ CONFIDENTIALITÉ EN PREMIER
Aucun compte requis. Aucune publicité. Aucune analytics. Aucune donnée ne quitte votre appareil. La localisation est utilisée uniquement localement pour calculer les horaires de prières et n'est jamais transmise.

✦ DESIGN PREMIUM
Thème émeraude sombre et or luxueux conçu pour une utilisation spirituelle quotidienne.

---
« Et Il est avec vous où que vous soyez. » — Coran 57:4

## What's New (Version 1.0.0)
Première version d'Anssam — أنسام.

## Support URL
https://anssamapp.com/support

## Marketing URL
https://anssamapp.com

## Copyright
© 2026 Anssam Islamic App — Straight Path Intelligence. Tous droits réservés.

## Notes pour l'examinateur Apple (Review Notes)
- Cette application utilise la localisation de l'appareil (uniquement lors de l'utilisation) exclusivement pour calculer les horaires de prières et la direction de la Qibla localement. Aucune donnée de localisation n'est transmise à un serveur.
- La boussole Qibla utilise le capteur de cap de l'appareil via CLLocationManager. Aucune donnée de mouvement n'est stockée.
- Le contenu du Coran est récupéré depuis alquran.cloud, une API publique gratuite.
- L'application ne contient aucun compte utilisateur, aucun achat intégré, aucune publicité et aucune analytics.
- Tout le contenu islamique est à caractère éducatif et religieux, approprié à tous les âges.
- Testée sur iPhone 14 Pro (iOS 17) et iPhone SE 3e génération (iOS 16).
- Développée par Straight Path Intelligence.
- Chiffrement : l'application utilise uniquement HTTPS standard (pas de chiffrement non-exempt). ITSAppUsesNonExemptEncryption = false.

## Checklist Apple App Store — Pré-soumission

### Configuration (app.json)
- [x] bundleIdentifier : com.anssamapp.anssam
- [x] buildNumber : 1
- [x] version : 1.0.0
- [x] deploymentTarget : 16.0 (iOS 16+)
- [x] ITSAppUsesNonExemptEncryption : false
- [x] NSLocationWhenInUseUsageDescription : présent
- [x] NSLocationAlwaysAndWhenInUseUsageDescription : présent
- [x] NSMotionUsageDescription : présent (boussole Qibla)
- [x] NSCameraUsageDescription : présent (déclaration de non-usage)
- [x] NSPhotoLibraryUsageDescription : présent (déclaration de non-usage)
- [x] LSApplicationQueriesSchemes : comgooglemaps, googlemaps, maps, tel, mailto
- [x] CFBundleDisplayName : Anssam
- [x] CFBundleLocalizations : en, ar, fr, tr
- [x] Privacy Manifest complet (UserDefaults, FileTimestamp, SystemBootTime, DiskSpace)
- [x] NSPrivacyTracking : false
- [x] NSPrivacyCollectedDataTypes : [] (aucune donnée collectée)
- [x] expo-image-picker retiré (non utilisé, évite frameworks caméra non déclarés)
- [x] expo-router origin : https://anssamapp.com
- [x] UIBackgroundModes : [] (aucun mode background)
- [x] allowBackup : false (Android)

### Assets requis (App Store Connect)
- [ ] Icône 1024×1024 PNG sans canal alpha ✓ (icon.png est sRGB sans alpha)
- [ ] Screenshots iPhone 6.9" (1320×2868 ou 1290×2796)
- [ ] Screenshots iPhone 6.7" (1290×2796 ou 1284×2778) — obligatoires
- [ ] Screenshots iPhone 5.5" (1242×2208) — obligatoires si deploymentTarget < 16
- [ ] Screenshots iPad 12.9" (si supportsTablet=true — actuellement false)
- [ ] Vidéo de prévisualisation App Store (optionnel, 15-30s)

### App Store Connect — Informations
- [ ] Privacy Policy URL configurée : https://anssamapp.com/privacy
- [ ] Support URL : https://anssamapp.com/support
- [ ] Nutrition label vie privée remplie (données non collectées)
- [ ] Catégorie : Référence + Lifestyle
- [ ] Âge : 4+
- [ ] Prix : Gratuit (ou préciser si payant)
- [ ] Pays de disponibilité sélectionnés

### EAS Build (Expo Application Services)
```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter
eas login

# Configurer le projet
eas build:configure

# Build iOS
eas build --platform ios --profile production

# Soumettre
eas submit --platform ios
```
