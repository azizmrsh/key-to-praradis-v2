# 📱 دليل بناء تطبيق iOS - Keys to Paradise

## ⚠️ متطلبات iOS

### للأسف، بناء تطبيقات iOS **يتطلب Mac** أو أحد البدائل التالية:

---

## 🖥️ الخيار 1: استخدام Mac (الأفضل)

إذا كان عندك Mac أو يمكنك الوصول لواحد:

### 1. متطلبات النظام:
- macOS 12 أو أحدث
- Xcode 14+ (من App Store)
- CocoaPods: `sudo gem install cocoapods`

### 2. الخطوات:

```bash
# نقل المشروع للـ Mac
# ثم في Terminal:

cd Keys-to-Paradise

# تثبيت CocoaPods dependencies
cd ios/App
pod install

# فتح المشروع في Xcode
open App.xcworkspace

# في Xcode:
# 1. اختر Team (Apple Developer Account)
# 2. اختر Device أو Simulator
# 3. اضغط Run ▶️
```

### 3. للنشر على App Store:

```bash
# في Xcode:
# Product → Archive
# ثم Window → Organizer
# اختر Archive واضغط Distribute App
```

---

## ☁️ الخيار 2: خدمات البناء السحابية (موصى به)

### أ) **Codemagic** (الأسهل) ⭐

```
1. سجل في: https://codemagic.io/
2. اربط GitHub/GitLab repository
3. اختر Capacitor/Ionic project
4. اختر iOS build
5. أضف Apple Developer credentials
6. اضغط Start new build
```

**المميزات:**
- ✅ مجاني لـ 500 دقيقة/شهر
- ✅ واجهة سهلة
- ✅ يدعم Capacitor مباشرة
- ✅ يبني وينشر تلقائياً

### ب) **EAS Build من Expo**

```powershell
# تثبيت EAS CLI
npm install -g eas-cli

# تسجيل دخول
eas login

# إعداد المشروع
eas build:configure

# بناء iOS
eas build --platform ios
```

**التكلفة:**
- ✅ مجاني للمشاريع المفتوحة
- 💰 $29/شهر للمشاريع الخاصة

### ج) **GitHub Actions**

إنشاء ملف `.github/workflows/ios-build.yml`:

```yaml
name: iOS Build

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build web assets
      run: npm run build
    
    - name: Sync Capacitor
      run: npx cap sync ios
    
    - name: Install CocoaPods
      run: |
        cd ios/App
        pod install
    
    - name: Build iOS
      run: |
        cd ios/App
        xcodebuild -workspace App.xcworkspace \
          -scheme App \
          -configuration Release \
          -archivePath $PWD/build/App.xcarchive \
          archive
```

---

## 🏢 الخيار 3: استئجار Mac في السحاب

### **MacStadium** (للمحترفين)
- 🌐 https://www.macstadium.com/
- 💰 من $79/شهر
- ⚡ Mac حقيقي في السحاب

### **MacinCloud** (بالساعة)
- 🌐 https://www.macincloud.com/
- 💰 من $1/ساعة
- 🕐 دفع حسب الاستخدام

### **AWS EC2 Mac**
- 🌐 https://aws.amazon.com/ec2/instance-types/mac/
- 💰 ~$1.10/ساعة
- ☁️ AWS infrastructure

---

## 📋 متطلبات App Store

### 1. حساب Apple Developer:
- 💰 $99/سنة
- 📝 https://developer.apple.com/programs/

### 2. الصور المطلوبة:

#### App Icon:
- 📏 **1024×1024 بكسل**
- 📄 PNG بدون شفافية
- 📁 الموقع: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Screenshots:
- 📱 iPhone 6.7" (1290×2796)
- 📱 iPhone 6.5" (1242×2688)
- 📱 iPhone 5.5" (1242×2208) - اختياري
- 📱 iPad Pro 12.9" (2048×2732) - اختياري

### 3. معلومات التطبيق:

```
✓ App Name: Keys to Paradise
✓ Bundle ID: com.rutab.keystoparadise
✓ Version: 1.0.0
✓ Build Number: 1
✓ Category: Lifestyle أو Education
✓ Age Rating: 4+ أو 12+
✓ Privacy Policy URL: [مطلوب]
```

---

## 🎨 تجهيز الأيقونات لـ iOS

### يدوياً:

احفظ اللوجو بهذه الأحجام في `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:

| الاسم | الحجم |
|------|-------|
| Icon-20@2x.png | 40×40 |
| Icon-20@3x.png | 60×60 |
| Icon-29@2x.png | 58×58 |
| Icon-29@3x.png | 87×87 |
| Icon-40@2x.png | 80×80 |
| Icon-40@3x.png | 120×120 |
| Icon-60@2x.png | 120×120 |
| Icon-60@3x.png | 180×180 |
| Icon-76.png | 76×76 |
| Icon-76@2x.png | 152×152 |
| Icon-83.5@2x.png | 167×167 |
| Icon-1024.png | 1024×1024 |

### أو استخدم أداة:

```bash
# تثبيت الأداة
npm install -g app-icon

# توليد الأيقونات
app-icon generate -i attached_assets/QT_final_logo-02-01_1751283453807.png -o ios/App/App/Assets.xcassets/AppIcon.appiconset
```

---

## 📝 ملف Info.plist

الملف موجود في: `ios/App/App/Info.plist`

المعلومات المهمة:
- ✅ **CFBundleDisplayName:** Keys to Paradise
- ✅ **CFBundleIdentifier:** com.rutab.keystoparadise  
- ✅ **CFBundleShortVersionString:** 1.0.0
- ✅ **CFBundleVersion:** 1

---

## 🚀 الخطوات الموصى بها للنشر

### للمبتدئين (الأسهل):

1. **استخدم Codemagic:**
   - ارفع الكود على GitHub
   - اربط Codemagic بالـ repository
   - أضف Apple Developer credentials
   - اضغط Build

2. **بعد البناء:**
   - Codemagic سيرفع تلقائياً على TestFlight
   - اختبر التطبيق
   - أرسله للمراجعة

### للمتقدمين:

1. **استخدم Mac أو MacinCloud**
2. **افتح في Xcode**
3. **Archive → Distribute**
4. **ارفع على App Store Connect**

---

## ⏱️ الجدول الزمني المتوقع

| الخطوة | الوقت |
|--------|------|
| إعداد Apple Developer Account | 1-2 أيام |
| إعداد Codemagic | 30 دقيقة |
| البناء الأول | 10-15 دقيقة |
| TestFlight | فوري |
| مراجعة App Store | 1-3 أيام |

---

## 💡 نصيحة

**الحل الأمثل لك:**

1. ✅ **الآن:** استخدم **Codemagic** (مجاني وسهل)
2. ✅ **لاحقاً:** إذا احتجت تحكم أكثر، استأجر Mac

---

## 📞 روابط مفيدة

- **Codemagic Docs:** https://docs.codemagic.io/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Apple Developer:** https://developer.apple.com/
- **App Store Connect:** https://appstoreconnect.apple.com/

---

**الخلاصة:**

❌ **Windows لا يمكن بناء iOS مباشرة**
✅ **استخدم Codemagic (مجاني وسهل)**
✅ **أو استأجر Mac بالساعة عند الحاجة**

---

آخر تحديث: 10 أكتوبر 2025
