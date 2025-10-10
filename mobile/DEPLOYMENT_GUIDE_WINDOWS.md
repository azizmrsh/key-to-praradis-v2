# Keys to Paradise - Windows Deployment Guide

## App Information
- **App Name:** Keys to Paradise
- **Bundle ID:** com.rutab.keystoparadise
- **Version:** 0.1.1 (Alpha)
- **Platforms:** Android (Google Play Store) - iOS requires Mac or cloud service

---

## PART 1: SETUP ON YOUR WINDOWS PC

### Step 1: Download Your Project from Replit

1. In Replit, click the three dots menu (⋮) in the file explorer
2. Select "Download as zip"
3. Extract the zip file to a location on your PC (e.g., `C:\Users\YourName\Documents\KeysToParadise`)
4. Open Command Prompt or PowerShell and navigate to the project:
   ```powershell
   cd C:\Users\YourName\Documents\KeysToParadise
   ```

### Step 2: Install Required Software

#### Install Node.js (if not already installed)
```powershell
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
# Install Node.js 18 or higher (LTS version recommended)
```

#### Install Java Development Kit (JDK)
Android requires JDK 17:

1. Download JDK 17 from: https://adoptium.net/
2. Install with default options
3. Verify installation:
   ```powershell
   java -version
   ```

#### Install Android Studio
1. Download from: https://developer.android.com/studio
2. Run the installer
3. During setup, make sure to install:
   - Android SDK
   - Android SDK Platform (API 35)
   - Android SDK Build-Tools
   - Android Virtual Device (AVD)
4. Note the SDK location (typically: `C:\Users\YourName\AppData\Local\Android\Sdk`)

#### Set up Android Environment Variables

**Using Windows Settings UI:**
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", click "New" and add:

   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`

5. Select "Path" in User variables, click "Edit", then "New" and add these paths:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

6. Click "OK" on all dialogs
7. **Restart your Command Prompt/PowerShell** for changes to take effect

**Or using PowerShell (Run as Administrator):**
```powershell
# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourName\AppData\Local\Android\Sdk', 'User')

# Add to PATH
$path = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = "$path;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
```

Verify setup:
```powershell
# Restart PowerShell, then check:
adb --version
```

### Step 3: Install Project Dependencies

```powershell
# In the root project directory
cd C:\Users\YourName\Documents\KeysToParadise

# Install root dependencies
npm install

# Navigate to mobile folder
cd mobile

# Install mobile dependencies
npm install
```

---

## PART 2: INITIALIZE NATIVE ANDROID PROJECT

### Step 4: Create Android Native Folder

React Native needs a native Android project folder. Let's create it:

```powershell
# Make sure you're in the mobile folder
cd C:\Users\YourName\Documents\KeysToParadise\mobile

# Initialize the native project using React Native CLI
npx react-native init KeysToParadise --version 0.76.5 --directory temp_project

# Copy the Android folder to your mobile directory
xcopy temp_project\android android\ /E /I /H

# Clean up temporary project
rmdir /s /q temp_project
```

### Step 5: Set Up Entry Point

Your app code is already in `mobile/src/`. Ensure the entry point exists:

```powershell
# The index.js should already exist in mobile/
# If not, create it with this content:
```

Create `mobile/index.js`:
```javascript
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);
```

---

## PART 3: CONFIGURE FOR YOUR APP

### Step 6: Update Android Configuration

#### Edit `mobile\android\app\build.gradle`

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

#### Edit `mobile\android\app\src\main\AndroidManifest.xml`

Update the package and label:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rutab.keystoparadise">

    <application
      android:name=".MainApplication"
      android:label="Keys to Paradise"
      ...>
```

#### Update Java Package Names

Using File Explorer:
1. Navigate to `mobile\android\app\src\main\java\com\keystoparadise`
2. Create folder structure: `rutab\keystoparadise`
3. Move all files from `keystoparadise` into `rutab\keystoparadise\`
4. Delete the old `keystoparadise` folder

Or using PowerShell:
```powershell
cd mobile\android\app\src\main\java\com\keystoparadise
mkdir -p ..\rutab\keystoparadise
move * ..\rutab\keystoparadise\
cd ..\
rmdir keystoparadise
```

Update package declarations in:
- `mobile\android\app\src\main\java\com\rutab\keystoparadise\MainActivity.java`
- `mobile\android\app\src\main\java\com\rutab\keystoparadise\MainApplication.java`

Change from `package com.keystoparadise;` to `package com.rutab.keystoparadise;`

---

## PART 4: BUILD ANDROID RELEASE

### Step 7: Generate Android Signing Key

```powershell
cd mobile\android\app

# Generate keystore (you'll be asked for passwords - remember them!)
keytool -genkeypair -v -storetype PKCS12 -keystore keys-to-paradise.keystore -alias keys-to-paradise-key -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for:
- Keystore password (choose a strong password and **REMEMBER IT!**)
- Key password (choose a strong password and **REMEMBER IT!**)
- Your name, organization, city, state, country code

### Step 8: Configure Gradle for Signing

