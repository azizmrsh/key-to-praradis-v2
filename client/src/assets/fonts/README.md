# Arabic Font Installation Instructions

## Sakkal Font Integration

The application is configured to use the Sakkal Arabic font for authentic Arabic text display. To complete the font integration:

### Manual Font File Placement

1. Extract the `Sakkal-transfonter.org-20250702-120602_1751459284265.zip` file from `attached_assets/`

2. Place the following font files in this directory (`client/src/assets/fonts/`):
   - `sakkal.woff` (required)
   - `sakkal.woff2` (recommended for better compression)
   - `sakkal-bold.woff` (for bold text)
   - `sakkal-bold.woff2` (recommended for better compression)

### Expected Font Files Structure
```
client/src/assets/fonts/
├── README.md
├── arabic-fonts.css
├── sakkal.woff
├── sakkal.woff2
├── sakkal-bold.woff
└── sakkal-bold.woff2
```

### Font Integration Status

✅ **Completed:**
- CSS font-face declarations in `arabic-fonts.css` with all 5 font weights
- Tailwind CSS font family configuration
- Arabic text utility classes
- BilingualText component for Arabic/English display
- DhikrPlayer component updated to use Sakkal font
- Font files successfully placed in assets/fonts directory
- Font test page created at `/font-test` route

✅ **Font Files Available:**
- SakkalKitabLt (Light - 300)
- SakkalKitab-Regular (Regular - 400)
- SakkalKitabMd (Medium - 500)
- SakkalKitab-Bold (Bold - 700)
- SakkalKitabHvy (Heavy - 900)

### Usage

Once the font files are placed, the application will automatically use the Sakkal font for:

- Arabic text in the SOS/Dhikr player
- Qur'anic verses and Islamic quotes
- Arabic headings and body text
- Prayer and dhikr content

### CSS Classes Available

- `.arabic-text` - Standard Arabic body text
- `.arabic-heading` - Arabic headings with bold weight
- `.arabic-verse` - Formatted Qur'anic verses
- `.arabic-dhikr` - Dhikr and prayer text styling

### Tailwind Utilities

- `font-arabic` - Apply Sakkal font family
- `font-arabic-heading` - Apply Sakkal for headings

### React Components

- `<ArabicText variant="dhikr">` - Styled Arabic text
- `<BilingualText arabic="..." translation="..." />` - Bilingual display