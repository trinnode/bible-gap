# Bible Gap 📖✨

A beautiful **fill‑in‑the‑blank** Bible verse game for Android, iOS and Web.  
Read a verse, hide 4+ words, and tap the correct option. Track your score, get a daily verse push, and listen to the passage.

---  

## 📖 Overview

| Feature | Details |
| ------- | ------- |
| **Gameplay** | verses from the public Bible API, ≥ 4 random words hidden, 3‑choice multiple‑option buttons, **Check!** validates and updates the local score. |
| **Daily verse** | Push notification at 09:00 local time (Expo Notifications). |
| **Listen** | Optional audio playback (Expo‑AV). |
| **Leaderboard** | Local SQLite high‑scores screen. |
| **Offline‑first** | All verses cached in a SQLite database after the first fetch; the app works fully offline after that. |
| **Update flow** | On every start the app checks the latest GitHub release for a new APK and prompts install. |
| **Design** | Illustrated style, **Inter** body + **Playfair Display** headline, custom abstract logo, accessible colour contrast. |

---  

## 🎨 Design tokens (copy‑paste into your CSS/JS)

```css
:root {
  /* Colors */
  --color-primary:  #2c3e50;   /* navy, used for headers & nav */
  --color-accent:   #e86e2f;   /* warm orange, CTA buttons */
  --color-bg:       #f4f6f8;   /* light canvas */
  --color-text:     #2c3e50;   /* main copy */
  --color-muted:    #7f8c8d;   /* secondary text */

  /* Fonts */
  --font-body:  "Inter", system-ui, sans-serif;
  --font-head: "Playfair Display", ui-serif, Georgia, serif;
}
```

> **Tip:** The tokens above can be used with React‑Native `StyleSheet.create` or plain CSS for the web view.

---  

## 🧩 Abstract logo (SVG)

The logo is an **abstract, vector‑based mark** that works at any size – from the 48 dp launcher icon to a 512 × 512 Play Store feature graphic. It stylises an open‑page motif with a subtle “glow”, expressing the idea of “opening the Word”.

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200"
     xmlns="http://www.w3.org/2000/svg"
     role="img"
     aria-label="Bible Gap – abstract open‑book logo">
  <defs>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" x2="100%">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="100%" stop-color="#feca5b"/>
    </linearGradient>
  </defs>

  <!-- Stylised open page -->
  <path d="M20,180 Q60,140 120,180 Q160,140 180,180"
        fill="none" stroke="#2c3e50" stroke-width="12" stroke-linecap="round"/>

  <!-- Gleam / flame element -->
  <path d="M80,60 Q100,20 120,60 Q140,20 160,60"
        fill="none" stroke="url(#glow)" stroke-width="8"
        stroke-linecap="round"/>

  <!-- Small decorative circles -->
  <circle cx="50" cy="50" r="6" fill="#2c3e50"/>
  <circle cx="150" cy="150" r="6" fill="#2c3e50"/>
</svg>
```

*Save the snippet as `assets/logo.svg` and reference it in `app.json` (`"icon": "./assets/logo.svg"`).*  

The logo is **purely vector**, so it renders crisply on mdpi, hdpi, xxhdpi, xxxhdpi screens without any loss of quality.

---  

## 📁 Project structure (key folders)

```
biblistuff/
├─ assets/
│   └─ logo.svg                # abstract logo (used as app icon & splash)
│   └─ fonts/                  # Inter & Playfair Display (downloaded by expo‑google‑fonts)
│   └─ images/                 • splash‑icon.png
│   └─ • favicon.png
├─ src/
│   ├─ app/                    # Expo Router file‑based routes
│   ├─ components/             # reusable UI (GapWord, CheckButton, etc.)
│   ├─ screens/                # HomeScreen, GameScreen, LeaderboardScreen
│   ├─ services/               # db.ts, update.ts, notifications.ts, audio.ts
│   ├─ navigation/             # RootNavigator.tsx
│   └─ styles/                 # design‑token theming
├─ app.json / expo.config.js   # Expo configuration
├─ package.json
├─ tsconfig.json
└─ README.md                   # you are here 👀
```

---  

## 🚀 Getting started

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Start the dev server (web mode works on any phone/browser)
npx expo start -w          # opens http://localhost:8082 (or QR code)

# 3️⃣ First run flow
# • Grant notification permission (once)
# • A handful of verses are fetched from bible‑api.com and stored in SQLite
# • The Home screen appears – tap **Play** to start the game
```

---  

