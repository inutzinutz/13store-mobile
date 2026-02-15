# 13 STORE Mobile - Build & Deployment Guide

## Quick Reference

**Repository:** https://github.com/inutzinutz/13store-mobile  
**Platform:** React Native with Expo SDK 52  
**Build System:** EAS (Expo Application Services)

---

## Prerequisites

### Required Accounts
- ✅ Expo account (sign up at https://expo.dev)
- 🍎 Apple Developer account ($99/year for iOS)
- 🤖 Google Play Developer account ($25 one-time for Android)

### Required Tools
```bash
# Already installed:
✅ Node.js (v18+)
✅ npm/yarn
✅ Git
✅ EAS CLI

# Verify installations:
node --version
npm --version
eas --version
```

---

## Step 1: Expo Account Setup

### Login to Expo
```bash
cd C:/Users/iNuTz/Downloads/13store-mobile
npx expo login
```

Or create new account:
```bash
npx expo register
```

### Initialize EAS Project
```bash
eas init
```

This will:
1. Create a project on Expo
2. Generate a project ID
3. Update `app.json` with the project ID

---

## Step 2: Configure Credentials

### iOS Credentials (Apple Developer Account Required)

EAS can automatically manage certificates and provisioning profiles:

```bash
eas credentials
```

Or configure manually in `eas.json`:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
}
```

### Android Credentials (Google Play Account Required)

Generate upload keystore:
```bash
eas credentials
```

Or create service account key:
1. Go to Google Play Console → Setup → API access
2. Create service account
3. Download JSON key
4. Save as `google-service-account.json`

---

## Step 3: Build the App

### Development Build (Internal Testing)

**Both platforms:**
```bash
npm run build:dev
# or: eas build --profile development --platform all
```

**iOS only:**
```bash
npm run build:dev:ios
```

**Android only:**
```bash
npm run build:dev:android
```

Build output:
- 🍎 iOS: `.ipa` file (for TestFlight)
- 🤖 Android: `.apk` file (sideload on device)

---

### Preview Build (Beta Testing)

**Both platforms:**
```bash
npm run build:preview
# or: eas build --profile preview --platform all
```

This creates:
- 🍎 iOS: Ad-hoc build (limited devices)
- 🤖 Android: `.apk` for distribution

---

### Production Build (App Store Release)

**Both platforms:**
```bash
npm run build:prod
# or: eas build --profile production --platform all
```

**iOS only:**
```bash
npm run build:prod:ios
```

**Android only:**
```bash
npm run build:prod:android
```

Build output:
- 🍎 iOS: `.ipa` (App Store ready)
- 🤖 Android: `.aab` (Play Store ready)

---

## Step 4: Submit to Stores

### iOS App Store

1. **Automated submission:**
```bash
npm run submit:ios
# or: eas submit --platform ios
```

2. **Manual steps:**
- Go to App Store Connect
- Create new app listing
- Upload screenshots
- Write description
- Submit for review

### Android Play Store

1. **Automated submission:**
```bash
npm run submit:android
# or: eas submit --platform android
```

2. **Manual steps:**
- Go to Google Play Console
- Create new app
- Upload screenshots
- Write description
- Submit for review

---

## Step 5: Testing Options

### Option A: Expo Go (Quick Testing)

**Fastest way to test without building:**

1. Install Expo Go app on your device:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start development server:
```bash
npm start
```

3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

**Limitations:**
- ❌ Cannot test native modules (biometric auth, etc.)
- ❌ No offline testing
- ✅ Great for UI/UX testing

---

### Option B: Development Build (Full Feature Testing)

**Best for testing all features including native modules:**

1. Build development version:
```bash
npm run build:dev:ios  # or :android
```

2. Install on device:
   - iOS: Use TestFlight or direct install
   - Android: Download APK from EAS dashboard

3. Run development server:
```bash
npm start
```

4. Connect app to server (same as Expo Go)

---

### Option C: Preview Build (Beta Testing)

**Best for stakeholder/user testing:**

1. Build preview:
```bash
npm run build:preview
```

2. Distribute to testers:
   - iOS: TestFlight (up to 10,000 testers)
   - Android: Google Play Internal Testing

---

## Build Profiles Explained

### Development Profile
```json
{
  "developmentClient": true,
  "distribution": "internal"
}
```
- For active development
- Hot reload enabled
- Debug mode
- Larger file size

### Preview Profile
```json
{
  "distribution": "internal"
}
```
- For beta testing
- Production-like build
- No debug tools
- Optimized performance

### Production Profile
```json
{
  "android": {
    "buildType": "app-bundle"
  }
}
```
- For app store release
- Fully optimized
- Code obfuscation
- Smallest file size

---

## Environment Configuration

### API Endpoints

Update `src/config.ts` for different environments:

```typescript
const config = {
  // Production API
  API_BASE_URL: 'https://13store-platform.vercel.app/api/v1',
  
  // Development API (local)
  // API_BASE_URL: 'http://localhost:3000/api/v1',
  
  // Staging API
  // API_BASE_URL: 'https://staging.13store.com/api/v1',
};
```

---

## Monitoring Builds

### EAS Dashboard

View all builds at: https://expo.dev/accounts/[username]/projects/13store-mobile

Features:
- ✅ Build status (queued/building/success/failed)
- ✅ Build logs
- ✅ Download artifacts (.ipa, .apk, .aab)
- ✅ Share builds with QR codes
- ✅ Crash analytics

### Command Line Status

```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel build
eas build:cancel
```

---

## Troubleshooting

### Build Fails with "Bundle Identifier Already Exists"

**Solution:** Change bundle IDs in `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.store13mobile"
  },
  "android": {
    "package": "com.yourcompany.store13mobile"
  }
}
```

### Build Fails with Credential Errors

**Solution:** Reset credentials:
```bash
eas credentials
# Select platform → Credentials Manager → Remove all
# Then rebuild - EAS will generate new credentials
```

### App Crashes on Launch

**Solution:** Check logs:
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Network Request Failures

**Solution:** Verify API configuration:
1. Check `src/config.ts` has correct API URL
2. Ensure API is accessible from mobile network
3. Check CORS settings on backend

---

## Quick Start Commands

```bash
# 1. Login to Expo
npx expo login

# 2. Initialize EAS
eas init

# 3. Build for testing (recommended first build)
npm run build:preview:android

# 4. Build for production
npm run build:prod

# 5. Submit to stores
npm run submit:ios
npm run submit:android
```

---

## Cost Breakdown

### Free Tier (Expo)
- ✅ Unlimited builds per month
- ✅ 30 builds/month priority queue
- ⚠️ Slower build times

### Paid Tiers (Expo)
- **Production ($29/month):** Faster builds, more storage
- **Enterprise ($999/month):** On-premise builds, SLA

### Store Fees
- 🍎 **Apple:** $99/year developer account
- 🤖 **Android:** $25 one-time registration

---

## Next Steps

1. ✅ **Immediate:** Test with Expo Go
   ```bash
   npm start
   ```

2. 🔨 **Short-term:** Create preview build
   ```bash
   npm run build:preview:android
   ```

3. 🚀 **Production:** Submit to stores
   ```bash
   npm run build:prod
   npm run submit:ios
   npm run submit:android
   ```

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Repository Issues:** https://github.com/inutzinutz/13store-mobile/issues
- **Expo Discord:** https://discord.gg/expo

---

**Last Updated:** February 15, 2026  
**Version:** 1.0.0  
**Maintained By:** iNuTz
