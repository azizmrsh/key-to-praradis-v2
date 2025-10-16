# دليل بناء تطبيق Android من الصفر
## Capacitor + Android Studio Guide

هذا الدليل يشرح كيفية تنظيف وبناء التطبيق من البداية باستخدام Capacitor و Android Studio.

---

## 📋 المتطلبات الأساسية

### 1. تثبيت Node.js
- تحميل Node.js من: https://nodejs.org/
- التأكد من الإصدار: `node --version` (يُفضل v18 أو أحدث)

### 2. تثبيت Android Studio
- تحميل من: https://developer.android.com/studio
- تثبيت Android SDK وأدوات التطوير
- إعداد متغير البيئة `ANDROID_HOME`

### 3. تثبيت Java Development Kit (JDK)
- تثبيت JDK 11 أو أحدث
- إعداد متغير البيئة `JAVA_HOME`

---

## 🧹 خطوات التنظيف الكامل

### الخطوة 1: تنظيف المجلد الحالي
```cmd
cd "C:\Users\mzyz2\Desktop\Project\rabiit\key-to-praradis-v2"

# حذف مجلدات البناء والتبعيات
rmdir /S /Q node_modules
rmdir /S /Q client\node_modules
rmdir /S /Q mobile\node_modules
rmdir /S /Q client\dist
rmdir /S /Q mobile\dist
rmdir /S /Q android\app\build
rmdir /S /Q android\build
```

### الخطوة 2: حذف ملفات الـ lock
```cmd
del package-lock.json
del client\package-lock.json
del mobile\package-lock.json
```

---

## 📦 إعادة تثبيت التبعيات

### الخطوة 1: تثبيت تبعيات المشروع الرئيسي
```cmd
cd "C:\Users\mzyz2\Desktop\Project\rabiit\key-to-praradis-v2"
npm install
```

### الخطوة 2: تثبيت تبعيات Client
```cmd
cd client
npm install
cd ..
```

### الخطوة 3: تثبيت تبعيات Mobile
```cmd
cd mobile
npm install
cd ..
```

---

## 🔨 بناء التطبيق

### الخطوة 1: بناء Client (Web Version)
```cmd
cd client
npm run build
cd ..
```

### الخطوة 2: بناء Mobile
```cmd
cd mobile
npm run build
cd ..
```

### الخطوة 3: مزامنة Capacitor مع Android
```cmd
# مزامنة الملفات المبنية مع Android
npx cap sync android

# أو إذا كنت تريد إضافة منصة Android من جديد
npx cap add android
npx cap sync android
```

---

## 🏗️ فتح المشروع في Android Studio

### الطريقة الأولى: عبر سطر الأوامر
```cmd
npx cap open android
```

### الطريقة الثانية: فتح Android Studio يدوياً
1. فتح Android Studio
2. اختيار "Open an existing project"
3. الذهاب إلى: `C:\Users\mzyz2\Desktop\Project\rabiit\key-to-praradis-v2\android`
4. اختيار مجلد `android`

---

## ⚙️ إعدادات Android Studio

### عند فتح المشروع لأول مرة:
1. **Gradle Sync**: سيبدأ تلقائياً، انتظر حتى ينتهي
2. **SDK Setup**: تأكد من تثبيت Android SDK المطلوب
3. **Emulator**: أنشئ جهاز افتراضي أو وصّل جهاز حقيقي

### تشغيل التطبيق:
1. اختر الجهاز (Emulator أو Device)
2. اضغط على زر "Run" الأخضر
3. أو استخدم: `Shift + F10`

---

## 🔧 حل المشاكل الشائعة

### مشكلة Gradle Sync Failed
```cmd
cd android
.\gradlew clean
cd ..
npx cap sync android
```

### مشكلة في إصدار Java
- تأكد من تثبيت JDK 11 أو أحدث
- تحقق من متغير البيئة `JAVA_HOME`

### مشكلة في Android SDK
- في Android Studio: `Tools > SDK Manager`
- تثبيت Android SDK المطلوب (API Level 21+)

### مشكلة في التبعيات
```cmd
# حذف وإعادة تثبيت كل شيء
rmdir /S /Q node_modules
rmdir /S /Q client\node_modules
rmdir /S /Q mobile\node_modules
npm install
cd client && npm install && cd ..
cd mobile && npm install && cd ..
```

---

## 🚀 سير العمل المُوصى به

### للتطوير اليومي:
1. **تطوير الكود** في `client/src` أو `mobile/src`
2. **بناء التطبيق**:
   ```cmd
   cd client && npm run build && cd ..
   cd mobile && npm run build && cd ..
   ```
3. **مزامنة مع Android**:
   ```cmd
   npx cap sync android
   ```
4. **اختبار في Android Studio**

### للبناء النهائي:
1. تنظيف كامل (الخطوات أعلاه)
2. إعادة بناء كل شيء
3. مزامنة Capacitor
4. بناء APK أو AAB من Android Studio

---

## 📝 أوامر Capacitor المفيدة

```cmd
# عرض معلومات المشروع
npx cap info

# إضافة منصة جديدة
npx cap add android
npx cap add ios

# مزامنة الملفات
npx cap sync

# مزامنة منصة محددة
npx cap sync android

# فتح في IDE
npx cap open android
npx cap open ios

# تشغيل في المتصفح (للتطوير)
npx cap run android --livereload

# إنشاء أيقونات وشاشات البداية
npx cap-assets generate
```

---

## 🎯 ملاحظات مهمة

1. **دائماً** اعمل `npm run build` قبل `npx cap sync`
2. **لا تعدّل** ملفات في مجلد `android/` مباشرة - استخدم `capacitor.config.ts`
3. **للتغييرات الكبيرة** في التكوين، امسح مجلد `android/` واعمل `npx cap add android`
4. **استخدم LiveReload** للتطوير السريع: `npx cap run android --livereload`

---

## 📞 في حالة المشاكل

إذا واجهت أي مشكلة:
1. تحقق من `npx cap doctor` للتأكد من الإعدادات
2. راجع سجل الأخطاء في Android Studio
3. تأكد من أن جميع التبعيات محدثة
4. جرّب التنظيف الكامل وإعادة البناء

---

**تاريخ آخر تحديث:** أكتوبر 2025  
**إصدار Capacitor:** 6.x  
**إصدار Android Target:** API Level 21+