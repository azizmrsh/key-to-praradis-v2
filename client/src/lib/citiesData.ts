// Geocoding API Service for City Search
export interface CityData {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  displayName: string; // Full formatted address
}

// Free Geocoding API (geocode.maps.co) - No API key needed for basic usage
const GEOCODING_API_BASE = 'https://geocode.maps.co/search';
  { name: "Jeddah", nameAr: "جدة", nameFr: "Djeddah", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 21.5433, longitude: 39.1728, timezone: "Asia/Riyadh" },
  { name: "Dammam", nameAr: "الدمام", nameFr: "Dammam", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 26.4207, longitude: 50.0888, timezone: "Asia/Riyadh" },
  { name: "Khobar", nameAr: "الخبر", nameFr: "Khobar", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 26.2172, longitude: 50.1971, timezone: "Asia/Riyadh" },
  { name: "Abha", nameAr: "أبها", nameFr: "Abha", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 18.2164, longitude: 42.5053, timezone: "Asia/Riyadh" },
  { name: "Taif", nameAr: "الطائف", nameFr: "Taif", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 21.2703, longitude: 40.4150, timezone: "Asia/Riyadh" },
  { name: "Tabuk", nameAr: "تبوك", nameFr: "Tabuk", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 28.3998, longitude: 36.5715, timezone: "Asia/Riyadh" },
  { name: "Buraidah", nameAr: "بريدة", nameFr: "Buraidah", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 26.3260, longitude: 43.9750, timezone: "Asia/Riyadh" },
  { name: "Khamis Mushait", nameAr: "خميس مشيط", nameFr: "Khamis Mushait", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 18.3000, longitude: 42.7333, timezone: "Asia/Riyadh" },
  { name: "Hail", nameAr: "حائل", nameFr: "Hail", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 27.5219, longitude: 41.6901, timezone: "Asia/Riyadh" },
  { name: "Hofuf", nameAr: "الهفوف", nameFr: "Hofuf", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 25.3647, longitude: 49.5856, timezone: "Asia/Riyadh" },
  { name: "Yanbu", nameAr: "ينبع", nameFr: "Yanbu", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 24.0894, longitude: 38.0618, timezone: "Asia/Riyadh" },
  { name: "Jubail", nameAr: "الجبيل", nameFr: "Jubail", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 27.0040, longitude: 49.6555, timezone: "Asia/Riyadh" },
  { name: "Najran", nameAr: "نجران", nameFr: "Najran", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 17.4917, longitude: 44.1278, timezone: "Asia/Riyadh" },
  { name: "Jazan", nameAr: "جازان", nameFr: "Jazan", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 16.8892, longitude: 42.5511, timezone: "Asia/Riyadh" },
  { name: "Arar", nameAr: "عرعر", nameFr: "Arar", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 30.9753, longitude: 41.0381, timezone: "Asia/Riyadh" },
  { name: "Sakaka", nameAr: "سكاكا", nameFr: "Sakaka", country: "Saudi Arabia", countryAr: "السعودية", countryFr: "Arabie Saoudite", latitude: 29.9697, longitude: 40.2064, timezone: "Asia/Riyadh" },
  
  // ========== الإمارات ==========
  { name: "Dubai", nameAr: "دبي", nameFr: "Dubaï", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { name: "Abu Dhabi", nameAr: "أبو ظبي", nameFr: "Abou Dhabi", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai" },
  { name: "Sharjah", nameAr: "الشارقة", nameFr: "Sharjah", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 25.3463, longitude: 55.4209, timezone: "Asia/Dubai" },
  { name: "Ajman", nameAr: "عجمان", nameFr: "Ajman", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 25.4052, longitude: 55.5137, timezone: "Asia/Dubai" },
  { name: "Ras Al Khaimah", nameAr: "رأس الخيمة", nameFr: "Ras Al Khaimah", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 25.7895, longitude: 55.9432, timezone: "Asia/Dubai" },
  { name: "Fujairah", nameAr: "الفجيرة", nameFr: "Fujairah", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 25.1164, longitude: 56.3422, timezone: "Asia/Dubai" },
  { name: "Al Ain", nameAr: "العين", nameFr: "Al Ain", country: "UAE", countryAr: "الإمارات", countryFr: "EAU", latitude: 24.2075, longitude: 55.7447, timezone: "Asia/Dubai" },
  
  // ========== الكويت ==========
  { name: "Kuwait City", nameAr: "مدينة الكويت", nameFr: "Koweït", country: "Kuwait", countryAr: "الكويت", countryFr: "Koweït", latitude: 29.3759, longitude: 47.9774, timezone: "Asia/Kuwait" },
  { name: "Hawalli", nameAr: "حولي", nameFr: "Hawalli", country: "Kuwait", countryAr: "الكويت", countryFr: "Koweït", latitude: 29.3331, longitude: 48.0289, timezone: "Asia/Kuwait" },
  { name: "Salmiya", nameAr: "السالمية", nameFr: "Salmiya", country: "Kuwait", countryAr: "الكويت", countryFr: "Koweït", latitude: 29.3344, longitude: 48.0531, timezone: "Asia/Kuwait" },
  { name: "Farwaniya", nameAr: "الفروانية", nameFr: "Farwaniya", country: "Kuwait", countryAr: "الكويت", countryFr: "Koweït", latitude: 29.2775, longitude: 47.9588, timezone: "Asia/Kuwait" },
  { name: "Jahra", nameAr: "الجهراء", nameFr: "Jahra", country: "Kuwait", countryAr: "الكويت", countryFr: "Koweït", latitude: 29.3375, longitude: 47.6581, timezone: "Asia/Kuwait" },
  
  // ========== قطر ==========
  { name: "Doha", nameAr: "الدوحة", nameFr: "Doha", country: "Qatar", countryAr: "قطر", countryFr: "Qatar", latitude: 25.2854, longitude: 51.5310, timezone: "Asia/Qatar" },
  { name: "Al Rayyan", nameAr: "الريان", nameFr: "Al Rayyan", country: "Qatar", countryAr: "قطر", countryFr: "Qatar", latitude: 25.2919, longitude: 51.4244, timezone: "Asia/Qatar" },
  { name: "Al Wakrah", nameAr: "الوكرة", nameFr: "Al Wakrah", country: "Qatar", countryAr: "قطر", countryFr: "Qatar", latitude: 25.1654, longitude: 51.5985, timezone: "Asia/Qatar" },
  
  // ========== البحرين ==========
  { name: "Manama", nameAr: "المنامة", nameFr: "Manama", country: "Bahrain", countryAr: "البحرين", countryFr: "Bahreïn", latitude: 26.2285, longitude: 50.5860, timezone: "Asia/Bahrain" },
  { name: "Riffa", nameAr: "الرفاع", nameFr: "Riffa", country: "Bahrain", countryAr: "البحرين", countryFr: "Bahreïn", latitude: 26.1300, longitude: 50.5550, timezone: "Asia/Bahrain" },
  { name: "Muharraq", nameAr: "المحرق", nameFr: "Muharraq", country: "Bahrain", countryAr: "البحرين", countryFr: "Bahreïn", latitude: 26.2571, longitude: 50.6195, timezone: "Asia/Bahrain" },
  
  // ========== عمان ==========
  { name: "Muscat", nameAr: "مسقط", nameFr: "Mascate", country: "Oman", countryAr: "عمان", countryFr: "Oman", latitude: 23.5880, longitude: 58.3829, timezone: "Asia/Muscat" },
  { name: "Salalah", nameAr: "صلالة", nameFr: "Salalah", country: "Oman", countryAr: "عمان", countryFr: "Oman", latitude: 17.0151, longitude: 54.0924, timezone: "Asia/Muscat" },
  { name: "Sohar", nameAr: "صحار", nameFr: "Sohar", country: "Oman", countryAr: "عمان", countryFr: "Oman", latitude: 24.3607, longitude: 56.7090, timezone: "Asia/Muscat" },
  { name: "Nizwa", nameAr: "نزوى", nameFr: "Nizwa", country: "Oman", countryAr: "عمان", countryFr: "Oman", latitude: 22.9333, longitude: 57.5333, timezone: "Asia/Muscat" },
  
  // ========== مصر ==========
  { name: "Cairo", nameAr: "القاهرة", nameFr: "Le Caire", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo" },
  { name: "Alexandria", nameAr: "الإسكندرية", nameFr: "Alexandrie", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 31.2001, longitude: 29.9187, timezone: "Africa/Cairo" },
  { name: "Giza", nameAr: "الجيزة", nameFr: "Gizeh", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 30.0131, longitude: 31.2089, timezone: "Africa/Cairo" },
  { name: "Shubra El Kheima", nameAr: "شبرا الخيمة", nameFr: "Shubra El Kheima", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 30.1286, longitude: 31.2422, timezone: "Africa/Cairo" },
  { name: "Port Said", nameAr: "بورسعيد", nameFr: "Port-Saïd", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 31.2653, longitude: 32.3019, timezone: "Africa/Cairo" },
  { name: "Suez", nameAr: "السويس", nameFr: "Suez", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 29.9668, longitude: 32.5498, timezone: "Africa/Cairo" },
  { name: "Luxor", nameAr: "الأقصر", nameFr: "Louxor", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 25.6872, longitude: 32.6396, timezone: "Africa/Cairo" },
  { name: "Mansoura", nameAr: "المنصورة", nameFr: "Mansoura", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 31.0364, longitude: 31.3807, timezone: "Africa/Cairo" },
  { name: "Tanta", nameAr: "طنطا", nameFr: "Tanta", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 30.7865, longitude: 31.0004, timezone: "Africa/Cairo" },
  { name: "Asyut", nameAr: "أسيوط", nameFr: "Assiout", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 27.1809, longitude: 31.1837, timezone: "Africa/Cairo" },
  { name: "Ismailia", nameAr: "الإسماعيلية", nameFr: "Ismaïlia", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 30.5833, longitude: 32.2667, timezone: "Africa/Cairo" },
  { name: "Fayyum", nameAr: "الفيوم", nameFr: "Fayoum", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 29.3084, longitude: 30.8428, timezone: "Africa/Cairo" },
  { name: "Zagazig", nameAr: "الزقازيق", nameFr: "Zagazig", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 30.5877, longitude: 31.5021, timezone: "Africa/Cairo" },
  { name: "Aswan", nameAr: "أسوان", nameFr: "Assouan", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 24.0889, longitude: 32.8998, timezone: "Africa/Cairo" },
  { name: "Damanhur", nameAr: "دمنهور", nameFr: "Damanhur", country: "Egypt", countryAr: "مصر", countryFr: "Égypte", latitude: 31.0341, longitude: 30.4683, timezone: "Africa/Cairo" },
  
  // ========== الأردن ==========
  { name: "Amman", nameAr: "عمان", nameFr: "Amman", country: "Jordan", countryAr: "الأردن", countryFr: "Jordanie", latitude: 31.9454, longitude: 35.9284, timezone: "Asia/Amman" },
  { name: "Zarqa", nameAr: "الزرقاء", nameFr: "Zarqa", country: "Jordan", countryAr: "الأردن", countryFr: "Jordanie", latitude: 32.0606, longitude: 36.0995, timezone: "Asia/Amman" },
  { name: "Irbid", nameAr: "إربد", nameFr: "Irbid", country: "Jordan", countryAr: "الأردن", countryFr: "Jordanie", latitude: 32.5556, longitude: 35.8469, timezone: "Asia/Amman" },
  { name: "Aqaba", nameAr: "العقبة", nameFr: "Aqaba", country: "Jordan", countryAr: "الأردن", countryFr: "Jordanie", latitude: 29.5321, longitude: 35.0063, timezone: "Asia/Amman" },
  { name: "Madaba", nameAr: "مادبا", nameFr: "Madaba", country: "Jordan", countryAr: "الأردن", countryFr: "Jordanie", latitude: 31.7167, longitude: 35.7925, timezone: "Asia/Amman" },
  { name: "Salt", nameAr: "السلط", nameFr: "Salt", country: "Jordan", countryAr: "الأردن", countryFr: "Jordanie", latitude: 32.0392, longitude: 35.7272, timezone: "Asia/Amman" },
  
  // ========== لبنان ==========
  { name: "Beirut", nameAr: "بيروت", nameFr: "Beyrouth", country: "Lebanon", countryAr: "لبنان", countryFr: "Liban", latitude: 33.8886, longitude: 35.4955, timezone: "Asia/Beirut" },
  { name: "Tripoli", nameAr: "طرابلس", nameFr: "Tripoli", country: "Lebanon", countryAr: "لبنان", countryFr: "Liban", latitude: 34.4333, longitude: 35.8333, timezone: "Asia/Beirut" },
  { name: "Sidon", nameAr: "صيدا", nameFr: "Saïda", country: "Lebanon", countryAr: "لبنان", countryFr: "Liban", latitude: 33.5630, longitude: 35.3756, timezone: "Asia/Beirut" },
  { name: "Tyre", nameAr: "صور", nameFr: "Tyr", country: "Lebanon", countryAr: "لبنان", countryFr: "Liban", latitude: 33.2733, longitude: 35.1933, timezone: "Asia/Beirut" },
  { name: "Nabatieh", nameAr: "النبطية", nameFr: "Nabatieh", country: "Lebanon", countryAr: "لبنان", countryFr: "Liban", latitude: 33.3770, longitude: 35.4838, timezone: "Asia/Beirut" },
  { name: "Zahle", nameAr: "زحلة", nameFr: "Zahlé", country: "Lebanon", countryAr: "لبنان", countryFr: "Liban", latitude: 33.8463, longitude: 35.9017, timezone: "Asia/Beirut" },
  
  // ========== سوريا ==========
  { name: "Damascus", nameAr: "دمشق", nameFr: "Damas", country: "Syria", countryAr: "سوريا", countryFr: "Syrie", latitude: 33.5138, longitude: 36.2765, timezone: "Asia/Damascus" },
  { name: "Aleppo", nameAr: "حلب", nameFr: "Alep", country: "Syria", countryAr: "سوريا", countryFr: "Syrie", latitude: 36.2021, longitude: 37.1343, timezone: "Asia/Damascus" },
  { name: "Homs", nameAr: "حمص", nameFr: "Homs", country: "Syria", countryAr: "سوريا", countryFr: "Syrie", latitude: 34.7324, longitude: 36.7095, timezone: "Asia/Damascus" },
  { name: "Latakia", nameAr: "اللاذقية", nameFr: "Lattaquié", country: "Syria", countryAr: "سوريا", countryFr: "Syrie", latitude: 35.5333, longitude: 35.7833, timezone: "Asia/Damascus" },
  { name: "Hama", nameAr: "حماة", nameFr: "Hama", country: "Syria", countryAr: "سوريا", countryFr: "Syrie", latitude: 35.1500, longitude: 36.7500, timezone: "Asia/Damascus" },
  
  // ========== العراق ==========
  { name: "Baghdad", nameAr: "بغداد", nameFr: "Bagdad", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 33.3152, longitude: 44.3661, timezone: "Asia/Baghdad" },
  { name: "Basra", nameAr: "البصرة", nameFr: "Bassora", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 30.5085, longitude: 47.7960, timezone: "Asia/Baghdad" },
  { name: "Mosul", nameAr: "الموصل", nameFr: "Mossoul", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 36.3350, longitude: 43.1189, timezone: "Asia/Baghdad" },
  { name: "Erbil", nameAr: "أربيل", nameFr: "Erbil", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 36.1911, longitude: 44.0094, timezone: "Asia/Baghdad" },
  { name: "Kirkuk", nameAr: "كركوك", nameFr: "Kirkouk", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 35.4681, longitude: 44.3922, timezone: "Asia/Baghdad" },
  { name: "Najaf", nameAr: "النجف", nameFr: "Najaf", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 32.0000, longitude: 44.3333, timezone: "Asia/Baghdad" },
  { name: "Karbala", nameAr: "كربلاء", nameFr: "Karbala", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 32.6100, longitude: 44.0250, timezone: "Asia/Baghdad" },
  { name: "Sulaymaniyah", nameAr: "السليمانية", nameFr: "Souleimaniye", country: "Iraq", countryAr: "العراق", countryFr: "Irak", latitude: 35.5558, longitude: 45.4375, timezone: "Asia/Baghdad" },
  
  // ========== فلسطين ==========
  { name: "Jerusalem", nameAr: "القدس", nameFr: "Jérusalem", country: "Palestine", countryAr: "فلسطين", countryFr: "Palestine", latitude: 31.7683, longitude: 35.2137, timezone: "Asia/Jerusalem" },
  { name: "Gaza", nameAr: "غزة", nameFr: "Gaza", country: "Palestine", countryAr: "فلسطين", countryFr: "Palestine", latitude: 31.5000, longitude: 34.4667, timezone: "Asia/Gaza" },
  { name: "Hebron", nameAr: "الخليل", nameFr: "Hébron", country: "Palestine", countryAr: "فلسطين", countryFr: "Palestine", latitude: 31.5326, longitude: 35.0998, timezone: "Asia/Hebron" },
  { name: "Nablus", nameAr: "نابلس", nameFr: "Naplouse", country: "Palestine", countryAr: "فلسطين", countryFr: "Palestine", latitude: 32.2211, longitude: 35.2544, timezone: "Asia/Jerusalem" },
  { name: "Ramallah", nameAr: "رام الله", nameFr: "Ramallah", country: "Palestine", countryAr: "فلسطين", countryFr: "Palestine", latitude: 31.9038, longitude: 35.2034, timezone: "Asia/Hebron" },
  
  // ========== تركيا ==========
  { name: "Istanbul", nameAr: "إسطنبول", nameFr: "Istanbul", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul" },
  { name: "Ankara", nameAr: "أنقرة", nameFr: "Ankara", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul" },
  { name: "Izmir", nameAr: "إزمير", nameFr: "Izmir", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 38.4237, longitude: 27.1428, timezone: "Europe/Istanbul" },
  { name: "Bursa", nameAr: "بورصة", nameFr: "Bursa", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 40.1885, longitude: 29.0610, timezone: "Europe/Istanbul" },
  { name: "Adana", nameAr: "أضنة", nameFr: "Adana", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 37.0000, longitude: 35.3213, timezone: "Europe/Istanbul" },
  { name: "Gaziantep", nameAr: "غازي عنتاب", nameFr: "Gaziantep", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 37.0662, longitude: 37.3833, timezone: "Europe/Istanbul" },
  { name: "Konya", nameAr: "قونيا", nameFr: "Konya", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 37.8746, longitude: 32.4932, timezone: "Europe/Istanbul" },
  { name: "Antalya", nameAr: "أنطاليا", nameFr: "Antalya", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 36.8969, longitude: 30.7133, timezone: "Europe/Istanbul" },
  { name: "Diyarbakir", nameAr: "ديار بكر", nameFr: "Diyarbakir", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 37.9144, longitude: 40.2306, timezone: "Europe/Istanbul" },
  { name: "Mersin", nameAr: "مرسين", nameFr: "Mersin", country: "Turkey", countryAr: "تركيا", countryFr: "Turquie", latitude: 36.8121, longitude: 34.6415, timezone: "Europe/Istanbul" },
  
  // ========== إيران ==========
  { name: "Tehran", nameAr: "طهران", nameFr: "Téhéran", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 35.6892, longitude: 51.3890, timezone: "Asia/Tehran" },
  { name: "Mashhad", nameAr: "مشهد", nameFr: "Mashhad", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 36.2974, longitude: 59.6067, timezone: "Asia/Tehran" },
  { name: "Isfahan", nameAr: "أصفهان", nameFr: "Ispahan", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 32.6546, longitude: 51.6680, timezone: "Asia/Tehran" },
  { name: "Karaj", nameAr: "كرج", nameFr: "Karaj", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 35.8355, longitude: 51.0103, timezone: "Asia/Tehran" },
  { name: "Tabriz", nameAr: "تبريز", nameFr: "Tabriz", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 38.0800, longitude: 46.2919, timezone: "Asia/Tehran" },
  { name: "Shiraz", nameAr: "شيراز", nameFr: "Chiraz", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 29.5918, longitude: 52.5836, timezone: "Asia/Tehran" },
  { name: "Qom", nameAr: "قم", nameFr: "Qom", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 34.6416, longitude: 50.8746, timezone: "Asia/Tehran" },
  { name: "Ahvaz", nameAr: "الأحواز", nameFr: "Ahvaz", country: "Iran", countryAr: "إيران", countryFr: "Iran", latitude: 31.3183, longitude: 48.6706, timezone: "Asia/Tehran" },
  
  // ========== المغرب ==========
  { name: "Casablanca", nameAr: "الدار البيضاء", nameFr: "Casablanca", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 33.5731, longitude: -7.5898, timezone: "Africa/Casablanca" },
  { name: "Rabat", nameAr: "الرباط", nameFr: "Rabat", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 34.0209, longitude: -6.8416, timezone: "Africa/Casablanca" },
  { name: "Marrakech", nameAr: "مراكش", nameFr: "Marrakech", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 31.6295, longitude: -7.9811, timezone: "Africa/Casablanca" },
  { name: "Fes", nameAr: "فاس", nameFr: "Fès", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 34.0181, longitude: -5.0078, timezone: "Africa/Casablanca" },
  { name: "Tangier", nameAr: "طنجة", nameFr: "Tanger", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 35.7595, longitude: -5.8340, timezone: "Africa/Casablanca" },
  { name: "Agadir", nameAr: "أكادير", nameFr: "Agadir", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 30.4278, longitude: -9.5981, timezone: "Africa/Casablanca" },
  { name: "Meknes", nameAr: "مكناس", nameFr: "Meknès", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 33.8935, longitude: -5.5473, timezone: "Africa/Casablanca" },
  { name: "Oujda", nameAr: "وجدة", nameFr: "Oujda", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 34.6867, longitude: -1.9114, timezone: "Africa/Casablanca" },
  { name: "Kenitra", nameAr: "القنيطرة", nameFr: "Kénitra", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 34.2610, longitude: -6.5802, timezone: "Africa/Casablanca" },
  { name: "Tetouan", nameAr: "تطوان", nameFr: "Tétouan", country: "Morocco", countryAr: "المغرب", countryFr: "Maroc", latitude: 35.5889, longitude: -5.3626, timezone: "Africa/Casablanca" },
  
  // ========== الجزائر ==========
  { name: "Algiers", nameAr: "الجزائر", nameFr: "Alger", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 36.7538, longitude: 3.0588, timezone: "Africa/Algiers" },
  { name: "Oran", nameAr: "وهران", nameFr: "Oran", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 35.6969, longitude: -0.6331, timezone: "Africa/Algiers" },
  { name: "Constantine", nameAr: "قسنطينة", nameFr: "Constantine", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 36.3650, longitude: 6.6147, timezone: "Africa/Algiers" },
  { name: "Annaba", nameAr: "عنابة", nameFr: "Annaba", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 36.9000, longitude: 7.7667, timezone: "Africa/Algiers" },
  { name: "Blida", nameAr: "البليدة", nameFr: "Blida", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 36.4706, longitude: 2.8278, timezone: "Africa/Algiers" },
  { name: "Batna", nameAr: "باتنة", nameFr: "Batna", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 35.5559, longitude: 6.1742, timezone: "Africa/Algiers" },
  { name: "Setif", nameAr: "سطيف", nameFr: "Sétif", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 36.1903, longitude: 5.4139, timezone: "Africa/Algiers" },
  { name: "Tlemcen", nameAr: "تلمسان", nameFr: "Tlemcen", country: "Algeria", countryAr: "الجزائر", countryFr: "Algérie", latitude: 34.8780, longitude: -1.3150, timezone: "Africa/Algiers" },
  
  // ========== تونس ==========
  { name: "Tunis", nameAr: "تونس", nameFr: "Tunis", country: "Tunisia", countryAr: "تونس", countryFr: "Tunisie", latitude: 36.8065, longitude: 10.1815, timezone: "Africa/Tunis" },
  { name: "Sfax", nameAr: "صفاقس", nameFr: "Sfax", country: "Tunisia", countryAr: "تونس", countryFr: "Tunisie", latitude: 34.7406, longitude: 10.7603, timezone: "Africa/Tunis" },
  { name: "Sousse", nameAr: "سوسة", nameFr: "Sousse", country: "Tunisia", countryAr: "تونس", countryFr: "Tunisie", latitude: 35.8256, longitude: 10.6369, timezone: "Africa/Tunis" },
  { name: "Kairouan", nameAr: "القيروان", nameFr: "Kairouan", country: "Tunisia", countryAr: "تونس", countryFr: "Tunisie", latitude: 35.6781, longitude: 10.0963, timezone: "Africa/Tunis" },
  { name: "Bizerte", nameAr: "بنزرت", nameFr: "Bizerte", country: "Tunisia", countryAr: "تونس", countryFr: "Tunisie", latitude: 37.2746, longitude: 9.8739, timezone: "Africa/Tunis" },
  
  // ========== ليبيا ==========
  { name: "Tripoli", nameAr: "طرابلس", nameFr: "Tripoli", country: "Libya", countryAr: "ليبيا", countryFr: "Libye", latitude: 32.8872, longitude: 13.1913, timezone: "Africa/Tripoli" },
  { name: "Benghazi", nameAr: "بنغازي", nameFr: "Benghazi", country: "Libya", countryAr: "ليبيا", countryFr: "Libye", latitude: 32.1191, longitude: 20.0869, timezone: "Africa/Tripoli" },
  { name: "Misrata", nameAr: "مصراتة", nameFr: "Misrata", country: "Libya", countryAr: "ليبيا", countryFr: "Libye", latitude: 32.3754, longitude: 15.0925, timezone: "Africa/Tripoli" },
  { name: "Zawiya", nameAr: "الزاوية", nameFr: "Zawiya", country: "Libya", countryAr: "ليبيا", countryFr: "Libye", latitude: 32.7575, longitude: 12.7278, timezone: "Africa/Tripoli" },
  
  // ========== السودان ==========
  { name: "Khartoum", nameAr: "الخرطوم", nameFr: "Khartoum", country: "Sudan", countryAr: "السودان", countryFr: "Soudan", latitude: 15.5007, longitude: 32.5599, timezone: "Africa/Khartoum" },
  { name: "Omdurman", nameAr: "أم درمان", nameFr: "Omdurman", country: "Sudan", countryAr: "السودان", countryFr: "Soudan", latitude: 15.6446, longitude: 32.4777, timezone: "Africa/Khartoum" },
  { name: "Port Sudan", nameAr: "بورتسودان", nameFr: "Port-Soudan", country: "Sudan", countryAr: "السودان", countryFr: "Soudan", latitude: 19.6158, longitude: 37.2164, timezone: "Africa/Khartoum" },
  { name: "Kassala", nameAr: "كسلا", nameFr: "Kassala", country: "Sudan", countryAr: "السودان", countryFr: "Soudan", latitude: 15.4500, longitude: 36.4000, timezone: "Africa/Khartoum" },
  
  // ========== اليمن ==========
  { name: "Sanaa", nameAr: "صنعاء", nameFr: "Sanaa", country: "Yemen", countryAr: "اليمن", countryFr: "Yémen", latitude: 15.3694, longitude: 44.1910, timezone: "Asia/Aden" },
  { name: "Aden", nameAr: "عدن", nameFr: "Aden", country: "Yemen", countryAr: "اليمن", countryFr: "Yémen", latitude: 12.7855, longitude: 45.0187, timezone: "Asia/Aden" },
  { name: "Taiz", nameAr: "تعز", nameFr: "Taiz", country: "Yemen", countryAr: "اليمن", countryFr: "Yémen", latitude: 13.5779, longitude: 44.0178, timezone: "Asia/Aden" },
  { name: "Hodeidah", nameAr: "الحديدة", nameFr: "Hodeïda", country: "Yemen", countryAr: "اليمن", countryFr: "Yémen", latitude: 14.7978, longitude: 42.9545, timezone: "Asia/Aden" },
  { name: "Ibb", nameAr: "إب", nameFr: "Ibb", country: "Yemen", countryAr: "اليمن", countryFr: "Yémen", latitude: 13.9667, longitude: 44.1833, timezone: "Asia/Aden" },
  
  // ========== ماليزيا ==========
  { name: "Kuala Lumpur", nameAr: "كوالا لمبور", nameFr: "Kuala Lumpur", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 3.1390, longitude: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "George Town", nameAr: "جورج تاون", nameFr: "George Town", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 5.4164, longitude: 100.3327, timezone: "Asia/Kuala_Lumpur" },
  { name: "Johor Bahru", nameAr: "جوهور بهرو", nameFr: "Johor Bahru", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 1.4927, longitude: 103.7414, timezone: "Asia/Kuala_Lumpur" },
  { name: "Shah Alam", nameAr: "شاه علم", nameFr: "Shah Alam", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 3.0738, longitude: 101.5183, timezone: "Asia/Kuala_Lumpur" },
  { name: "Malacca", nameAr: "ملقا", nameFr: "Malacca", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 2.1896, longitude: 102.2501, timezone: "Asia/Kuala_Lumpur" },
  { name: "Ipoh", nameAr: "إيبوه", nameFr: "Ipoh", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 4.5975, longitude: 101.0901, timezone: "Asia/Kuala_Lumpur" },
  { name: "Kota Kinabalu", nameAr: "كوتا كينابالو", nameFr: "Kota Kinabalu", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 5.9804, longitude: 116.0735, timezone: "Asia/Kuching" },
  { name: "Kuching", nameAr: "كوشينغ", nameFr: "Kuching", country: "Malaysia", countryAr: "ماليزيا", countryFr: "Malaisie", latitude: 1.5535, longitude: 110.3593, timezone: "Asia/Kuching" },
  
  // ========== إندونيسيا ==========
  { name: "Jakarta", nameAr: "جاكرتا", nameFr: "Jakarta", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta" },
  { name: "Surabaya", nameAr: "سورابايا", nameFr: "Surabaya", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -7.2575, longitude: 112.7521, timezone: "Asia/Jakarta" },
  { name: "Bandung", nameAr: "باندونج", nameFr: "Bandung", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -6.9175, longitude: 107.6191, timezone: "Asia/Jakarta" },
  { name: "Medan", nameAr: "ميدان", nameFr: "Medan", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: 3.5952, longitude: 98.6722, timezone: "Asia/Jakarta" },
  { name: "Semarang", nameAr: "سيمارانج", nameFr: "Semarang", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -6.9667, longitude: 110.4167, timezone: "Asia/Jakarta" },
  { name: "Makassar", nameAr: "ماكاسار", nameFr: "Makassar", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -5.1477, longitude: 119.4327, timezone: "Asia/Makassar" },
  { name: "Palembang", nameAr: "باليمبانج", nameFr: "Palembang", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -2.9761, longitude: 104.7754, timezone: "Asia/Jakarta" },
  { name: "Yogyakarta", nameAr: "يوجياكارتا", nameFr: "Yogyakarta", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -7.7956, longitude: 110.3695, timezone: "Asia/Jakarta" },
  { name: "Denpasar", nameAr: "دينباسار", nameFr: "Denpasar", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -8.6705, longitude: 115.2126, timezone: "Asia/Makassar" },
  { name: "Balikpapan", nameAr: "باليكبابان", nameFr: "Balikpapan", country: "Indonesia", countryAr: "إندونيسيا", countryFr: "Indonésie", latitude: -1.2379, longitude: 116.8529, timezone: "Asia/Makassar" },
  
  // ========== باكستان ==========
  { name: "Karachi", nameAr: "كراتشي", nameFr: "Karachi", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 24.8607, longitude: 67.0011, timezone: "Asia/Karachi" },
  { name: "Islamabad", nameAr: "إسلام آباد", nameFr: "Islamabad", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 33.6844, longitude: 73.0479, timezone: "Asia/Karachi" },
  { name: "Lahore", nameAr: "لاهور", nameFr: "Lahore", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 31.5497, longitude: 74.3436, timezone: "Asia/Karachi" },
  { name: "Rawalpindi", nameAr: "راولبندي", nameFr: "Rawalpindi", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 33.5651, longitude: 73.0169, timezone: "Asia/Karachi" },
  { name: "Faisalabad", nameAr: "فيصل آباد", nameFr: "Faisalabad", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 31.4181, longitude: 73.0776, timezone: "Asia/Karachi" },
  { name: "Multan", nameAr: "ملتان", nameFr: "Multan", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 30.1575, longitude: 71.5249, timezone: "Asia/Karachi" },
  { name: "Peshawar", nameAr: "بيشاور", nameFr: "Peshawar", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 34.0151, longitude: 71.5249, timezone: "Asia/Karachi" },
  { name: "Quetta", nameAr: "كويتا", nameFr: "Quetta", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 30.1798, longitude: 66.9750, timezone: "Asia/Karachi" },
  { name: "Hyderabad", nameAr: "حيدر آباد", nameFr: "Hyderabad", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 25.3924, longitude: 68.3737, timezone: "Asia/Karachi" },
  { name: "Gujranwala", nameAr: "غوجرانوالا", nameFr: "Gujranwala", country: "Pakistan", countryAr: "باكستان", countryFr: "Pakistan", latitude: 32.1617, longitude: 74.1883, timezone: "Asia/Karachi" },
  
  // ========== بنغلاديش ==========
  { name: "Dhaka", nameAr: "دكا", nameFr: "Dhaka", country: "Bangladesh", countryAr: "بنغلاديش", countryFr: "Bangladesh", latitude: 23.8103, longitude: 90.4125, timezone: "Asia/Dhaka" },
  { name: "Chittagong", nameAr: "شيتاغونغ", nameFr: "Chittagong", country: "Bangladesh", countryAr: "بنغلاديش", countryFr: "Bangladesh", latitude: 22.3569, longitude: 91.7832, timezone: "Asia/Dhaka" },
  { name: "Khulna", nameAr: "خولنا", nameFr: "Khulna", country: "Bangladesh", countryAr: "بنغلاديش", countryFr: "Bangladesh", latitude: 22.8456, longitude: 89.5403, timezone: "Asia/Dhaka" },
  { name: "Rajshahi", nameAr: "راجشاهي", nameFr: "Rajshahi", country: "Bangladesh", countryAr: "بنغلاديش", countryFr: "Bangladesh", latitude: 24.3745, longitude: 88.6042, timezone: "Asia/Dhaka" },
  { name: "Sylhet", nameAr: "سيلهت", nameFr: "Sylhet", country: "Bangladesh", countryAr: "بنغلاديش", countryFr: "Bangladesh", latitude: 24.8949, longitude: 91.8687, timezone: "Asia/Dhaka" },
  
  // ========== الهند ==========
  { name: "New Delhi", nameAr: "نيودلهي", nameFr: "New Delhi", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 28.6139, longitude: 77.2090, timezone: "Asia/Kolkata" },
  { name: "Mumbai", nameAr: "مومباي", nameFr: "Mumbai", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 19.0760, longitude: 72.8777, timezone: "Asia/Kolkata" },
  { name: "Bangalore", nameAr: "بنغالور", nameFr: "Bangalore", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata" },
  { name: "Kolkata", nameAr: "كلكتا", nameFr: "Calcutta", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata" },
  { name: "Chennai", nameAr: "تشيناي", nameFr: "Chennai", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 13.0827, longitude: 80.2707, timezone: "Asia/Kolkata" },
  { name: "Hyderabad", nameAr: "حيدر آباد", nameFr: "Hyderabad", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 17.3850, longitude: 78.4867, timezone: "Asia/Kolkata" },
  { name: "Pune", nameAr: "بونا", nameFr: "Pune", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 18.5204, longitude: 73.8567, timezone: "Asia/Kolkata" },
  { name: "Ahmedabad", nameAr: "أحمد آباد", nameFr: "Ahmedabad", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 23.0225, longitude: 72.5714, timezone: "Asia/Kolkata" },
  { name: "Surat", nameAr: "سورات", nameFr: "Surat", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 21.1702, longitude: 72.8311, timezone: "Asia/Kolkata" },
  { name: "Lucknow", nameAr: "لكناو", nameFr: "Lucknow", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 26.8467, longitude: 80.9462, timezone: "Asia/Kolkata" },
  { name: "Jaipur", nameAr: "جايبور", nameFr: "Jaipur", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata" },
  { name: "Kanpur", nameAr: "كانبور", nameFr: "Kanpur", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 26.4499, longitude: 80.3319, timezone: "Asia/Kolkata" },
  { name: "Nagpur", nameAr: "ناغبور", nameFr: "Nagpur", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 21.1458, longitude: 79.0882, timezone: "Asia/Kolkata" },
  { name: "Indore", nameAr: "إندور", nameFr: "Indore", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 22.7196, longitude: 75.8577, timezone: "Asia/Kolkata" },
  { name: "Bhopal", nameAr: "بهوبال", nameFr: "Bhopal", country: "India", countryAr: "الهند", countryFr: "Inde", latitude: 23.2599, longitude: 77.4126, timezone: "Asia/Kolkata" },
  
  // ========== أمريكا ==========
  { name: "New York", nameAr: "نيويورك", nameFr: "New York", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York" },
  { name: "Los Angeles", nameAr: "لوس أنجلوس", nameFr: "Los Angeles", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { name: "Chicago", nameAr: "شيكاغو", nameFr: "Chicago", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  { name: "Houston", nameAr: "هيوستن", nameFr: "Houston", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 29.7604, longitude: -95.3698, timezone: "America/Chicago" },
  { name: "Phoenix", nameAr: "فينيكس", nameFr: "Phoenix", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 33.4484, longitude: -112.0740, timezone: "America/Phoenix" },
  { name: "Philadelphia", nameAr: "فيلادلفيا", nameFr: "Philadelphie", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 39.9526, longitude: -75.1652, timezone: "America/New_York" },
  { name: "San Antonio", nameAr: "سان أنطونيو", nameFr: "San Antonio", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 29.4241, longitude: -98.4936, timezone: "America/Chicago" },
  { name: "San Diego", nameAr: "سان دييغو", nameFr: "San Diego", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 32.7157, longitude: -117.1611, timezone: "America/Los_Angeles" },
  { name: "Dallas", nameAr: "دالاس", nameFr: "Dallas", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 32.7767, longitude: -96.7970, timezone: "America/Chicago" },
  { name: "San Jose", nameAr: "سان خوسيه", nameFr: "San José", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 37.3382, longitude: -121.8863, timezone: "America/Los_Angeles" },
  { name: "Austin", nameAr: "أوستن", nameFr: "Austin", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 30.2672, longitude: -97.7431, timezone: "America/Chicago" },
  { name: "Seattle", nameAr: "سياتل", nameFr: "Seattle", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 47.6062, longitude: -122.3321, timezone: "America/Los_Angeles" },
  { name: "Denver", nameAr: "دنفر", nameFr: "Denver", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 39.7392, longitude: -104.9903, timezone: "America/Denver" },
  { name: "Washington DC", nameAr: "واشنطن", nameFr: "Washington DC", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 38.9072, longitude: -77.0369, timezone: "America/New_York" },
  { name: "Boston", nameAr: "بوسطن", nameFr: "Boston", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 42.3601, longitude: -71.0589, timezone: "America/New_York" },
  { name: "Detroit", nameAr: "ديترويت", nameFr: "Détroit", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 42.3314, longitude: -83.0458, timezone: "America/Detroit" },
  { name: "Miami", nameAr: "ميامي", nameFr: "Miami", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 25.7617, longitude: -80.1918, timezone: "America/New_York" },
  { name: "Atlanta", nameAr: "أتلانتا", nameFr: "Atlanta", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 33.7490, longitude: -84.3880, timezone: "America/New_York" },
  { name: "Minneapolis", nameAr: "مينيابوليس", nameFr: "Minneapolis", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 44.9778, longitude: -93.2650, timezone: "America/Chicago" },
  { name: "Las Vegas", nameAr: "لاس فيغاس", nameFr: "Las Vegas", country: "USA", countryAr: "أمريكا", countryFr: "États-Unis", latitude: 36.1699, longitude: -115.1398, timezone: "America/Los_Angeles" },
  
  // ========== كندا ==========
  { name: "Toronto", nameAr: "تورونتو", nameFr: "Toronto", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
  { name: "Montreal", nameAr: "مونتريال", nameFr: "Montréal", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 45.5017, longitude: -73.5673, timezone: "America/Montreal" },
  { name: "Vancouver", nameAr: "فانكوفر", nameFr: "Vancouver", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 49.2827, longitude: -123.1207, timezone: "America/Vancouver" },
  { name: "Calgary", nameAr: "كالغاري", nameFr: "Calgary", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 51.0447, longitude: -114.0719, timezone: "America/Edmonton" },
  { name: "Edmonton", nameAr: "إدمونتون", nameFr: "Edmonton", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 53.5461, longitude: -113.4938, timezone: "America/Edmonton" },
  { name: "Ottawa", nameAr: "أوتاوا", nameFr: "Ottawa", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 45.4215, longitude: -75.6972, timezone: "America/Toronto" },
  { name: "Mississauga", nameAr: "ميسيسوغا", nameFr: "Mississauga", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 43.5890, longitude: -79.6441, timezone: "America/Toronto" },
  { name: "Winnipeg", nameAr: "وينيبيغ", nameFr: "Winnipeg", country: "Canada", countryAr: "كندا", countryFr: "Canada", latitude: 49.8951, longitude: -97.1384, timezone: "America/Winnipeg" },
  
  // ========== بريطانيا ==========
  { name: "London", nameAr: "لندن", nameFr: "Londres", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
  { name: "Manchester", nameAr: "مانشستر", nameFr: "Manchester", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 53.4808, longitude: -2.2426, timezone: "Europe/London" },
  { name: "Birmingham", nameAr: "برمنغهام", nameFr: "Birmingham", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 52.4862, longitude: -1.8904, timezone: "Europe/London" },
  { name: "Leeds", nameAr: "ليدز", nameFr: "Leeds", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 53.8008, longitude: -1.5491, timezone: "Europe/London" },
  { name: "Glasgow", nameAr: "غلاسكو", nameFr: "Glasgow", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 55.8642, longitude: -4.2518, timezone: "Europe/London" },
  { name: "Liverpool", nameAr: "ليفربول", nameFr: "Liverpool", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 53.4084, longitude: -2.9916, timezone: "Europe/London" },
  { name: "Edinburgh", nameAr: "إدنبرة", nameFr: "Édimbourg", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 55.9533, longitude: -3.1883, timezone: "Europe/London" },
  { name: "Bristol", nameAr: "بريستول", nameFr: "Bristol", country: "UK", countryAr: "بريطانيا", countryFr: "Royaume-Uni", latitude: 51.4545, longitude: -2.5879, timezone: "Europe/London" },
  
  // ========== فرنسا ==========
  { name: "Paris", nameAr: "باريس", nameFr: "Paris", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  { name: "Marseille", nameAr: "مرسيليا", nameFr: "Marseille", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 43.2965, longitude: 5.3698, timezone: "Europe/Paris" },
  { name: "Lyon", nameAr: "ليون", nameFr: "Lyon", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 45.7640, longitude: 4.8357, timezone: "Europe/Paris" },
  { name: "Toulouse", nameAr: "تولوز", nameFr: "Toulouse", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 43.6047, longitude: 1.4442, timezone: "Europe/Paris" },
  { name: "Nice", nameAr: "نيس", nameFr: "Nice", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 43.7102, longitude: 7.2620, timezone: "Europe/Paris" },
  { name: "Nantes", nameAr: "نانت", nameFr: "Nantes", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 47.2184, longitude: -1.5536, timezone: "Europe/Paris" },
  { name: "Strasbourg", nameAr: "ستراسبورغ", nameFr: "Strasbourg", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 48.5734, longitude: 7.7521, timezone: "Europe/Paris" },
  { name: "Bordeaux", nameAr: "بوردو", nameFr: "Bordeaux", country: "France", countryAr: "فرنسا", countryFr: "France", latitude: 44.8378, longitude: -0.5792, timezone: "Europe/Paris" },
  
  // ========== ألمانيا ==========
  { name: "Berlin", nameAr: "برلين", nameFr: "Berlin", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 52.5200, longitude: 13.4050, timezone: "Europe/Berlin" },
  { name: "Munich", nameAr: "ميونخ", nameFr: "Munich", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 48.1351, longitude: 11.5820, timezone: "Europe/Berlin" },
  { name: "Hamburg", nameAr: "هامبورغ", nameFr: "Hambourg", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 53.5511, longitude: 9.9937, timezone: "Europe/Berlin" },
  { name: "Frankfurt", nameAr: "فرانكفورت", nameFr: "Francfort", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 50.1109, longitude: 8.6821, timezone: "Europe/Berlin" },
  { name: "Cologne", nameAr: "كولونيا", nameFr: "Cologne", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 50.9375, longitude: 6.9603, timezone: "Europe/Berlin" },
  { name: "Stuttgart", nameAr: "شتوتغارت", nameFr: "Stuttgart", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 48.7758, longitude: 9.1829, timezone: "Europe/Berlin" },
  { name: "Düsseldorf", nameAr: "دوسلدورف", nameFr: "Düsseldorf", country: "Germany", countryAr: "ألمانيا", countryFr: "Allemagne", latitude: 51.2277, longitude: 6.7735, timezone: "Europe/Berlin" },
  
  // ========== إيطاليا ==========
  { name: "Rome", nameAr: "روما", nameFr: "Rome", country: "Italy", countryAr: "إيطاليا", countryFr: "Italie", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },
  { name: "Milan", nameAr: "ميلانو", nameFr: "Milan", country: "Italy", countryAr: "إيطاليا", countryFr: "Italie", latitude: 45.4642, longitude: 9.1900, timezone: "Europe/Rome" },
  { name: "Naples", nameAr: "نابولي", nameFr: "Naples", country: "Italy", countryAr: "إيطاليا", countryFr: "Italie", latitude: 40.8518, longitude: 14.2681, timezone: "Europe/Rome" },
  { name: "Turin", nameAr: "تورينو", nameFr: "Turin", country: "Italy", countryAr: "إيطاليا", countryFr: "Italie", latitude: 45.0703, longitude: 7.6869, timezone: "Europe/Rome" },
  { name: "Florence", nameAr: "فلورنسا", nameFr: "Florence", country: "Italy", countryAr: "إيطاليا", countryFr: "Italie", latitude: 43.7696, longitude: 11.2558, timezone: "Europe/Rome" },
  { name: "Venice", nameAr: "البندقية", nameFr: "Venise", country: "Italy", countryAr: "إيطاليا", countryFr: "Italie", latitude: 45.4408, longitude: 12.3155, timezone: "Europe/Rome" },
  
  // ========== إسبانيا ==========
  { name: "Madrid", nameAr: "مدريد", nameFr: "Madrid", country: "Spain", countryAr: "إسبانيا", countryFr: "Espagne", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid" },
  { name: "Barcelona", nameAr: "برشلونة", nameFr: "Barcelone", country: "Spain", countryAr: "إسبانيا", countryFr: "Espagne", latitude: 41.3851, longitude: 2.1734, timezone: "Europe/Madrid" },
  { name: "Valencia", nameAr: "فالنسيا", nameFr: "Valence", country: "Spain", countryAr: "إسبانيا", countryFr: "Espagne", latitude: 39.4699, longitude: -0.3763, timezone: "Europe/Madrid" },
  { name: "Seville", nameAr: "إشبيلية", nameFr: "Séville", country: "Spain", countryAr: "إسبانيا", countryFr: "Espagne", latitude: 37.3891, longitude: -5.9845, timezone: "Europe/Madrid" },
  { name: "Bilbao", nameAr: "بلباو", nameFr: "Bilbao", country: "Spain", countryAr: "إسبانيا", countryFr: "Espagne", latitude: 43.2630, longitude: -2.9350, timezone: "Europe/Madrid" },
  
  // ========== هولندا ==========
  { name: "Amsterdam", nameAr: "أمستردام", nameFr: "Amsterdam", country: "Netherlands", countryAr: "هولندا", countryFr: "Pays-Bas", latitude: 52.3702, longitude: 4.8952, timezone: "Europe/Amsterdam" },
  { name: "Rotterdam", nameAr: "روتردام", nameFr: "Rotterdam", country: "Netherlands", countryAr: "هولندا", countryFr: "Pays-Bas", latitude: 51.9244, longitude: 4.4777, timezone: "Europe/Amsterdam" },
  { name: "The Hague", nameAr: "لاهاي", nameFr: "La Haye", country: "Netherlands", countryAr: "هولندا", countryFr: "Pays-Bas", latitude: 52.0705, longitude: 4.3007, timezone: "Europe/Amsterdam" },
  
  // ========== بلجيكا ==========
  { name: "Brussels", nameAr: "بروكسل", nameFr: "Bruxelles", country: "Belgium", countryAr: "بلجيكا", countryFr: "Belgique", latitude: 50.8503, longitude: 4.3517, timezone: "Europe/Brussels" },
  { name: "Antwerp", nameAr: "أنتويرب", nameFr: "Anvers", country: "Belgium", countryAr: "بلجيكا", countryFr: "Belgique", latitude: 51.2194, longitude: 4.4025, timezone: "Europe/Brussels" },
  
  // ========== السويد ==========
  { name: "Stockholm", nameAr: "ستوكهولم", nameFr: "Stockholm", country: "Sweden", countryAr: "السويد", countryFr: "Suède", latitude: 59.3293, longitude: 18.0686, timezone: "Europe/Stockholm" },
  { name: "Gothenburg", nameAr: "غوتنبرغ", nameFr: "Göteborg", country: "Sweden", countryAr: "السويد", countryFr: "Suède", latitude: 57.7089, longitude: 11.9746, timezone: "Europe/Stockholm" },
  
  // ========== النرويج ==========
  { name: "Oslo", nameAr: "أوسلو", nameFr: "Oslo", country: "Norway", countryAr: "النرويج", countryFr: "Norvège", latitude: 59.9139, longitude: 10.7522, timezone: "Europe/Oslo" },
  
  // ========== الدنمارك ==========
  { name: "Copenhagen", nameAr: "كوبنهاغن", nameFr: "Copenhague", country: "Denmark", countryAr: "الدنمارك", countryFr: "Danemark", latitude: 55.6761, longitude: 12.5683, timezone: "Europe/Copenhagen" },
  
  // ========== أستراليا ==========
  { name: "Sydney", nameAr: "سيدني", nameFr: "Sydney", country: "Australia", countryAr: "أستراليا", countryFr: "Australie", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
  { name: "Melbourne", nameAr: "ملبورن", nameFr: "Melbourne", country: "Australia", countryAr: "أستراليا", countryFr: "Australie", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne" },
  { name: "Brisbane", nameAr: "بريسبان", nameFr: "Brisbane", country: "Australia", countryAr: "أستراليا", countryFr: "Australie", latitude: -27.4698, longitude: 153.0251, timezone: "Australia/Brisbane" },
  { name: "Perth", nameAr: "بيرث", nameFr: "Perth", country: "Australia", countryAr: "أستراليا", countryFr: "Australie", latitude: -31.9505, longitude: 115.8605, timezone: "Australia/Perth" },
  { name: "Adelaide", nameAr: "أديلايد", nameFr: "Adélaïde", country: "Australia", countryAr: "أستراليا", countryFr: "Australie", latitude: -34.9285, longitude: 138.6007, timezone: "Australia/Adelaide" },
  { name: "Canberra", nameAr: "كانبيرا", nameFr: "Canberra", country: "Australia", countryAr: "أستراليا", countryFr: "Australie", latitude: -35.2809, longitude: 149.1300, timezone: "Australia/Sydney" },
  
  // ========== البرازيل ==========
  { name: "São Paulo", nameAr: "ساو باولو", nameFr: "São Paulo", country: "Brazil", countryAr: "البرازيل", countryFr: "Brésil", latitude: -23.5505, longitude: -46.6333, timezone: "America/Sao_Paulo" },
  { name: "Rio de Janeiro", nameAr: "ريو دي جانيرو", nameFr: "Rio de Janeiro", country: "Brazil", countryAr: "البرازيل", countryFr: "Brésil", latitude: -22.9068, longitude: -43.1729, timezone: "America/Sao_Paulo" },
  { name: "Brasília", nameAr: "برازيليا", nameFr: "Brasília", country: "Brazil", countryAr: "البرازيل", countryFr: "Brésil", latitude: -15.8267, longitude: -47.9218, timezone: "America/Sao_Paulo" },
  { name: "Salvador", nameAr: "سالفادور", nameFr: "Salvador", country: "Brazil", countryAr: "البرازيل", countryFr: "Brésil", latitude: -12.9714, longitude: -38.5014, timezone: "America/Bahia" },
  
  // ========== الأرجنتين ==========
  { name: "Buenos Aires", nameAr: "بوينس آيرس", nameFr: "Buenos Aires", country: "Argentina", countryAr: "الأرجنتين", countryFr: "Argentine", latitude: -34.6037, longitude: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Córdoba", nameAr: "قرطبة", nameFr: "Córdoba", country: "Argentina", countryAr: "الأرجنتين", countryFr: "Argentine", latitude: -31.4201, longitude: -64.1888, timezone: "America/Argentina/Cordoba" },
  
  // ========== نيجيريا ==========
  { name: "Lagos", nameAr: "لاغوس", nameFr: "Lagos", country: "Nigeria", countryAr: "نيجيريا", countryFr: "Nigéria", latitude: 6.5244, longitude: 3.3792, timezone: "Africa/Lagos" },
  { name: "Kano", nameAr: "كانو", nameFr: "Kano", country: "Nigeria", countryAr: "نيجيريا", countryFr: "Nigéria", latitude: 12.0022, longitude: 8.5919, timezone: "Africa/Lagos" },
  { name: "Ibadan", nameAr: "إبادان", nameFr: "Ibadan", country: "Nigeria", countryAr: "نيجيريا", countryFr: "Nigéria", latitude: 7.3775, longitude: 3.9470, timezone: "Africa/Lagos" },
  { name: "Abuja", nameAr: "أبوجا", nameFr: "Abuja", country: "Nigeria", countryAr: "نيجيريا", countryFr: "Nigéria", latitude: 9.0765, longitude: 7.3986, timezone: "Africa/Lagos" },
  
  // ========== جنوب أفريقيا ==========
  { name: "Johannesburg", nameAr: "جوهانسبرغ", nameFr: "Johannesburg", country: "South Africa", countryAr: "جنوب أفريقيا", countryFr: "Afrique du Sud", latitude: -26.2041, longitude: 28.0473, timezone: "Africa/Johannesburg" },
  { name: "Cape Town", nameAr: "كيب تاون", nameFr: "Le Cap", country: "South Africa", countryAr: "جنوب أفريقيا", countryFr: "Afrique du Sud", latitude: -33.9249, longitude: 18.4241, timezone: "Africa/Johannesburg" },
  { name: "Durban", nameAr: "ديربان", nameFr: "Durban", country: "South Africa", countryAr: "جنوب أفريقيا", countryFr: "Afrique du Sud", latitude: -29.8587, longitude: 31.0218, timezone: "Africa/Johannesburg" },
  { name: "Pretoria", nameAr: "بريتوريا", nameFr: "Pretoria", country: "South Africa", countryAr: "جنوب أفريقيا", countryFr: "Afrique du Sud", latitude: -25.7479, longitude: 28.2293, timezone: "Africa/Johannesburg" },
  
  // ========== كينيا ==========
  { name: "Nairobi", nameAr: "نيروبي", nameFr: "Nairobi", country: "Kenya", countryAr: "كينيا", countryFr: "Kenya", latitude: -1.2921, longitude: 36.8219, timezone: "Africa/Nairobi" },
  { name: "Mombasa", nameAr: "مومباسا", nameFr: "Mombasa", country: "Kenya", countryAr: "كينيا", countryFr: "Kenya", latitude: -4.0435, longitude: 39.6682, timezone: "Africa/Nairobi" },
  
  // ========== إثيوبيا ==========
  { name: "Addis Ababa", nameAr: "أديس أبابا", nameFr: "Addis-Abeba", country: "Ethiopia", countryAr: "إثيوبيا", countryFr: "Éthiopie", latitude: 9.0320, longitude: 38.7469, timezone: "Africa/Addis_Ababa" },
  
  // ========== السنغال ==========
  { name: "Dakar", nameAr: "داكار", nameFr: "Dakar", country: "Senegal", countryAr: "السنغال", countryFr: "Sénégal", latitude: 14.6928, longitude: -17.4467, timezone: "Africa/Dakar" },
  
  // ========== تايلاند ==========
  { name: "Bangkok", nameAr: "بانكوك", nameFr: "Bangkok", country: "Thailand", countryAr: "تايلاند", countryFr: "Thaïlande", latitude: 13.7563, longitude: 100.5018, timezone: "Asia/Bangkok" },
  
  // ========== سنغافورة ==========
  { name: "Singapore", nameAr: "سنغافورة", nameFr: "Singapour", country: "Singapore", countryAr: "سنغافورة", countryFr: "Singapour", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  
  // ========== اليابان ==========
  { name: "Tokyo", nameAr: "طوكيو", nameFr: "Tokyo", country: "Japan", countryAr: "اليابان", countryFr: "Japon", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { name: "Osaka", nameAr: "أوساكا", nameFr: "Osaka", country: "Japan", countryAr: "اليابان", countryFr: "Japon", latitude: 34.6937, longitude: 135.5023, timezone: "Asia/Tokyo" },
  
  // ========== الصين ==========
  { name: "Beijing", nameAr: "بكين", nameFr: "Pékin", country: "China", countryAr: "الصين", countryFr: "Chine", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai" },
  { name: "Shanghai", nameAr: "شنغهاي", nameFr: "Shanghai", country: "China", countryAr: "الصين", countryFr: "Chine", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai" },
  
  // ========== كوريا الجنوبية ==========
  { name: "Seoul", nameAr: "سيول", nameFr: "Séoul", country: "South Korea", countryAr: "كوريا الجنوبية", countryFr: "Corée du Sud", latitude: 37.5665, longitude: 126.9780, timezone: "Asia/Seoul" },
  
  // ========== روسيا ==========
  { name: "Moscow", nameAr: "موسكو", nameFr: "Moscou", country: "Russia", countryAr: "روسيا", countryFr: "Russie", latitude: 55.7558, longitude: 37.6173, timezone: "Europe/Moscow" },
  { name: "Saint Petersburg", nameAr: "سانت بطرسبرغ", nameFr: "Saint-Pétersbourg", country: "Russia", countryAr: "روسيا", countryFr: "Russie", latitude: 59.9311, longitude: 30.3609, timezone: "Europe/Moscow" },
];

// دالة البحث الذكي عن المدن
export function searchCities(query: string, language: 'en' | 'ar' | 'fr' = 'en'): CityData[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return worldCities.slice(0, 20); // إرجاع أول 20 مدينة إذا كان البحث فارغًا
  
  return worldCities.filter(city => {
    const nameField = language === 'ar' ? 'nameAr' : language === 'fr' ? 'nameFr' : 'name';
    const countryField = language === 'ar' ? 'countryAr' : language === 'fr' ? 'countryFr' : 'country';
    
    const cityName = city[nameField].toLowerCase();
    const countryName = city[countryField].toLowerCase();
    const englishName = city.name.toLowerCase();
    
    return (
      cityName.includes(normalizedQuery) ||
      countryName.includes(normalizedQuery) ||
      englishName.includes(normalizedQuery) ||
      city.nameAr.includes(normalizedQuery) ||
      city.nameFr.toLowerCase().includes(normalizedQuery)
    );
  }).slice(0, 50); // حد أقصى 50 نتيجة
}
