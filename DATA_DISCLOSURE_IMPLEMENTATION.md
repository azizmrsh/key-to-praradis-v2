# Keys to Paradise - Google Play Data Safety Declaration

**Version Code:** 9  
**Version Name:** 1.0.2  
**Last Updated:** October 30, 2025

---

## 📋 Data Safety Summary for Google Play Console

### Does your app collect or share any user data?
**❌ NO** - This app does NOT collect or share ANY user data.

---

## 🔒 Complete Data Safety Declaration

### 1. Location Data
- **Collected:** ❌ NO
- **Shared:** ❌ NO
- **Status:** Location permissions have been **completely removed** from AndroidManifest.xml
- **Note:** Users manually input city names for prayer time calculations. No GPS or location services are used.

### 2. Personal Information
- **Collected:** ❌ NO
- **Shared:** ❌ NO
- **Types:** Name, Email, Address, Phone - **NONE collected**

### 3. Financial Information
- **Collected:** ❌ NO
- **Shared:** ❌ NO
- **Note:** App is completely free with no in-app purchases

### 4. Health & Fitness
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 5. Messages
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 6. Photos & Videos
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 7. Audio Files
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 8. Files & Docs
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 9. Calendar
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 10. Contacts
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 11. App Activity
- **Collected:** ❌ NO
- **Shared:** ❌ NO
- **Note:** No analytics, tracking, or usage statistics are collected

### 12. Web Browsing
- **Collected:** ❌ NO
- **Shared:** ❌ NO

### 13. App Info & Performance
- **Collected:** ❌ NO
- **Shared:** ❌ NO
- **Note:** No crash reports, diagnostics, or performance data sent to servers

### 14. Device or Other IDs
- **Collected:** ❌ NO
- **Shared:** ❌ NO
- **Note:** No advertising ID, Android ID, or device fingerprinting

---

## 📱 Permissions Used

