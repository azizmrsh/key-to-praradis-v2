import fs from 'fs';
import path from 'path';

// Function to parse CSV properly handling quoted values
function parseCSV(csvText) {
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    
    if (char === '"' && (i === 0 || csvText[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
      continue;
    }
    
    currentLine += char;
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.map(line => {
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.replace(/""/g, '"'));
        currentField = '';
        continue;
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField.replace(/""/g, '"'));
    return fields;
  });
}

// Function to update challenges from CSV
function updateChallengesFromCSV() {
  if (!fs.existsSync('./challenges_translations.csv')) {
    console.log('❌ challenges_translations.csv not found!');
    return;
  }
  
  const csvContent = fs.readFileSync('./challenges_translations.csv', 'utf8');
  const rows = parseCSV(csvContent);
  
  if (rows.length === 0) {
    console.log('❌ CSV file is empty!');
    return;
  }
  
  const headers = rows[0];
  const dataRows = rows.slice(1);
  
  // Expected headers
  const expectedHeaders = [
    'challenge_id', 'category', 'subcategory', 'duration_days', 'difficulty',
    'title_en', 'description_en', 'title_ar', 'description_ar', 'title_fr', 'description_fr'
  ];
  
  // Validate headers
  if (!expectedHeaders.every(header => headers.includes(header))) {
    console.log('❌ CSV headers do not match expected format!');
    console.log('Expected:', expectedHeaders);
    console.log('Found:', headers);
    return;
  }
  
  // Group challenges by category
  const challengesByCategory = {};
  
  dataRows.forEach(row => {
    const challengeData = {};
    headers.forEach((header, index) => {
      challengeData[header] = row[index] || '';
    });
    
    const category = challengeData.category;
    if (!challengesByCategory[category]) {
      challengesByCategory[category] = [];
    }
    
    challengesByCategory[category].push(challengeData);
  });
  
  let totalUpdated = 0;
  
  // Update each category file
  Object.keys(challengesByCategory).forEach(category => {
    const filePath = `./client/src/data/challenges/${category}.json`;
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Category file not found: ${filePath}`);
      return;
    }
    
    const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let modified = false;
    
    const updatedChallenges = challenges.map(challenge => {
      const csvData = challengesByCategory[category].find(c => c.challenge_id === challenge.id);
      
      if (csvData) {
        // Update translations
        if (!challenge.translations) {
          challenge.translations = {};
        }
        
        // Update English (if changed)
        if (csvData.title_en !== challenge.title || csvData.description_en !== challenge.description) {
          challenge.title = csvData.title_en;
          challenge.description = csvData.description_en;
          modified = true;
        }
        
        // Update Arabic translation
        if (csvData.title_ar || csvData.description_ar) {
          if (!challenge.translations.ar) {
            challenge.translations.ar = {};
          }
          
          if (csvData.title_ar !== challenge.translations.ar.title || 
              csvData.description_ar !== challenge.translations.ar.description) {
            challenge.translations.ar.title = csvData.title_ar;
            challenge.translations.ar.description = csvData.description_ar;
            modified = true;
          }
        }
        
        // Update French translation
        if (csvData.title_fr || csvData.description_fr) {
          if (!challenge.translations.fr) {
            challenge.translations.fr = {};
          }
          
          if (csvData.title_fr !== challenge.translations.fr.title || 
              csvData.description_fr !== challenge.translations.fr.description) {
            challenge.translations.fr.title = csvData.title_fr;
            challenge.translations.fr.description = csvData.description_fr;
            modified = true;
          }
        }
        
        if (modified) {
          totalUpdated++;
          console.log(`✓ Updated: ${challenge.id} - ${challenge.title}`);
        }
      }
      
      return challenge;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(updatedChallenges, null, 2));
      console.log(`📝 Updated ${category}.json`);
    }
  });
  
  console.log(`\n✅ Challenge translations updated!`);
  console.log(`📊 Total challenges updated: ${totalUpdated}`);
  console.log(`📄 Processed ${dataRows.length} challenges from CSV`);
}

// Run the update
updateChallengesFromCSV();