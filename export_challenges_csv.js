import fs from 'fs';
import path from 'path';

// Function to escape CSV values
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Function to export challenges to CSV
function exportChallengesToCSV() {
  const challengeDir = './client/src/data/challenges';
  const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));
  
  const csvHeaders = [
    'challenge_id',
    'category',
    'subcategory',
    'duration_days',
    'difficulty',
    'title_en',
    'description_en',
    'title_ar',
    'description_ar',
    'title_fr',
    'description_fr'
  ];
  
  const csvRows = [csvHeaders.join(',')];
  
  files.forEach(file => {
    const filePath = path.join(challengeDir, file);
    const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    challenges.forEach(challenge => {
      const row = [
        escapeCSV(challenge.id),
        escapeCSV(challenge.category),
        escapeCSV(challenge.subcategory),
        escapeCSV(challenge.duration_days),
        escapeCSV(challenge.difficulty),
        escapeCSV(challenge.title),
        escapeCSV(challenge.description),
        escapeCSV(challenge.translations?.ar?.title || ''),
        escapeCSV(challenge.translations?.ar?.description || ''),
        escapeCSV(challenge.translations?.fr?.title || ''),
        escapeCSV(challenge.translations?.fr?.description || '')
      ];
      csvRows.push(row.join(','));
    });
  });
  
  const csvContent = csvRows.join('\n');
  fs.writeFileSync('./challenges_translations.csv', csvContent);
  
  console.log(`✅ CSV exported successfully to challenges_translations.csv`);
  console.log(`📊 Total challenges exported: ${csvRows.length - 1}`);
}

// Run the export
exportChallengesToCSV();