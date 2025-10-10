import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار اللوجو الأصلي
const logoPath = path.join(__dirname, 'attached_assets', 'QT_final_logo-02-01_1751283453807.png');

// الأحجام المطلوبة للأندرويد
const androidSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

// المسار الأساسي للـ res في Android
const resPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// إنشاء الأيقونات
async function generateIcons() {
  console.log('🎨 بدء تحويل اللوجو...\n');

  for (const { folder, size } of androidSizes) {
    const folderPath = path.join(resPath, folder);
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // مسار الملف الناتج
    const outputPath = path.join(folderPath, 'ic_launcher.png');
    const outputPathRound = path.join(folderPath, 'ic_launcher_round.png');

    try {
      // تحويل الصورة العادية
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      // تحويل الصورة الدائرية
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPathRound);

      console.log(`✅ ${folder}: ${size}x${size} - تم`);
    } catch (error) {
      console.error(`❌ خطأ في ${folder}:`, error.message);
    }
  }

  console.log('\n🎉 تم إنشاء جميع الأيقونات بنجاح!');
  console.log('\n📁 الموقع: android/app/src/main/res/');
}

generateIcons().catch(console.error);
