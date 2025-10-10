import fs from 'fs';
import path from 'path';

// Function to add missing translations to a challenge
function addMissingTranslations(challenge) {
  if (!challenge.translations) {
    // Sample translations for common terms
    const translations = {
      en: {
        title: challenge.title,
        description: challenge.description
      },
      ar: {
        title: challenge.title, // Will be manually translated
        description: challenge.description // Will be manually translated
      },
      fr: {
        title: challenge.title, // Will be manually translated
        description: challenge.description // Will be manually translated
      }
    };
    
    challenge.translations = translations;
  }
  return challenge;
}

// Process all challenge files
const challengeDir = './client/src/data/challenges';
const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(challengeDir, file);
  const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let modified = false;
  
  const updatedChallenges = challenges.map(challenge => {
    if (!challenge.translations) {
      console.log(`Adding translations for: ${challenge.id} - ${challenge.title}`);
      modified = true;
      return addMissingTranslations(challenge);
    }
    return challenge;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(updatedChallenges, null, 2));
    console.log(`Updated ${file}`);
  }
});

console.log('Challenge translations check complete!');