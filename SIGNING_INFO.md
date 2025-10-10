# 🔐 معلومات التوقيع - Keys to Paradise

## ⚠️ هام جداً - احفظ هذه المعلومات!

### معلومات Keystore:

**Keystore File:** `keys-to-paradise.keystore`
**Alias:** `keys-to-paradise-key`

### كلمات المرور:

📝 **Keystore Password:** `pgt-keystoparadise`
📝 **Key Password:** `pgt-keystoparadise`

---

## معلومات المنظمة (للتوقيع):

- **الاسم الكامل (CN):** Rutab Educational Training And Rehabilitation
- **الوحدة التنظيمية (OU):** . (نقطة)
- **المنظمة (O):** Rutab Educational Training And Rehabilitation
- **المدينة (L):** Amman
- **المحافظة (S):** Amman
- **رمز الدولة (C):** JO

---

## 🔑 الأمر لإنشاء Keystore:

```powershell
cd android\app
keytool -genkeypair -v -storetype PKCS12 -keystore keys-to-paradise.keystore -alias keys-to-paradise-key -keyalg RSA -keysize 2048 -validity 10000
```

### عند السؤال:
1. **Keystore password:** pgt-keystoparadise
2. **Re-enter password:** pgt-keystoparadise
3. **First and last name:** Rutab Educational Training And Rehabilitation
4. **Organizational unit:** .
5. **Organization:** Rutab Educational Training And Rehabilitation
6. **City or Locality:** Amman
7. **State or Province:** Amman
8. **Country code:** JO
9. **Is this correct?** yes
10. **Key password:** (اضغط Enter لنفس كلمة المرور)

---

## ⚠️ ملاحظات مهمة:

1. **احتفظ بنسخة احتياطية** من ملف `keys-to-paradise.keystore`
2. **لا تشارك** كلمات المرور مع أحد
3. **لا ترفع** الملف على Git
4. **إذا فقدت الملف** لن تستطيع تحديث التطبيق أبداً!

---

## 📁 الموقع:
`android/app/keys-to-paradise.keystore`
