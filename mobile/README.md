# Keys to Paradise Mobile App - Testing Guide

## Prerequisites
- **Android**: Android device with Developer Options enabled OR Android Studio with emulator
- **iOS**: iPhone/iPad with iOS 13+ OR macOS with Xcode simulator
- **Required Apps**: Expo Go (for quick testing) or Expo Development Build

## Testing Methods

### 1. Expo Go (Quickest - Development Only)
1. Install Expo Go app on your phone:
   - **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Start the development server:
   ```bash
   cd mobile
   npm start
   # or
   npx expo start
   ```

3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

### 2. Development Build (Full Features)
```bash
cd mobile
# Build for Android
npx expo run:android
# Build for iOS (macOS only)
npx expo run:ios
```

### 3. Physical Device Testing
```bash
cd mobile
# Connect Android device via USB with Developer Options enabled
npx expo run:android --device
# For iOS device (requires Apple Developer account)
npx expo run:ios --device
```

## APK Build for Android Distribution

### Create Production APK:
```bash
cd mobile
# Build APK for distribution
npx expo build:android --type apk
# or for AAB (Google Play)
npx expo build:android --type app-bundle
```

### Local APK Build:
```bash
cd mobile
# Create local development build
npx expo run:android --variant release
```

## Testing Checklist

### Core Features to Test:
- [ ] Language selection (English, Arabic, French)
- [ ] RTL support for Arabic text
- [ ] Navigation between all screens
- [ ] Assessment flow and results
- [ ] Goals and challenges creation
- [ ] Prayer settings and notifications
- [ ] Achievements and progress tracking
- [ ] Data persistence with AsyncStorage
- [ ] Settings and data management

### Device-Specific Testing:
- [ ] Different screen sizes (phones, tablets)
- [ ] Android back button behavior
- [ ] iOS gesture navigation
- [ ] Notification permissions
- [ ] Location services (for prayer times)
- [ ] Offline functionality

## Troubleshooting

### Common Issues:
1. **Metro bundler errors**: Clear cache with `npx expo start --clear`
2. **Native module issues**: Run `npx expo install --fix`
3. **Android build errors**: Check Android SDK and build tools
4. **iOS build errors**: Ensure Xcode is properly configured

### Performance Testing:
- Test on older devices (Android 8+, iOS 13+)
- Check memory usage with large data sets
- Verify smooth animations and transitions
- Test with poor network connectivity

## Production Deployment

### Android (Google Play Store):
```bash
cd mobile
# Build AAB bundle
npx expo build:android --type app-bundle
# Upload to Google Play Console
```

### iOS (App Store):
```bash
cd mobile
# Build for iOS
npx expo build:ios
# Upload to App Store Connect
```

## App Store Assets Needed:
- App icon (multiple sizes)
- Screenshots for different devices
- App description in multiple languages
- Privacy policy and terms of service
- Content rating information

## Contact for Support
- Check logs in Metro bundler console
- Use `npx expo doctor` to diagnose issues
- Review React Native and Expo documentation