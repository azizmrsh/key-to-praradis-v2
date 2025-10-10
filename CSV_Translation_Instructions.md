# Challenge Translation Review Instructions

## Files Created

✅ **challenges_translations.csv** - Complete CSV export with all 153 challenges
✅ **update_challenges_from_csv.js** - Script to import your corrections

## CSV Structure

The CSV contains these columns:
- `challenge_id` - Unique identifier (DO NOT CHANGE)
- `category` - Challenge category (DO NOT CHANGE)
- `subcategory` - Challenge subcategory (DO NOT CHANGE)
- `duration_days` - Challenge duration (DO NOT CHANGE)
- `difficulty` - Challenge difficulty (DO NOT CHANGE)
- `title_en` - English title (editable)
- `description_en` - English description (editable)
- `title_ar` - Arabic title (editable) ⚠️ **FOCUS HERE**
- `description_ar` - Arabic description (editable) ⚠️ **FOCUS HERE**
- `title_fr` - French title (editable)
- `description_fr` - French description (editable)

## Review Process

1. **Open challenges_translations.csv** in Excel or Google Sheets
2. **Focus on Arabic translations** (title_ar and description_ar columns)
3. **Check for any English text** in Arabic fields
4. **Verify authentic Islamic content** and proper Arabic grammar
5. **Make corrections** directly in the CSV file
6. **Save as CSV format** (important!)

## When You're Ready to Update

Copy and paste this exact prompt when you send me the corrected CSV:

---

**PROMPT TO USE:**

```
I have reviewed the challenges_translations.csv file and made corrections to the Arabic and French translations. Please update the challenge database with these corrections.

The corrected file is attached. Use the update_challenges_from_csv.js script to process the changes.

Focus on:
- Arabic translations (title_ar and description_ar)
- French translations (title_fr and description_fr)
- Maintaining challenge_id as primary key for updates

After updating, please confirm:
1. How many challenges were updated
2. Any validation errors or issues
3. Verification that no English text remains in Arabic fields
```

---

## Important Notes

- **DO NOT** modify the challenge_id column - this is the primary key
- **DO NOT** modify category, subcategory, duration_days, or difficulty columns
- **FOCUS** on Arabic translations to ensure no English text remains
- The CSV format must be preserved when saving
- The script will automatically update all challenge files

## Verification After Update

I will run validation scripts to ensure:
- All Arabic fields contain proper Arabic text
- No English text remains in Arabic translation fields
- Translation structure is maintained correctly
- All 153 challenges are processed successfully