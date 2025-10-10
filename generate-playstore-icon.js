import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار اللوجو الأصلي
const logoPath = path.join(__dirname, 'attached_assets', 'QT_final_logo-02-01_1751283453807.png');

// إنشاء أيقونة Play Store (512x512)
async function generatePlayStoreIcon() {
  console.log('🎨 إنشاء أيقونة Play Store...\n');

  const outputPath = path.join(__dirname, 'android', 'app', 'play-store-icon.png');

  try {
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log('✅ تم إنشاء أيقونة Play Store (512x512)');
    console.log('📁 الموقع:', outputPath);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

generatePlayStoreIcon().catch(console.error);
