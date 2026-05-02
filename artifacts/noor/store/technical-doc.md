# Anssam — أنسام · Technical Documentation
**Version:** 1.0.0  
**By:** Straight Path Intelligence  
**Bundle ID (iOS):** com.anssamapp.anssam  
**Package (Android):** com.anssamapp.anssam

---

## Architecture Overview

Anssam is a cross-platform mobile application built with **Expo SDK 52 + React Native + Expo Router (file-based routing)**. It targets iOS 16+ and Android 9+. The web preview is powered by Metro/React Native Web.

```
artifacts/noor/
├── app/                        # Expo Router route tree
│   ├── _layout.tsx             # Root layout: fonts, query client, splash, providers
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── _layout.tsx         # Tab bar config (5 tabs)
│   │   ├── index.tsx           # Prayer Times (home)
│   │   ├── quran.tsx           # Quran browser
│   │   ├── dhikr.tsx           # Tasbih counter
│   │   ├── duas.tsx            # Duas collection
│   │   └── more.tsx            # Settings, 99 Names, Hijri, About
│   ├── surah/[id].tsx          # Surah reader (dynamic route)
│   ├── names.tsx               # 99 Names of Allah full screen
│   └── settings.tsx            # App settings
├── components/
│   ├── CustomSplash.tsx        # Animated splash (native only, skipped on web)
│   ├── ErrorBoundary.tsx       # React error boundary
│   ├── ErrorFallback.tsx       # Fallback UI for errors
│   └── KeyboardAwareScrollViewCompat.tsx
├── contexts/
│   └── AppContext.tsx          # Global state: language, calculation method, madhab
├── data/
│   ├── translations.ts         # i18n strings (EN, AR, FR, TR)
│   ├── duas.ts                 # Curated duas with sources
│   └── namesOfAllah.ts         # 99 Asmāʾ ul-Ḥusnā
├── hooks/
│   ├── usePrayerTimes.ts       # adhan library + expo-location wrapper
│   └── useColors.ts            # Theme color constants
├── assets/images/
│   ├── icon.png                # App icon (1024×1024 gold on emerald)
│   └── spi-logo.jpg            # Straight Path Intelligence logo
├── app.json                    # Expo config (bundle IDs, privacy manifest, plugins)
├── eas.json                    # EAS Build profiles (dev / preview / production / apk)
└── store/                      # App Store / Play Store assets & metadata
```

---

## Key Technologies

| Layer | Library | Version |
|-------|---------|---------|
| Framework | Expo | ~52.x |
| Navigation | expo-router | ~4.x |
| Prayer Times | adhan | ^2.3.0 |
| Quran Data | alquran.cloud API | v1 (public) |
| HTTP Client | @tanstack/react-query | ^5.x |
| Location | expo-location | ~18.x |
| Fonts | @expo-google-fonts/inter | latest |
| Animations | react-native Animated API | built-in |
| Gradients | expo-linear-gradient | ~14.x |
| Haptics | expo-haptics | ~14.x |
| Build | EAS Build | latest |

---

## Prayer Times Module

**File:** `hooks/usePrayerTimes.ts`

- Uses the `adhan` library (pure JavaScript, no server needed)
- Calculation methods supported: MWL, ISNA, Egypt, Makkah, Karachi, Gulf, Kuwait, Qatar, Singapore, France, Turkey
- Madhab support: Shafi (standard) / Hanafi (late Asr)
- Location obtained via `expo-location` (foreground permission only)
- Exports: `prayerTimes`, `nextPrayer`, `countdown`, `qiblaDirection`, `loading`, `error`, `calculate`, `refresh`
- Countdown re-ticks every second via `setInterval`

---

## Quran Module

**File:** `app/(tabs)/quran.tsx` + `app/surah/[id].tsx`

- Fetches surah list from `https://api.alquran.cloud/v1/surah`
- Fetches individual surah text: `https://api.alquran.cloud/v1/surah/{id}/editions/quran-simple,{lang}-edition`
- Available translations: English (en.asad), French (fr.hamidullah), Turkish (tr.yazir)
- Arabic text always shown alongside translation
- Data cached by react-query (staleTime: 10 min, gcTime: 1 hour)
- Offline-friendly: cached data persists across navigations

---

## Internationalization

**File:** `data/translations.ts`

4 supported locales: `en`, `ar`, `fr`, `tr`  
- Controlled via `AppContext.language` (persisted to AsyncStorage)
- Arabic layout uses RTL text via `writingDirection: "rtl"` per-component
- Quran translation edition chosen based on current language

---

## App Context (Global State)

**File:** `contexts/AppContext.tsx`

Persisted to AsyncStorage:
- `language`: `"en" | "ar" | "fr" | "tr"` (default: device locale → fallback `"en"`)
- `calculationMethod`: `"MWL" | "ISNA" | "Egypt" | ...` (default: `"MWL"`)
- `madhab`: `"Shafi" | "Hanafi"` (default: `"Shafi"`)
- `tasbihCount`, `tasbihSet`: current dhikr counter state

---

## Privacy Architecture

- **Zero data collection.** No analytics SDK, no crash reporter, no ad network.
- **Location:** Read once on app open + on explicit "refresh" tap. Never background. Never transmitted.
- **Quran API:** Public CDN endpoint. No authentication, no user data sent.
- **AsyncStorage:** Stores only user preferences (language, method, dhikr count) — all on-device.
- **Apple Privacy Manifest:** Included in `app.json` → `privacyManifests`. Declares UserDefaults access (CA92.1) and FileTimestamp (C617.1). `NSPrivacyTracking: false`. No tracking domains.

---

## EAS Build Profiles

**File:** `eas.json`

| Profile | Platform | Output | Use Case |
|---------|----------|--------|----------|
| `development` | iOS + Android | Dev client | Local testing with dev menu |
| `preview` | iOS + Android | Internal dist. | TestFlight / Internal testing |
| `production` | iOS | .ipa (App Store) | App Store submission |
| `android-apk` | Android | .apk | Direct APK distribution |

### Build Commands
```bash
# iOS App Store build
eas build --platform ios --profile production

# Android APK
eas build --platform android --profile android-apk

# Android App Bundle (Google Play)
eas build --platform android --profile production
```

### Requirements
- Expo account (free): `eas login`
- Apple Developer Program: $99/year → for `production` iOS build
- Google Play Console: $25 one-time → for Play Store submission
- `eas.json` `projectId` must be set after `eas init`

---

## Environment & Dependencies

```bash
# Install dependencies
pnpm --filter @workspace/noor install

# TypeScript check
cd artifacts/noor && npx tsc --noEmit

# Start dev server (via Replit workflow)
pnpm --filter @workspace/noor run dev
```

The dev server runs on `$PORT` (assigned by Replit), proxied via the shared reverse proxy at `/noor`.

---

## Extending the App

### Adding a new language
1. Add a new locale key to `data/translations.ts` (copy the `en` block)
2. Add the locale code to `AppContext.tsx` `Language` type
3. Add a `<TouchableOpacity>` in `settings.tsx` language picker
4. Map the locale to an alquran.cloud edition in `app/surah/[id].tsx`

### Adding a new Dua
1. Add an entry to `data/duas.ts` following the `Dua` type
2. It automatically appears in `app/(tabs)/duas.tsx`

### Changing the calculation method default
1. In `contexts/AppContext.tsx`, change `defaultMethod` value
2. The `usePrayerTimes` hook reads this from context
