# 13 STORE Mobile App - Deployment Guide

## 🚀 Deployment Options

### Option 1: Expo Go (Quick Testing)

**Best for:** Immediate testing, sharing with team

```bash
# Start the development server
npx expo start

# Options:
# - Scan QR code with Expo Go app (iOS/Android)
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator
```

**Pros:**
- ✅ Instant deployment
- ✅ No build process
- ✅ Easy sharing via QR code

**Cons:**
- ⚠️ Requires Expo Go app
- ⚠️ Limited native features
- ⚠️ Not for production

---

### Option 2: EAS Build (Production - Recommended)

**Best for:** Production deployment, App Store/Play Store submission

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
# Enter your Expo account credentials
# Or create new account at: https://expo.dev
```

#### Step 3: Configure EAS
```bash
# Initialize EAS in your project
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

#### Step 4: Build for iOS

**Internal Testing (TestFlight):**
```bash
# Build for iOS internal testing
eas build --platform ios --profile preview

# This will:
# 1. Upload your code to Expo servers
# 2. Build the .ipa file
# 3. Provide download link
# 4. Optionally submit to TestFlight
```

**Production (App Store):**
```bash
# Build for App Store
eas build --platform ios --profile production

# Then submit:
eas submit --platform ios
```

**Requirements:**
- Apple Developer Account ($99/year)
- App Store Connect access
- Apple certificates (EAS handles automatically)

#### Step 5: Build for Android

**Internal Testing:**
```bash
# Build APK for internal testing
eas build --platform android --profile preview

# Download and install .apk directly
```

**Production (Play Store):**
```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Then submit:
eas submit --platform android
```

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Play Console access
- Signing key (EAS handles automatically)

---

### Option 3: Local Development Build

**Best for:** Development with custom native modules

```bash
# Generate native folders
npx expo prebuild

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android
```

**Note:** Requires Xcode (Mac only) or Android Studio

---

## 📱 Environment Configuration

### Development Environment
```bash
# .env.development
API_BASE_URL=http://localhost:3000/api/v1
WEB_BASE_URL=http://localhost:3000
```

### Production Environment
```bash
# .env.production
API_BASE_URL=https://13store-platform.vercel.app/api/v1
WEB_BASE_URL=https://13store-platform.vercel.app
```

**Note:** Update `src/config.ts` with environment variables if using .env files

---

## 🔧 Build Configuration

### App.json Configuration

Key fields to update before production:

```json
{
  "expo": {
    "name": "13 STORE",
    "slug": "13store-mobile",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.13store",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.thirteenstore",
      "versionCode": 1
    }
  }
}
```

**Important:**
- Change `bundleIdentifier` and `package` to your company domain
- Increment `buildNumber` and `versionCode` for each release

---

## 🎯 Recommended Deployment Flow

### 1. Development Phase
```bash
# Local testing
npx expo start

# Test on physical device via Expo Go
# Scan QR code
```

### 2. Internal Testing Phase
```bash
# Build preview version
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Share with team via:
# - iOS: TestFlight
# - Android: Direct APK download
```

### 3. Production Release
```bash
# Build production versions
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Monitor in:
# - App Store Connect (iOS)
# - Google Play Console (Android)
```

---

## 📋 Pre-Deployment Checklist

### Code
- [ ] All features tested
- [ ] No console errors
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] API endpoints configured correctly
- [ ] Error handling in place

### Configuration
- [ ] app.json updated (name, version, identifiers)
- [ ] API URLs point to production
- [ ] Icons and splash screen configured
- [ ] Permissions configured (camera, location, etc.)

### App Store Requirements
- [ ] App icons (all sizes)
- [ ] Screenshots (all device sizes)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Keywords and category

### Testing
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Offline mode works
- [ ] Background sync works
- [ ] Biometric auth works
- [ ] All CRUD operations work

---

## 🔐 Security Considerations

### Before Production:
1. **Remove Debug Code**
   - Remove console.logs
   - Disable debug features

2. **API Keys**
   - Use environment variables
   - Never commit secrets
   - Rotate keys for production

3. **Code Obfuscation**
   - Enable in EAS build config
   - Minify production builds

4. **SSL Pinning** (Optional)
   - Pin to your API certificates
   - Prevent man-in-the-middle attacks

---

## 📊 Post-Deployment Monitoring

### Analytics (Recommended)
```bash
# Install analytics
npm install @react-native-firebase/analytics
# or
npm install expo-analytics
```

### Crash Reporting (Recommended)
```bash
# Install Sentry
npm install @sentry/react-native
```

### OTA Updates
```bash
# Expo Updates (included by default)
# Push updates without app store review
eas update --branch production
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
eas build:configure
eas build --platform ios --clear-cache
```

### Can't Login to Expo
```bash
# Logout and login again
eas logout
eas login
```

### iOS Build Issues
- Check Apple Developer account status
- Verify certificates in App Store Connect
- Ensure provisioning profiles are valid

### Android Build Issues
- Check package name is unique
- Verify Play Console access
- Ensure signing key is configured

---

## 📞 Support Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **Expo Forums:** https://forums.expo.dev
- **Discord:** https://chat.expo.dev

---

## 🎉 Quick Start (Recommended Path)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS
eas build:configure

# 4. Build preview version
eas build --platform all --profile preview

# 5. Test with your team

# 6. When ready, build production
eas build --platform all --profile production

# 7. Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📱 Store Submission Tips

### App Store (iOS)
1. Create app in App Store Connect
2. Upload via EAS submit or Transporter
3. Fill in app information
4. Add screenshots and descriptions
5. Submit for review (1-3 days)

### Play Store (Android)
1. Create app in Play Console
2. Upload via EAS submit
3. Fill in store listing
4. Add screenshots and descriptions
5. Submit for review (few hours to 1 day)

---

**Status:** Ready for deployment!  
**Recommended:** Start with preview builds for internal testing  
**Timeline:** 1-2 weeks for store approval  

🚀 **Good luck with your deployment!**