Create `mobile\android\gradle.properties` with this content:
```properties
MYAPP_UPLOAD_STORE_FILE=keys-to-paradise.keystore
MYAPP_UPLOAD_KEY_ALIAS=keys-to-paradise-key
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password_here
```

**⚠️ IMPORTANT:** Replace `your_keystore_password_here` and `your_key_password_here` with your actual passwords from Step 7.

#### Edit `mobile\android\app\build.gradle`

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

### Step 9: Build Android Release Bundle

```powershell
cd mobile\android

# Clean any previous builds
.\gradlew clean

# Build the release bundle (this may take several minutes)
.\gradlew bundleRelease
```

**Your Android App Bundle (.aab) will be at:**
`mobile\android\app\build\outputs\bundle\release\app-release.aab`

**This is the file you upload to Google Play Store!** 🎉

---

## PART 5: iOS BUILD (REQUIRES MAC)

### Option 1: Use a Mac Computer

iOS apps can only be built on macOS with Xcode. If you have access to a Mac, follow the Mac deployment guide (`DEPLOYMENT_GUIDE.md`).

### Option 2: Use Cloud Build Services

You can use cloud services to build iOS apps without a Mac:

#### **Expo Application Services (EAS)**
1. Sign up at: https://expo.dev/
2. Install EAS CLI:
   ```powershell
   npm install -g eas-cli
   ```
3. Configure and build:
   ```powershell
   cd mobile
   eas build --platform ios
   ```

#### **Codemagic**
1. Sign up at: https://codemagic.io/
2. Connect your repository
3. Configure iOS build workflow
4. Codemagic provides macOS build environment

#### **GitHub Actions with macOS Runner**
1. Set up GitHub Actions workflow
2. Use `macos-latest` runner
3. Configure Xcode and build steps

### Option 3: Rent a Mac

