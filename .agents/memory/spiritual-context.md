---
name: Spiritual assistant architecture
description: SpiritualContext + /spiritual screen — score, coaching, streak, weekly history
---

## Rule
L'assistant spirituel utilise `SpiritualContext` (AsyncStorage, clé `anssam_spiritual_YYYY-MM-DD`) wrappé dans `_layout.tsx` entre `PrayerTimesProvider` et `SafeAreaProvider`.

**Why:** Feature demandée par l'utilisateur — suivi quotidien spirituel avec score 0-100.

**Score calculation:**
- 5 prières × 14 pts = 70 max
- Pages Coran: 1+ = 12 pts, 3+ = 20 pts
- Sessions Dhikr: 1 = 7 pts, 2+ = 10 pts
- Total max = 100 pts

**How to apply:**
- `contexts/SpiritualContext.tsx` — `useSpiritual()` hook
- `app/spiritual.tsx` — écran complet (ring SVG animé, checklist prières, Quran/Dhikr actions, coaching, historique semaine)
- Route ajoutée dans `app/_layout.tsx` (`Stack.Screen name="spiritual"`)
- Carte "Mon Parcours 💫" ajoutée dans `app/(tabs)/more.tsx` features grid
