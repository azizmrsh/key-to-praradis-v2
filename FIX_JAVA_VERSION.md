# ⚠️ حل مشكلة Java Version

## المشكلة
```
error: invalid source release: 21
```

Capacitor 7 يحتاج **Java 21** لكن عندك **Java 17**

---

## 🔧 الحل السريع

### الخيار 1: تنزيل Java 21 (موصى به)

1. **حمّل Java 21:**
   - زر الرابط: https://adoptium.net/temurin/releases/
   - اختر:
     - **Version:** 21 - LTS
     - **Operating System:** Windows
     - **Architecture:** x64
   - حمّل ونصّب

2. **بعد التنصيب:**
   ```powershell
   # تحقق من الإصدار
   java -version
   # يجب أن يظهر: openjdk version "21.x.x"
   ```

3. **أعد بناء التطبيق:**
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   npx cap sync android
   npx cap open android
   ```

---

### الخيار 2: استخدام Capacitor 6 (أسرع)

إذا ما تبي تنزل Java 21، استخدم Capacitor 6:

```powershell
# إلغاء تثبيت Capacitor 7
npm uninstall @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# تثبيت Capacitor 6
npm install @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6 @capacitor/ios@6

# حذف مجلدات Android/iOS القديمة
Remove-Item -Recurse -Force android
Remove-Item -Recurse -Force ios

# إعادة إضافة المنصات
npx cap add android
npx cap add ios

# تحديث build.gradle
# في android/app/build.gradle
# غيّر versionName إلى "0.1.1"
# غيّر applicationId إلى "com.rutab.keystoparadise"
# غيّر namespace إلى "com.rutab.keystoparadise"

# مزامنة
npx cap sync android

# فتح Android Studio
npx cap open android
```

---

## ✅ التوصية

**استخدم الخيار 2** (Capacitor 6) لأنه:
- ✅ أسرع (ما يحتاج تنزيل Java)
- ✅ مستقر أكثر
- ✅ يشتغل مع Java 17 اللي عندك
- ✅ مدعوم بالكامل

---

## 🚀 بعد الحل

```powershell
# افتح Android Studio
npx cap open android

# في Android Studio:
# 1. انتظر Gradle Sync
# 2. اختر Device/Emulator
# 3. اضغط Run ▶️
```
