# Keys to Paradise Mobile App Setup Guide

## Overview
This guide covers the complete setup and deployment process for the Keys to Paradise React Native mobile application with integrated Sakkal Arabic font support and responsive design.

## Prerequisites

### System Requirements
- Node.js 18+ 
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps

#### 1. Install React Native CLI
```bash
npm install -g react-native-cli
```

#### 2. Android Setup
- Install Android Studio
- Configure Android SDK (API 33+)
- Set up Android Virtual Device (AVD)
- Add Android SDK to PATH

#### 3. iOS Setup (macOS only)
- Install Xcode from App Store
- Install iOS Simulator
- Install CocoaPods: `sudo gem install cocoapods`

## Mobile App Features

### Enhanced Features Implemented
✅ **Arabic Font Integration**
- All 5 Sakkal font weights (Light, Regular, Medium, Bold, Heavy)
- Proper RTL text rendering
- Responsive Arabic font sizing for mobile screens

✅ **Responsive Design System**
- Tablet and phone optimized layouts
- Dynamic font and spacing scaling
- Screen orientation adaptability

✅ **Enhanced SOS Page**
- Interactive dhikr player with Arabic text
- Emergency spiritual guidance sections
- Audio controls for meditation

✅ **Enhanced Assessment System**
- Mobile-optimized question flow
- Progress tracking with visual indicators
- Arabic guidance integration
- Islamic references with proper typography

### Mobile-Specific Components

#### ArabicText Component
- Native font rendering with proper weights
- RTL text direction support
- Responsive sizing for different screen sizes

#### DhikrPlayer Component
- Audio playback controls (ready for audio library integration)
- Bilingual text display with enhanced typography
- Touch-friendly interface design

#### Enhanced Navigation
- Bottom tab navigation optimized for mobile
- Gesture-friendly screen transitions
- Context-aware back navigation

## Font Installation Process

### 1. Font File Setup
The Sakkal font files are already copied to `src/assets/fonts/`:
- SakkalKitabLt.woff/woff2 (Light - 300)
- SakkalKitab-Regular.woff/woff2 (Regular - 400)
- SakkalKitabMd.woff/woff2 (Medium - 500)
- SakkalKitab-Bold.woff/woff2 (Bold - 700)
- SakkalKitabHvy.woff/woff2 (Heavy - 900)

### 2. Font Registration
Run the following command to register fonts with React Native:
```bash
cd mobile
npx react-native link
```

### 3. Platform-Specific Font Setup

#### Android
Fonts are automatically copied to `android/app/src/main/assets/fonts/`

#### iOS
Fonts are automatically added to iOS bundle and Info.plist

## Development Workflow

### 1. Start Metro Bundler
```bash
cd mobile
npm start
```

### 2. Run on Android
```bash
npm run android
```

### 3. Run on iOS
```bash
npm run ios
```

### 4. Development Server
The mobile app connects to the web backend running on port 5000

## Screen Optimization

### Responsive Breakpoints
- Small phones: < 375px width
- Regular phones: 375px - 767px width  
- Tablets: ≥ 768px width

### Typography Scale
- Arabic text automatically scales based on device type
- Proper line height for Arabic text readability
- Consistent spacing across all screen sizes

### Performance Optimizations
- Lazy loading of screens
- Optimized font loading
- Efficient state management with React Context

## Deployment

### Android APK Build
```bash
cd mobile/android
./gradlew assembleRelease
```

### iOS App Store Build
```bash
cd mobile/ios
xcodebuild -workspace KeysToParadise.xcworkspace -scheme KeysToParadise archive
```

### Code Signing
- Configure Android signing keys
- Set up iOS provisioning profiles
- Update app identifiers and permissions

## Testing

### Device Testing
- Test on multiple Android devices (different screen sizes)
- Test on iPhone and iPad (various iOS versions)
- Verify Arabic font rendering across devices
- Test offline functionality

### Performance Testing
- Memory usage monitoring
- Battery usage optimization
- Network request efficiency
- Font loading performance

## Troubleshooting

### Font Issues
- Verify font files are properly linked
- Check platform-specific font registration
- Test Arabic text rendering in different sizes

### Navigation Issues  
- Ensure all screens are properly registered
- Verify navigation prop types
- Test deep linking functionality

### Build Issues
- Clean build directories: `npx react-native clean`
- Reset Metro cache: `npx react-native start --reset-cache`
- Rebuild native dependencies

## Next Steps

### Audio Integration
- Integrate react-native-sound for dhikr audio playback
- Add offline audio caching
- Implement background audio playback

### Push Notifications
- Set up prayer time notifications
- Daily spiritual reminders
- Achievement notifications

### Offline Capabilities
- Implement SQLite for offline data storage
- Content synchronization
- Offline assessment completion

### Advanced Features
- Qibla direction finder
- Prayer time calculations with location
- Social sharing of achievements
- Export progress reports