### ✅ INTERNET Permission
- **Purpose:** ONLY for fetching prayer times from Photon API (OpenStreetMap)
- **Data Sent:** City search queries (e.g., "London", "مكة")
- **Data Received:** City coordinates and timezone information
- **Third Party:** Photon API (https://photon.komoot.io) - OpenStreetMap based
- **Privacy:** No user identification, tracking, or personal data

### ❌ Removed Permissions
- `ACCESS_FINE_LOCATION` - **REMOVED**
- `ACCESS_COARSE_LOCATION` - **REMOVED**
- `POST_NOTIFICATIONS` - **REMOVED**

---

## 💾 Data Storage

### All Data is Stored LOCALLY on Device
- **Prayer tracking data** → localStorage (browser storage)
- **Spiritual assessment results** → localStorage
- **Daily habit tracking** → localStorage
- **User preferences** → localStorage
- **Prayer settings** → localStorage

### ❌ NO Server-Side Storage
- No databases
- No cloud backup
- No remote sync
- No user accounts

---

## 🌐 Third-Party Services

### 1. Photon API (https://photon.komoot.io)
- **Purpose:** City name → Coordinates conversion for prayer times
- **Data Sent:** Search query only (e.g., "Mecca", "القاهرة")
- **Data Received:** Latitude, Longitude, Timezone, City metadata
- **Privacy Policy:** OpenStreetMap based, no tracking
- **User Identification:** ❌ None

### 2. Prayer Time Calculation (adhan library)
- **Type:** Local calculation library
- **Runs:** Completely offline on device
- **Data Sent:** ❌ None - all calculations are local

---

## 🔐 Security Practices

### Data Encryption
- **In Transit:** ❌ Not applicable (no data transmitted except city search)
- **At Rest:** ❌ Not applicable (localStorage is isolated per app)

### User Data Deletion
- Users can clear app data via:
  1. Android Settings → Apps → Keys to Paradise → Clear Data
  2. No server-side data to delete

### Data Access Request
- ❌ Not applicable - app stores no personal data

---

## 🎯 App Functionality Summary

### What the App Does:
1. **Prayer Time Calculation:** Uses coordinates + local library
2. **Spiritual Assessment:** Local questionnaire storage
3. **Daily Tracking:** Prayer records stored locally
4. **Habit Building:** 40-day challenge tracking (local)
5. **Islamic Content:** Pre-loaded Quranic verses and hadiths

### What the App Does NOT Do:
- ❌ Track user behavior
- ❌ Collect analytics
- ❌ Use advertising networks
- ❌ Access device sensors (GPS, camera, microphone)
- ❌ Send data to external servers (except city search API)
- ❌ Create user accounts
- ❌ Sync across devices

---

## 📝 Google Play Console Checklist

### Section 1: Data Collection and Security
- [ ] Does your app collect or share user data? → **NO**

### Section 2: Data Types (Select ALL that apply)
- [ ] Location → **Not collected**
- [ ] Personal info → **Not collected**
- [ ] Financial info → **Not collected**
- [ ] Health & Fitness → **Not collected**
- [ ] Messages → **Not collected**
- [ ] Photos and videos → **Not collected**
- [ ] Audio files → **Not collected**
- [ ] Files and docs → **Not collected**
- [ ] Calendar → **Not collected**
- [ ] Contacts → **Not collected**
- [ ] App activity → **Not collected**
- [ ] Web browsing → **Not collected**
- [ ] App info and performance → **Not collected**
- [ ] Device or other IDs → **Not collected**

### Section 3: Security Practices
- [ ] Data is encrypted in transit → **Not applicable**
- [ ] Users can request data deletion → **Not applicable**
- [ ] Data is not transferred to third parties → **YES (except city search API)**

---

## 🚀 How to Fill Google Play Data Safety Form

### Step 1: Data Collection
**"Does your app collect or share any of the required user data types?"**
- Select: **NO**

### Step 2: Confirmation
**"Confirm that your app doesn't collect any user data"**
- Check the box: ✅ "I confirm this app doesn't collect any user data"

### Step 3: Save
- Click **Save** → **Submit**

---

## 📄 Privacy Policy Statement

**Keys to Paradise** is a privacy-focused, offline-first Islamic spiritual development app.

- **No Data Collection:** We do not collect, store, or share any personal information.
- **Local Storage Only:** All user data (prayers, assessments, habits) remains on your device.
- **No Tracking:** No analytics, crash reporting, or usage statistics.
- **No Accounts:** No sign-up, login, or user profiles.
- **Minimal Permissions:** Only INTERNET permission for prayer time API.

**City Search Privacy:**
When you search for a city, the app sends your search query to Photon API (OpenStreetMap) to get coordinates. This is the ONLY data sent outside your device.

**Your Control:**
You can delete all app data anytime through Android Settings → Apps → Keys to Paradise → Clear Data.

---

## ✅ Verification Checklist

- [x] Version Code updated to 9
- [x] Location permissions removed from AndroidManifest.xml
- [x] Notification permissions removed
- [x] No Firebase/Analytics in code
- [x] No Google Services integration
- [x] Only INTERNET permission used
- [x] All data stored in localStorage
- [x] City search is the only external API call
- [x] No user identification or tracking
- [x] Privacy-focused design documented

---

**For Google Play Review Team:**

This app is a spiritual wellness tool that operates entirely offline. The only network usage is for converting city names to coordinates for accurate prayer time calculations. No user data is collected, tracked, or shared with any third parties.

All previous location permission issues have been resolved by:
1. Removing GPS/Location permissions
2. Implementing manual city search
3. Using public OpenStreetMap API for coordinates
4. Storing all user data locally on device

Thank you for your consideration.

---

**App Developer:** azizmrsh  
**Contact:** [Your Email]  
**Repository:** https://github.com/azizmrsh/key-to-praradis-v2