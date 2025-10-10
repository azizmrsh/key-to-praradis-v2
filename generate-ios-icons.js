import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار اللوجو الأصلي
const logoPath = path.join(__dirname, 'attached_assets', 'QT_final_logo-02-01_1751283453807.png');

// الأحجام المطلوبة لـ iOS
const iosSizes = [
  { name: 'AppIcon-20x20@2x.png', size: 40 },
  { name: 'AppIcon-20x20@3x.png', size: 60 },
  { name: 'AppIcon-29x29@2x.png', size: 58 },
  { name: 'AppIcon-29x29@3x.png', size: 87 },
  { name: 'AppIcon-40x40@2x.png', size: 80 },
  { name: 'AppIcon-40x40@3x.png', size: 120 },
  { name: 'AppIcon-60x60@2x.png', size: 120 },
  { name: 'AppIcon-60x60@3x.png', size: 180 },
  { name: 'AppIcon-76x76.png', size: 76 },
  { name: 'AppIcon-76x76@2x.png', size: 152 },
  { name: 'AppIcon-83.5x83.5@2x.png', size: 167 },
  { name: 'AppIcon-1024x1024.png', size: 1024 }
];

// المسار الأساسي للـ Assets في iOS
const assetsPath = path.join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

// إنشاء الأيقونات
async function generateIOSIcons() {
  console.log('🍎 بدء تحويل أيقونات iOS...\n');

  // إنشاء المجلد إذا لم يكن موجوداً
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
  }

  for (const { name, size } of iosSizes) {
    const outputPath = path.join(assetsPath, name);

    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // iOS لا يدعم الشفافية في الأيقونات
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name} (${size}×${size}) - تم`);
    } catch (error) {
      console.error(`❌ خطأ في ${name}:`, error.message);
    }
  }

  console.log('\n🎉 تم إنشاء جميع أيقونات iOS بنجاح!');
  console.log('\n📁 الموقع: ios/App/App/Assets.xcassets/AppIcon.appiconset/');
}

generateIOSIcons().catch(console.error);