Services like:
- **MacStadium** (https://www.macstadium.com/)
- **MacinCloud** (https://www.macincloud.com/)
- **AWS EC2 Mac instances** (https://aws.amazon.com/ec2/instance-types/mac/)

---

## PART 6: UPLOAD TO GOOGLE PLAY STORE

### Step 10: Prepare Store Listing

Before uploading, prepare these materials:

1. **App Screenshots** (required):
   - At least 2 screenshots for phone
   - At least 1 screenshot for 7-inch tablet (optional)
   - At least 1 screenshot for 10-inch tablet (optional)
   - Recommended sizes: 1080 x 1920 pixels (portrait) or 1920 x 1080 (landscape)

2. **Feature Graphic** (required):
   - Size: 1024 x 500 pixels
   - JPG or PNG format

3. **App Icon** (required):
   - Size: 512 x 512 pixels
   - 32-bit PNG with alpha

4. **Privacy Policy URL** (required)

5. **App Description** (required):
   - Short description (max 80 characters)
   - Full description (max 4000 characters)

### Step 11: Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google Developer account
   - If you don't have one, you'll need to:
     - Pay one-time $25 registration fee
     - Complete account setup
3. Click "**Create app**"
4. Fill in app details:
   - **App name:** Keys to Paradise
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
   - Accept declarations
5. Click "**Create app**"

### Step 12: Complete Store Listing

In the left menu, go to "**Store presence**" → "**Main store listing**":

1. **App details:**
   - App name: Keys to Paradise
   - Short description: (80 chars) Brief description of your app
   - Full description: (4000 chars) Detailed description

2. **Graphics:**
   - Upload app icon (512 x 512 px)
   - Upload feature graphic (1024 x 500 px)
   - Upload phone screenshots (at least 2)
   - Upload tablet screenshots (optional)

3. **Categorization:**
   - App category: Lifestyle (or appropriate category)
   - Tags: Add relevant tags

4. **Contact details:**
   - Email address
   - Phone number (optional)
   - Website URL (optional)

5. **Privacy Policy:**
   - Enter your privacy policy URL

6. Click "**Save**"

### Step 13: Set Up App Content

Complete all required sections in the left menu:

1. **App access:**
   - All or only some functionality is restricted
   - If all features are available to all users, select "All functionality is available..."

2. **Ads:**
   - Select if your app contains ads

3. **Content ratings:**
   - Click "Start questionnaire"
   - Enter email address
   - Select category: Reference, News, or Education (based on your app)
   - Complete questionnaire
   - Click "Submit"

4. **Target audience:**
   - Select age groups
   - Specify if app appeals to children

5. **News app:**
   - Declare if it's a news app

6. **COVID-19 contact tracing and status apps:**
   - Declare if applicable

7. **Data safety:**
   - Click "Start"
   - Answer questions about data collection and sharing
   - Complete all sections
   - Click "Submit"

### Step 14: Select Countries and Regions

1. Go to "**Production**" → "**Countries/regions**"
2. Click "**Add countries/regions**"
3. Select countries where you want to distribute
4. Click "**Add**"

### Step 15: Create Release

1. Go to "**Production**" → "**Releases**"
2. Click "**Create new release**"
3. **Upload app bundle:**
   - Click "**Upload**"
   - Select your `app-release.aab` file from:
     `C:\Users\YourName\Documents\KeysToParadise\mobile\android\app\build\outputs\bundle\release\app-release.aab`
4. **Release name:** Will auto-fill based on version (e.g., "1 (0.1.1)")
5. **Release notes:**
   ```
   Alpha release - Initial version
   
   Features:
   • Spiritual guidance based on Islamic teachings
   • Self-assessment tools
   • Personalized recommendations
   • Multi-language support (English, Arabic, French)
   ```
6. Click "**Save**"
7. Click "**Review release**"
8. Review all information
9. Click "**Start rollout to Production**"

**Your app is now submitted for review!** Google typically reviews apps within 1-3 days.

---

## TROUBLESHOOTING

### Android Build Issues

**Error: ANDROID_HOME is not set**
```powershell
# Verify environment variables
echo $env:ANDROID_HOME

# Should show: C:\Users\YourName\AppData\Local\Android\Sdk
# If not, restart PowerShell after setting environment variables
```

**Error: SDK location not found**
```powershell
# Create local.properties file in android folder
cd mobile\android
echo sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk > local.properties
```

**Error: Java version issues**
```powershell
# Check Java version
java -version

# Should be Java 17. If not, download and install JDK 17 from:
# https://adoptium.net/
```

**Error: Gradle build fails**
```powershell
# Clear Gradle cache
cd mobile\android
.\gradlew clean
.\gradlew --stop

# Try build again
.\gradlew bundleRelease
```

**Error: Unable to find bundletool**
```powershell
# Make sure Android SDK Build-Tools is installed
# Open Android Studio → SDK Manager → SDK Tools
# Check "Android SDK Build-Tools"
```

**Error: Permission denied when running gradlew**
```powershell
# The gradlew.bat file might be blocked
# Right-click gradlew.bat → Properties → Unblock
```

### Common Issues

**Metro bundler issues**
```powershell
# Clear Metro cache
cd mobile
npx react-native start --reset-cache
```

**Node modules issues**
```powershell
# Clear and reinstall
cd mobile
rmdir /s /q node_modules
npm install
```

**Build too slow**
```powershell
# Enable Gradle daemon and parallel builds
# Add to mobile\android\gradle.properties:
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

---

## IMPORTANT SECURITY NOTES

1. **🔐 Keep your keystore file safe!**
   - Back it up to multiple secure locations (encrypted USB, cloud storage)
   - You need it for ALL future Android updates
   - If you lose it, you cannot update your app - you'd have to publish a new app

2. **🔑 Protect your passwords:**
   - Store keystore and key passwords in a password manager
   - Never commit `gradle.properties` to git
   - Add to `.gitignore`:
     ```
     # Sensitive files
     android/gradle.properties
     android/app/*.keystore
     ```

3. **📱 Test before releasing:**
   ```powershell
   # Test release build on device/emulator
   cd mobile
   npm run android -- --variant=release
   ```

4. **📝 For future updates:**
   - Android: Increment `versionCode` and `versionName` in `build.gradle`
   - Keep the same keystore and passwords
   - Build new bundle with updated version

---

## REQUIRED ASSETS CHECKLIST

Before submitting to Google Play Store, ensure you have:

- [ ] App Icon (512 x 512 px PNG)
- [ ] Feature Graphic (1024 x 500 px JPG/PNG)
- [ ] At least 2 Phone Screenshots (1080 x 1920 px)
- [ ] 7-inch Tablet Screenshots (optional)
- [ ] 10-inch Tablet Screenshots (optional)
- [ ] Privacy Policy URL
- [ ] Short Description (max 80 chars)
- [ ] Full Description (max 4000 chars)
- [ ] Content Rating Questionnaire completed
- [ ] Data Safety Form completed
- [ ] Signed AAB file ready

---

## NEXT STEPS AFTER SUCCESSFUL BUILD

1. ✅ **Test the release APK/Bundle** on real devices
2. ✅ **Create promotional materials** (screenshots, feature graphic)
3. ✅ **Write compelling app description** and keywords
4. ✅ **Set up privacy policy** (required by Google Play)
5. ✅ **Submit to Google Play Store** and wait for review
6. ✅ **Plan iOS deployment** using Mac or cloud services

---

## HELPFUL RESOURCES

- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Android Developer Guide:** https://developer.android.com/studio/publish
- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **Signing Your App:** https://developer.android.com/studio/publish/app-signing
- **Play Store Listing Guide:** https://developer.android.com/distribute/best-practices/launch/store-listing

---

## iOS DEPLOYMENT RESOURCES

Since Windows cannot build iOS apps natively, consider these options:

1. **Expo EAS Build:** https://docs.expo.dev/build/introduction/
2. **Codemagic:** https://docs.codemagic.io/
3. **GitHub Actions:** https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners
4. **MacStadium:** https://www.macstadium.com/
5. **MacinCloud:** https://www.macincloud.com/

---

**Good luck with your app launch on Windows!** 🚀🎉

*For iOS deployment, refer to the Mac deployment guide (`DEPLOYMENT_GUIDE.md`) or use cloud build services.*
