# Keys to Paradise - App Store Deployment Guide

## App Information
- **App Name:** Keys to Paradise
- **Bundle ID:** com.rutab.keystoparadise
- **Version:** 0.1.1 (Alpha)
- **Platforms:** iOS (App Store) and Android (Google Play Store)

---

## PART 1: SETUP ON YOUR MAC

### Step 1: Download Your Project from Replit

1. In Replit, click the three dots menu (⋮) in the file explorer
2. Select "Download as zip"
3. Extract the zip file to a location on your Mac (e.g., `~/Documents/KeysToParadise`)
4. Open Terminal and navigate to the project:
   ```bash
   cd ~/Documents/KeysToParadise
   ```

### Step 2: Install Required Software

#### Install Node.js (if not already installed)
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
# Install Node.js 18 or higher
```

#### Install Xcode (Already installed ✓)
Make sure you have Xcode 16+ installed from the Mac App Store.

#### Install Xcode Command Line Tools
```bash
xcode-select --install
```

#### Install CocoaPods (for iOS dependencies)
```bash
sudo gem install cocoapods
```

#### Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. During setup, install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
4. Set up Android SDK location (typically: `~/Library/Android/sdk`)

#### Add Android SDK to PATH
Add these lines to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:
```bash
source ~/.zshrc
```

### Step 3: Install Project Dependencies

```bash
# In the root project directory
cd ~/Documents/KeysToParadise

# Install root dependencies
npm install

# Navigate to mobile folder
cd mobile

# Install mobile dependencies
npm install
```

---

## PART 2: INITIALIZE NATIVE PROJECTS

### Step 4: Create iOS and Android Native Folders

React Native needs native iOS and Android project folders. Let's create them:

```bash
# Make sure you're in the mobile folder
cd ~/Documents/KeysToParadise/mobile

# Initialize the native projects using React Native CLI
npx react-native init KeysToParadise --version 0.76.5 --directory temp_project

# Copy the native folders to your mobile directory
cp -r temp_project/ios ./
cp -r temp_project/android ./

# Clean up temporary project
rm -rf temp_project
```

### Step 5: Copy Your Source Code

Your app code is already in `mobile/src/`. Now we need to update the entry points:

```bash
# The index.js should already exist in mobile/
# If not, create it with:
cat > index.js << 'EOF'
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);
EOF
```

---

## PART 3: CONFIGURE FOR YOUR APP

### Step 6: Update Android Configuration

#### Edit `mobile/android/app/build.gradle`

Find and update these sections:

```gradle
android {
    namespace "com.rutab.keystoparadise"
    compileSdkVersion 35
    buildToolsVersion "35.0.0"

    defaultConfig {
        applicationId "com.rutab.keystoparadise"
        minSdkVersion 21
        targetSdkVersion 35
        versionCode 1
        versionName "0.1.1"
    }
}
```

#### Edit `mobile/android/app/src/main/AndroidManifest.xml`

Update the package and label:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rutab.keystoparadise">

    <application
      android:name=".MainApplication"
      android:label="Keys to Paradise"
      ...>
```

#### Update Java/Kotlin package names

Rename the package folders:
```bash
cd mobile/android/app/src/main/java/com/keystoparadise
mkdir -p ../rutab/keystoparadise
mv * ../rutab/keystoparadise/
cd ../
rm -rf keystoparadise
```

Update package declarations in:
- `mobile/android/app/src/main/java/com/rutab/keystoparadise/MainActivity.java`
- `mobile/android/app/src/main/java/com/rutab/keystoparadise/MainApplication.java`

Change from `package com.keystoparadise;` to `package com.rutab.keystoparadise;`

### Step 7: Update iOS Configuration

#### Edit `mobile/ios/KeysToParadise.xcodeproj/project.pbxproj`

Open the project in Xcode:
```bash
cd mobile/ios
open KeysToParadise.xcworkspace
```

In Xcode:
1. Select the project in the left sidebar
2. Select the "KeysToParadise" target
3. Under "General" tab:
   - Set **Display Name:** Keys to Paradise
   - Set **Bundle Identifier:** com.rutab.keystoparadise
   - Set **Version:** 0.1.1
   - Set **Build:** 1

4. Under "Signing & Capabilities" tab:
   - Select your **Team** (your Apple Developer account)
   - Xcode will automatically manage signing

#### Install iOS Dependencies
```bash
cd mobile/ios
pod install
```

---

## PART 4: BUILD FOR ANDROID

### Step 8: Generate Android Signing Key