## 📱 Android compatibility & resolution handling

| Concern | Solution |
| -------- | -------- |
| **Screen density** (mdpi – xxxhdpi) | All UI icons & the logo are **vector** (`SVG` / `VectorDrawable`). No pixel‑based bitmaps are shipped; Expo automatically scales them. |
| **Notch / cut‑out** | Use `react-native-safe-area-context` (Expo provides it out of the box). Wrap the root view with `<SafeAreaView>`. |
| **Dynamic type** | Body text uses `fontSize` expressed in `rem` (via `Inter`’s `rem` values) so users can adjust via system font size. |
| **Portrait / Landscape** | Game screen is locked to **portrait** (`orientationLock: "portrait"` in `app.json`). |
| **Back‑handler** | Android back button correctly exits the game or goes to the previous screen (handled in `RootNavigator`). |
| **Minification / shrinking** | EAS production profile enables **Hermes** bytecode, **UglifyJS** for JS, and **Android **`android.enableAapt2=true**` for AAPT2 optimisations. |
| **Testing** | Test on emulators: Pixel 2 (hdpi), Pixel 3 XL (xxxhdpi), Galaxy S5 (mdpi). Also test on a physical budget device (1 GB RAM) to verify the < 2 s launch time. |

---  

## ⚡️ Lazy loading & performance

| Technique | Implementation |
|-----------|----------------|
| **Font lazy‑load** | `useFonts` from `@expo-google-fonts/inter` only loads the fonts once, then caches them. |
| **Dynamic asset import** | `const logo = useMemo(() => import('../assets/logo.svg'), [])` – the SVG is fetched on demand (though usually it’s tiny, so it’s inlined). |
| **Memoisation** | `React.memo(GameScreen)` prevents unnecessary re‑renders when props haven’t changed. |
| **Hermes bytecode** | Enabled by default in EAS production; reduces bundle size and improves start‑up time. |
| **Avoid inline `Math.random` in render** | In `GameScreen` the random‑gap generation happens inside `useEffect`, **not** during render, keeping the UI thread free. |
| **Shadow & elevation** | Use `elevation` on Android < 5 and `shadowColor`/`shadowOffset` on iOS; both are cheap when limited to small values. |

---  

## 📦 Build configuration – “utmost excellence”

```bash
# 1️⃣ Login to EAS (once)
eas login                      # or: export EXPO_TOKEN=your_token

# 2️⃣ Production build for Android
eas build -p android --profile production

# 3️⃣ What EAS does under the hood
# • SDK 51 (as of Aug 2026)  • Hermes JavaScript engine • JSI • Gradle 8.4
# • Default release signing (Expo‑provided keystore) • enableProguardFiles if you want extra shrinking
# • Enable **enableHermes** and **enableJit** false (Hermes only)  • enableMinify true • enableShrink true
# • Output: android/app/build/outputs/apk/release/app-release.apk
```

**Release checklist**

- [ ] **Version code** incremented (`android.defaultConfig.versionCode`).
- [ ] **Version name** set (`android.defaultConfig.versionName`).
- [ ] **Proguard / Hermes** rules kept if you added native modules.
- [ ] **Testing on at least two device classes** (low‑end 1 GB RAM, high‑end 4 GB RAM).
- [ ] **Verify launch time** < 2 s on low‑end device (use `adb shell am start -W -n …`).
- [ ] **Check Accessibility** – TalkBack focus order, contentDescription on icons.
- [ ] **Confirm update‑from‑GitHub flow** works (push a new APK to the `trinnode/bible-gap` release, run the app, tap the banner).

---  

## 🛠️ Local development tips

- **Run only the web version** for quick iteration: `npx expo start -w`.  
- **Use `expo start --clear-cache`** if you see stale module resolution.  
- **Toggle Redux DevTools** (if you ever add state) with `ctrl+shift+L` / `cmd+shift+L`.  
- **Lint on every commit**: `npx expo lint` (or `eslint . --max-warnings=0`).  

---  

## 📚 Learn more

- [Expo documentation](https://docs.expo.dev) – guides, API reference, workflows.  
- [React Native accessibility](https://reactnative.dev/docs/accessibility).  
- [VectorDrawable & VectorDrawableCompat](httpsdeveloper.com/guide/topics/graphics/vectordrawable).  
- [Expo Notifications](https://docs.expo.dev/push-notifications/introduction).  
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/audio).  

---  

*Happy gaming – may your verses be ever‑filled with faith and fun!* 🙏📱🚀