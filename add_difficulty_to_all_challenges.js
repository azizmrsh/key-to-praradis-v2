import fs from 'fs';
import path from 'path';

// Default difficulty levels based on duration
const getDifficultyByDuration = (durationDays) => {
  if (durationDays === 1) return 'easy';
  if (durationDays <= 7) return 'medium';
  return 'hard';
};

// Process all challenge files
const challengeDir = './client/src/data/challenges';
const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(challengeDir, file);
  const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let modified = false;
  
  const updatedChallenges = challenges.map(challenge => {
    if (!challenge.difficulty) {
      const difficulty = getDifficultyByDuration(challenge.duration_days);
      challenge.difficulty = difficulty;
      modified = true;
      console.log(`Added difficulty "${difficulty}" to ${challenge.id} (${challenge.duration_days} days)`);
    }
    return challenge;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(updatedChallenges, null, 2));
    console.log(`Updated ${file} with difficulty levels`);
  }
});

console.log('All challenges now have difficulty levels!');