```bash
cd mobile/android/app

# Generate keystore (you'll be asked for passwords - remember them!)
keytool -genkeypair -v -storetype PKCS12 -keystore keys-to-paradise.keystore -alias keys-to-paradise-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (remember this!)
# - Key password (remember this!)
# - Your name, organization, etc.
```

### Step 9: Configure Gradle for Signing

Create `mobile/android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=keys-to-paradise.keystore
MYAPP_UPLOAD_KEY_ALIAS=keys-to-paradise-key
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password_here
```

**⚠️ IMPORTANT:** Replace the passwords with your actual passwords from Step 8.

#### Edit `mobile/android/app/build.gradle`

Add signing config (after the `android {` block starts, before `defaultConfig`):

```gradle
android {
    ...
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### Step 10: Build Android Release Bundle

```bash
cd mobile/android

# Clean any previous builds
./gradlew clean

# Build the release bundle
./gradlew bundleRelease
```

**Your Android App Bundle (.aab) will be at:**
`mobile/android/app/build/outputs/bundle/release/app-release.aab`

This is the file you upload to Google Play Store!

---

## PART 5: BUILD FOR iOS

### Step 11: Prepare iOS Build

```bash
cd mobile/ios
pod install
```

### Step 12: Open in Xcode and Archive

```bash
open KeysToParadise.xcworkspace
```

In Xcode:

1. **Select Target Device:**
   - At the top, next to the Run button, select "Any iOS Device (arm64)"

2. **Clean Build Folder:**
   - Menu: Product → Clean Build Folder

3. **Archive:**
   - Menu: Product → Archive
   - Wait for the archive to complete (this may take a few minutes)

4. **Distribute to App Store:**
   - When archive completes, the Organizer window opens
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Choose "Upload"
   - Select "Automatically manage signing"
   - Click "Upload"

**Your app is now uploaded to App Store Connect!**

---

## PART 6: UPLOAD TO STORES

### For Google Play Store:

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - App name: Keys to Paradise
   - Default language: English
   - App or game: App
   - Free or paid: Free (or your choice)
4. Complete the store listing:
   - Upload screenshots
   - Write description
   - Add privacy policy URL
5. Go to "Release" → "Production" → "Create new release"
6. Upload `app-release.aab` file
7. Add release notes: "Alpha release - Initial version with spiritual guidance features"
8. Review and roll out

### For Apple App Store:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - Platform: iOS
   - Name: Keys to Paradise
   - Primary Language: English
   - Bundle ID: com.rutab.keystoparadise (select from dropdown)
   - SKU: KEYSTOPARADISE01
4. After upload completes in Xcode, select the build in App Store Connect
5. Complete:
   - App description
   - Keywords
   - Screenshots (multiple sizes needed)
   - Privacy policy URL
   - Age rating
   - App category
6. Submit for review

---

## TROUBLESHOOTING

### Android Build Issues

**Error: SDK location not found**
```bash
# Create local.properties file
echo "sdk.dir=$HOME/Library/Android/sdk" > mobile/android/local.properties
```

**Error: Java version issues**
```bash
# Install Java 17
brew install openjdk@17
```

### iOS Build Issues

**CocoaPods errors**
```bash
cd mobile/ios
pod deintegrate
pod install
```

**Signing errors**
- Make sure you're logged into Xcode with your Apple Developer account
- Go to Xcode → Settings → Accounts
- Add your Apple ID if not present

---

## IMPORTANT NOTES

1. **Keep your keystore file safe!** Back it up securely. You need it for all future Android updates.

2. **Never commit passwords to git.** The `gradle.properties` file with passwords should not be in version control.

3. **Test before releasing:**
   ```bash
   # Android
   cd mobile
   npm run android -- --variant=release
   
   # iOS
   npm run ios -- --configuration Release
   ```

4. **For updates:** Increment the version numbers:
   - Android: Update `versionCode` and `versionName` in `build.gradle`
   - iOS: Update `Version` and `Build` in Xcode

5. **App Icons:** You'll need to add proper app icons before submission:
   - Android: `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - iOS: Add to `ios/KeysToParadise/Images.xcassets/AppIcon.appiconset/`

---

## NEXT STEPS AFTER FOLLOWING THIS GUIDE

1. ✅ Test the app on real devices
2. ✅ Create app screenshots for both stores
3. ✅ Write compelling app descriptions
4. ✅ Prepare privacy policy URL
5. ✅ Submit for review

**Good luck with your app launch!** 🚀
