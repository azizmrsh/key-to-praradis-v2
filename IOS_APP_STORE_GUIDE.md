# دليل رفع تطبيق Keys To Paradise على App Store

## 📋 جدول المحتويات
1. [المتطلبات الأساسية](#المتطلبات-الأساسية)
2. [إعداد Apple Developer Account](#إعداد-apple-developer-account)
3. [إعداد Certificates & Provisioning Profiles](#إعداد-certificates--provisioning-profiles)
4. [بناء التطبيق للإنتاج](#بناء-التطبيق-للإنتاج)
5. [إعداد App Store Connect](#إعداد-app-store-connect)
6. [رفع التطبيق](#رفع-التطبيق)
7. [مراجعة App Store](#مراجعة-app-store)
8. [نشر التطبيق](#نشر-التطبيق)

---

## 🛠 المتطلبات الأساسية

### ✅ تأكد من وجود:
- [x] macOS مع Xcode مثبت
- [x] Apple Developer Account (99$ سنوياً)
- [x] التطبيق جاهز ومختبر
- [x] جميع الأيقونات والصور جاهزة
- [x] وصف التطبيق والكلمات المفتاحية
- [x] سياسة الخصوصية (Privacy Policy)

### معلومات التطبيق الحالية:
```
App ID: com.rutab.keystoparadise
App Name: Keys To Paradise
Version: 1.0.0
Build Number: 5
```

---

## 🔐 إعداد Apple Developer Account

### 1. إنشاء/تسجيل الدخول لحساب Apple Developer
1. اذهب إلى [Apple Developer](https://developer.apple.com)
2. سجل الدخول بحساب Apple ID
3. اشترك في Apple Developer Program ($99/سنة)
4. انتظر الموافقة (قد تستغرق 24-48 ساعة)

### 2. إنشاء App ID
1. اذهب إلى [Apple Developer Console](https://developer.apple.com/account)
2. اختر **Certificates, Identifiers & Profiles**
3. اختر **Identifiers** > **App IDs**
4. انقر **+** لإنشاء App ID جديد
5. املأ البيانات:
   - **Description**: Keys To Paradise
   - **Bundle ID**: `com.rutab.keystoparadise`
   - **Capabilities**: اختر المطلوب (Push Notifications, etc.)

---

## 📱 إعداد Certificates & Provisioning Profiles

### 1. إنشاء Distribution Certificate
```bash
# في Terminal
cd ~/Desktop
mkdir KeysToParadise_Certificates
cd KeysToParadise_Certificates

# إنشاء Certificate Signing Request
openssl genrsa -out keystoparadise.key 2048
openssl req -new -key keystoparadise.key -out keystoparadise.csr
```

عند سؤالك عن المعلومات:
- **Country**: SA
- **State**: الرياض
- **City**: الرياض  
- **Organization**: Rutab
- **Unit**: IT
- **Common Name**: Keys To Paradise Distribution
- **Email**: بريدك الإلكتروني

### 2. رفع CSR في Apple Developer
1. في **Certificates** > **Production**
2. انقر **+** > **iOS Distribution**
3. ارفع ملف `keystoparadise.csr`
4. حمل الـ certificate `keystoparadise_distribution.cer`
5. انقر عليه مرتين لتثبيته في Keychain

### 3. إنشاء Provisioning Profile
1. في **Profiles** > **Distribution**
2. انقر **+** > **App Store**
3. اختر App ID: `com.rutab.keystoparadise`
4. اختر Distribution Certificate
5. اسم الـ Profile: `Keys To Paradise App Store`
6. حمل الملف وانقر عليه مرتين

---

## 🏗 بناء التطبيق للإنتاج

### 1. تنظيف وبناء المشروع
```bash
cd /Users/salahhaj/Desktop/Aziz/expo/Keys-to-Paradise

# تنظيف الملفات القديمة
rm -rf dist
rm -rf node_modules/.cache

# تثبيت التبعيات
npm install

# بناء المشروع
npm run build

# مزامنة مع iOS
npx cap sync ios
```

### 2. فتح المشروع في Xcode
```bash
npx cap open ios
```

### 3. إعداد Xcode للإنتاج

#### في Xcode:
1. اختر مشروع **App** من اليسار
2. اختر **Target: App**
3. في تبويب **Signing & Capabilities**:
   - ✅ **Automatically manage signing**: إلغي التحديد
   - **Team**: اختر فريق Apple Developer
   - **Provisioning Profile**: اختر `Keys To Paradise App Store`

#### في تبويب **General**:
- **Display Name**: `Keys To Paradise`
- **Bundle Identifier**: `com.rutab.keystoparadise`
- **Version**: `1.0.0`
- **Build**: `5`

#### في تبويب **Build Settings**:
- ابحث عن **Code Signing Identity**
- **Release**: `iOS Distribution`

### 4. إضافة الأيقونات
1. في **Assets.xcassets** > **AppIcon**
2. اسحب الأيقونات للأحجام المطلوبة:
   - 20x20, 29x29, 40x40, 58x58, 60x60, 80x80, 87x87, 120x120, 180x180
   - 1024x1024 للـ App Store

### 5. بناء Archive
1. في Xcode: **Product** > **Destination** > **Any iOS Device**
2. **Product** > **Archive**
3. انتظر حتى انتهاء البناء
4. سيفتح **Organizer** تلقائياً

---

## 🚀 إعداد App Store Connect

### 1. إنشاء التطبيق في App Store Connect
1. اذهب إلى [App Store Connect](https://appstoreconnect.apple.com)
2. انقر **My Apps** > **+** > **New App**
3. املأ البيانات:
   - **Name**: Keys To Paradise
   - **Primary Language**: Arabic
   - **Bundle ID**: اختر `com.rutab.keystoparadise`
   - **SKU**: `keystoparadise001`

### 2. ملء معلومات التطبيق

#### في **App Information**:
- **Name**: Keys To Paradise
- **Subtitle**: دليلك للتقوى والإصلاح
- **Category**: Lifestyle أو Education
- **Content Rights**: اختر المناسب

#### في **Pricing and Availability**:
- **Price**: Free (0.00)
- **Availability**: جميع البلدان أو اختر بلدان محددة

#### في **App Privacy**:
- انقر **Get Started**
- أجب على الأسئلة حول جمع البيانات
- ارفع رابط سياسة الخصوصية

---

## 📦 رفع التطبيق

### 1. رفع Archive من Xcode
في **Organizer**:
1. اختر الـ Archive الذي بنيته
2. انقر **Distribute App**
3. اختر **App Store Connect**
4. اختر **Upload**
5. اتبع الخطوات وانقر **Upload**

### 2. التحقق من الرفع
1. في App Store Connect
2. اذهب إلى تطبيقك
3. **TestFlight** - سترى البناء هناك خلال دقائق
4. **App Store** > **iOS App** - ستحتاج لإضافة البناء يدوياً

### 3. إضافة البناء للمراجعة
1. في **App Store** تبويب
2. انقر **+ Version or Platform**
3. اختر **iOS**
4. **Version**: 1.0.0
5. في **Build** انقر **+** واختر البناء المرفوع

---

## 📝 ملء معلومات App Store

### معلومات مقترحة للتطبيق:

#### **الوصف العربي**:
```
مفاتيح الجنة - رحلتك نحو التقوى والإصلاح

اكتشف طريقك نحو حياة أفضل مع تطبيق "مفاتيح الجنة". يوفر التطبيق:

🕌 تقييم شخصي شامل لمستوى التقوى
📚 محتوى تعليمي وإرشادي متنوع
🎯 تحديات يومية للنمو الروحي
📊 تتبع التقدم والإنجازات
🤲 أوقات الصلاة والتذكيرات
📖 مكتبة محتوى إسلامي غني

انضم إلى آلاف المستخدمين في رحلة التطوير الذاتي والنمو الروحي.
```

#### **الوصف الإنجليزي**:
```
Keys to Paradise - Your Journey to Righteousness

Discover your path to a better life with "Keys to Paradise" app. Features include:

🕌 Comprehensive personal assessment for piety level
📚 Diverse educational and guidance content  
🎯 Daily challenges for spiritual growth
📊 Progress tracking and achievements
🤲 Prayer times and reminders
📖 Rich Islamic content library

Join thousands of users on their self-development and spiritual growth journey.
```

#### **الكلمات المفتاحية**:
```
إسلام,تقوى,صلاة,قرآن,تطوير,ذاتي,روحانية,إصلاح,تزكية,دين
Islam,piety,prayer,Quran,development,spiritual,growth,religion,faith,Islamic
```

#### **Screenshots المطلوبة**:
- iPhone 6.7": 1290 × 2796 pixels (3 صور على الأقل)
- iPhone 6.5": 1242 × 2688 pixels (3 صور على الأقل)
- iPad Pro 12.9": 2048 × 2732 pixels (إذا كان يدعم iPad)

### نصائح للـ Screenshots:
1. استخدم الشاشة الرئيسية
2. صفحة التقييم
3. صفحة التحديات
4. صفحة أوقات الصلاة
5. صفحة الإنجازات

---

## 🔍 مراجعة App Store

### قبل الإرسال للمراجعة:
- [ ] جميع الحقول مملوءة
- [ ] Screenshots مرفوعة
- [ ] وصف التطبيق واضح
- [ ] سياسة الخصوصية متاحة
- [ ] App Privacy مكتمل
- [ ] تم اختبار التطبيق بالكامل

### إرسال للمراجعة:
1. انقر **Add for Review**
2. أجب على أسئلة المراجعة:
   - **Export Compliance**: No (ما لم تستخدم تشفير)
   - **Content Rights**: اختر المناسب
   - **Advertising Identifier**: No (إذا لم تستخدم إعلانات)

3. انقر **Submit for Review**

### مدة المراجعة:
- عادة: 24-48 ساعة
- المراجعة الأولى قد تستغرق أسبوع
- إذا تم الرفض، صحح المشاكل وأعد الإرسال

---

## ✅ نشر التطبيق

### بعد الموافقة:
1. ستحصل على إيميل بالموافقة
2. في App Store Connect ستجد **Ready for Sale**
3. يمكنك اختيار:
   - **Manually release**: نشر يدوي
   - **Automatically release**: نشر تلقائي

### بعد النشر:
- التطبيق سيظهر في App Store خلال 2-24 ساعة
- يمكن البحث عنه باسم "Keys To Paradise"
- ستحصل على رابط مباشر للتطبيق

---

## 🔄 التحديثات المستقبلية

### لرفع تحديث جديد:
```bash
# زيادة رقم الإصدار
# في package.json غير version إلى 1.0.1
# في Xcode غير Version إلى 1.0.1 و Build إلى 6

npm run build
npx cap sync ios
# افتح Xcode وبنئ Archive جديد
```

---

## 🚨 مشاكل شائعة وحلولها

### المشكلة: Certificate خطأ
**الحل**: تأكد من تثبيت Distribution Certificate في Keychain

### المشكلة: Provisioning Profile خطأ
**الحل**: تأكد من أن App ID و Certificate متطابقان

### المشكلة: Archive فشل
**الحل**: تأكد من اختيار "Any iOS Device" قبل Archive

### المشكلة: رفض من App Store
**الحلول الشائعة**:
- أضف سياسة خصوصية
- تأكد من وجود جميع الأيقونات
- تأكد من أن التطبيق لا يتعطل
- أضف وصف واضح للتطبيق

---

## 📞 جهات الاتصال للدعم

- **Apple Developer Support**: [developer.apple.com/support](https://developer.apple.com/support)
- **App Store Connect Help**: [help.apple.com/app-store-connect](https://help.apple.com/app-store-connect)

---

## ✅ Checklist النهائي

قبل الرفع تأكد من:

### التطوير:
- [ ] التطبيق مبني ويعمل بدون أخطاء
- [ ] تم اختبار جميع الميزات
- [ ] الأيقونات موجودة بجميع الأحجام
- [ ] معلومات التطبيق صحيحة

### Apple Developer:
- [ ] حساب Apple Developer نشط
- [ ] App ID منشأ
- [ ] Distribution Certificate مثبت
- [ ] Provisioning Profile محمل

### App Store Connect:
- [ ] التطبيق منشأ في App Store Connect
- [ ] جميع المعلومات مملوءة
- [ ] Screenshots مرفوعة
- [ ] وصف التطبيق كامل
- [ ] سياسة الخصوصية موجودة
- [ ] السعر محدد

### الرفع:
- [ ] Archive مبني بنجاح
- [ ] التطبيق مرفوع لـ App Store Connect
- [ ] Build مضاف للمراجعة
- [ ] مُرسل للمراجعة

---

## 🎉 تهانينا!

بعد اتباع هذه الخطوات، سيكون تطبيق "Keys To Paradise" متاحاً على App Store للمستخدمين حول العالم!

---

**تاريخ الإنشاء**: أكتوبر 2025  
**الإصدار**: 1.0  
**المطور**: Rutab Team
