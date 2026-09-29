<p align="center">
  <img src="assets/app-icon.png" alt="Interview Dev Hack logo" width="140" />
</p>

<h1 align="center">Interview Dev Hack — Mobile</h1>

<p align="center">
  A native iOS & Android wrapper for
  <a href="https://interview-dev-hack.vercel.app/">interview-dev-hack.vercel.app</a>,
  built with React Native and Expo.
</p>

<p align="center">Developed by Ganushka Gamage ❤️</p>

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started (development)](#getting-started-development)
- [Building a standalone iOS app](#building-a-standalone-ios-app)
- [Installing on an iPhone](#installing-on-an-iphone)
- [Changing the app icon or splash screen](#changing-the-app-icon-or-splash-screen)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Overview

This app loads the Interview Dev Hack website inside a full-screen native
`WebView`, so it can be installed and launched from the home screen like any
other app. The JavaScript bundle is embedded in Release builds, so the app runs
on its own without a development server or computer attached.

On launch the app shows the native splash screen, then a branded screen with the
logo and the "Developed by Ganushka Gamage ❤️" credit. That screen fades out
once the website has finished loading (shown for at least 1.5 seconds).

## Features

- Full-screen web view of `https://interview-dev-hack.vercel.app/`
- Branded splash screen with logo and developer credit
- Pull down to refresh
- Swipe back / forward through page history (iOS)
- Hardware back button navigates web history (Android)
- Links that open a new tab (`target="_blank"`) load in the same view
- Cookies and local storage persist between launches
- Inline media playback
- Respects the iPhone notch / Dynamic Island safe area

## Tech stack

| Package | Version | Purpose |
| --- | --- | --- |
| [Expo](https://expo.dev) | SDK 57 | App framework and build tooling |
| React Native | 0.86 | Native runtime |
| React | 19.2 | UI |
| TypeScript | 6.0 | Type checking |
| `react-native-webview` | 13.16 | Renders the website |
| `react-native-safe-area-context` | 5.7 | Safe area handling |
| `expo-splash-screen` | 57 | Native splash screen |
| `expo-status-bar` | 57 | Status bar styling |

## Project structure

```
.
├── App.tsx              # The whole app: WebView + branded splash overlay
├── index.ts             # Entry point, registers App
├── app.json             # Expo config: name, bundle ID, icon, splash, team ID
├── assets/
│   ├── logo.png         # Original logo (used on the splash screens)
│   ├── app-icon.png     # Square 1024×1024 app icon generated from logo.png
│   └── ...              # Default Expo Android icons and favicon
├── package.json
└── tsconfig.json
```

The `ios/` and `android/` folders are **not** committed. They are generated from
`app.json` with `npx expo prebuild` (see below).

## Prerequisites

- macOS with **Xcode** installed (for iOS builds)
- **Node.js** 20 or newer
- An **Apple ID** added in Xcode → Settings → Accounts (a free account works)
- For device installs: an iPhone connected by cable or on the same network, with
  Developer Mode enabled (Settings → Privacy & Security → Developer Mode)
- Optional: [Expo Go](https://expo.dev/go) on your phone for quick previews

## Getting started (development)

```bash
git clone https://github.com/SagaraZD/InterviewDevHack-Mobile.git
cd InterviewDevHack-Mobile
npm install
npx expo start
```

Then either:

- scan the QR code with **Expo Go** on your phone, or
- press `i` to open the iOS Simulator, or `a` for an Android emulator.

Useful checks:

```bash
npx tsc --noEmit     # type check
npx expo-doctor      # check dependencies and config
```

> Always add packages with `npx expo install <package>` rather than `npm install`,
> so versions stay compatible with the Expo SDK.

## Building a standalone iOS app

This produces a Release build with the JavaScript bundle embedded, packaged as
`~/Desktop/InterviewDevHack.ipa`. Run it from the project root:

```bash
CI=1 npx expo prebuild --platform ios --clean && \
cd ios && \
xcodebuild -workspace InterviewDevHack.xcworkspace -scheme InterviewDevHack -configuration Release -destination 'generic/platform=iOS' -derivedDataPath ./build -allowProvisioningUpdates build && \
rm -f ~/Desktop/InterviewDevHack.ipa && \
mkdir -p ~/Desktop/Payload && cp -R ./build/Build/Products/Release-iphoneos/InterviewDevHack.app ~/Desktop/Payload/ && \
cd ~/Desktop && zip -r InterviewDevHack.ipa Payload && rm -rf Payload
```

What each step does:

1. **`expo prebuild --clean`**: regenerates the native `ios/` project from
   `app.json`, including the icon, splash screen, bundle ID and signing team.
   You can skip it if you only changed `App.tsx`.
2. **`xcodebuild`**: compiles and signs the Release app into `ios/build`.
   `-allowProvisioningUpdates` lets Xcode create the provisioning profile
   automatically.
3. **`zip`**: packages the `.app` into an `.ipa` (a zip with a `Payload/` folder).

### Signing

`app.json` sets `ios.appleTeamId`, which `prebuild` writes into the Xcode
project. To build under a different Apple account, change `appleTeamId` (and
usually `bundleIdentifier`) in `app.json`. You can find your Team ID in Xcode →
Settings → Accounts, or in the Apple Developer portal.

## Installing on an iPhone

**Option A: AltStore** (recommended with a free Apple ID)

1. AirDrop or copy `InterviewDevHack.ipa` to the iPhone.
2. Open **AltStore → My Apps → +** and choose the `.ipa`.
3. Reinstalling the same way later updates the existing app in place.

**Option B: directly from the Mac**, with the phone connected:

```bash
xcrun devicectl list devices
xcrun devicectl device install app --device <DEVICE_UDID> ios/build/Build/Products/Release-iphoneos/InterviewDevHack.app
```

Or build and install in one step:

```bash
npx expo run:ios --device --configuration Release
```

### Free Apple ID limits

Apps signed with a free (Personal Team) account:

- **stop opening after 7 days** and must be reinstalled or refreshed (AltStore
  can refresh automatically)
- are limited to **3 sideloaded apps per device**
- can only be installed on devices registered to that Apple ID

A paid Apple Developer Program membership removes these limits and allows
TestFlight and App Store distribution (for example with
[EAS Build](https://docs.expo.dev/build/introduction/)).

## Changing the app icon or splash screen

1. Replace `assets/logo.png` with the new logo.
2. Regenerate the square app icon. iOS icons must be square with no
   transparency, so the logo is centred on its background colour with padding:

   ```bash
   python3 - <<'EOF'
   from PIL import Image
   im = Image.open("assets/logo.png").convert("RGBA")
   bg = im.getpixel((5, im.height // 2))[:3]   # sample the background colour
   side = max(im.size)
   sq = Image.new("RGB", (side, side), bg)
   sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2), im)
   pad = int(side * 0.12)
   canvas = Image.new("RGB", (side + 2 * pad, side + 2 * pad), bg)
   canvas.paste(sq, (pad, pad))
   canvas.resize((1024, 1024), Image.LANCZOS).save("assets/app-icon.png")
   print("background colour: #%02X%02X%02X" % bg)
   EOF
   ```

3. If the background colour changed, update `#190A39` in `app.json` (splash
   `backgroundColor`) and `BRAND_BG` in `App.tsx`.
4. Rebuild with the command in
   [Building a standalone iOS app](#building-a-standalone-ios-app). The
   `prebuild --clean` step is required for icon and splash changes.

## Configuration

| What | Where |
| --- | --- |
| Website URL | `SITE_URL` in `App.tsx` |
| Credit text | `<Text style={styles.credit}>` in `App.tsx` |
| Minimum splash time | `MIN_SPLASH_MS` in `App.tsx` |
| Splash / brand colour | `BRAND_BG` in `App.tsx` and `backgroundColor` in `app.json` |
| App name | `expo.name` in `app.json` |
| Bundle identifier | `expo.ios.bundleIdentifier` in `app.json` |
| Apple Team ID | `expo.ios.appleTeamId` in `app.json` |
| App icon | `expo.icon` in `app.json` (`assets/app-icon.png`) |
| Native splash image | `expo-splash-screen` plugin in `app.json` |

## Troubleshooting

**"No profiles for 'com.…' were found"**: pass `-allowProvisioningUpdates` to
`xcodebuild` (already included in the build command), and make sure your Apple ID
is signed in to Xcode.

**"This device has reached the maximum number of installed apps using a free
developer profile"**: delete one of the sideloaded apps from the phone, or
install through AltStore so it updates the existing app instead of adding a new one.

**The icon or splash screen didn't change**: run `npx expo prebuild --platform ios --clean`
before building, then reinstall the app. iOS sometimes caches home-screen icons,
so restart the phone if the old icon still shows.

**"Unable to resolve ./assets/logo.png"**: the splash overlay and native splash
both require `assets/logo.png` to exist.

**The app stopped opening after a week**: this is the 7-day limit for free
Apple IDs. Rebuild and reinstall, or refresh in AltStore.

---

<p align="center">Developed by Ganushka Gamage ❤️</p>
