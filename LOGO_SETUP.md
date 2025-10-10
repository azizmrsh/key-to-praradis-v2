# 🎨 إضافة اللوجو للتطبيق

## 📱 للأندرويد

### الطريقة الأسهل - استخدام Android Studio:

1. **افتح Android Studio**
2. **انقر بيمين على** `android/app/src/main/res`
3. **اختر:** New → Image Asset
4. **في النافذة:**
   - **Icon Type:** Launcher Icons (Adaptive and Legacy)
   - **Path:** اختر الملف: `C:\Users\Aziz\Desktop\expo\Keys-to-Paradise\img\logo.svg`
   - اضغط **Next** ثم **Finish**

### أو يدوياً - حوّل SVG إلى PNG:

#### 1. حوّل اللوجو إلى PNG بأحجام مختلفة:

استخدم موقع مثل: https://cloudconvert.com/svg-to-png

**الأحجام المطلوبة:**

| المجلد | الحجم (بكسل) |
|--------|--------------|
| `mipmap-mdpi` | 48 × 48 |
| `mipmap-hdpi` | 72 × 72 |
| `mipmap-xhdpi` | 96 × 96 |
| `mipmap-xxhdpi` | 144 × 144 |
| `mipmap-xxxhdpi` | 192 × 192 |

#### 2. احفظ الملفات في:

```
android/app/src/main/res/
  ├── mipmap-mdpi/ic_launcher.png (48×48)
  ├── mipmap-hdpi/ic_launcher.png (72×72)
  ├── mipmap-xhdpi/ic_launcher.png (96×96)
  ├── mipmap-xxhdpi/ic_launcher.png (144×144)
  └── mipmap-xxxhdpi/ic_launcher.png (192×192)
```

#### 3. للأيقونة الدائرية (Round Icon):

نفس الخطوات لكن احفظ باسم:
- `ic_launcher_round.png`

---

## 🔧 بعد إضافة اللوجو:

```powershell
# نظف الكاش
cd android
.\gradlew clean

# ارجع للمجلد الرئيسي
cd ..

# زامن
npx cap sync android

# افتح Android Studio
npx cap open android
```

---

## ✅ ملاحظات:

1. **اللوجو يجب أن يكون PNG** (ليس SVG) للأندرويد
2. **الخلفية الشفافة** أفضل
3. **مربع الشكل** (1:1 نسبة)
4. **ألوان واضحة** تظهر على خلفيات مختلفة
