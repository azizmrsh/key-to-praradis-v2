import fs from 'fs';
import path from 'path';

// Common English words that should not appear in Arabic translations
const englishWords = [
  'Do', 'It', 'in', 'Secret', 'Say', 'Delete', 'the', 'Message', 'Don\'t', 'Know', 
  'Silent', 'Smile', 'Mornings', 'Truthful', 'Compliments', 'Only', 'Zip', 'Lips', 
  'Safeguard', 'Trust', 'Honour', 'Private', 'Let', 'Go', 'Once', 'Shift', 'Thought', 
  'Unfollow', 'Temptation', 'Cut', 'Thread', 'Hope', 'Eat', 'with', 'Lowly', 'Day', 
  'Days', 'Week', 'Today', 'For', 'Avoid', 'Your', 'You', 'Are', 'Is', 'And', 'Or', 
  'But', 'If', 'When', 'Where', 'How', 'What', 'Why', 'Who', 'This', 'That', 'These', 
  'Those', 'Challenge', 'Filter', 'Cleanse', 'Guard', 'Detox', 'Fast', 'Defender'
];

function verifyTranslations() {
  const challengeDir = './client/src/data/challenges';
  const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));
  
  let totalChallenges = 0;
  let issuesFound = 0;
  const issues = [];
  
  console.log('🔍 Verifying Challenge Translations...\n');
  
  files.forEach(file => {
    const filePath = path.join(challengeDir, file);
    const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    challenges.forEach(challenge => {
      totalChallenges++;
      
      // Check Arabic translation
      if (challenge.translations?.ar?.title) {
        const arabicTitle = challenge.translations.ar.title;
        
        // Check for English words in Arabic title
        const foundEnglishWords = englishWords.filter(word => 
          arabicTitle.includes(word) || arabicTitle.includes(word.toLowerCase())
        );
        
        if (foundEnglishWords.length > 0) {
          issues.push({
            id: challenge.id,
            category: challenge.category,
            type: 'Arabic Title',
            content: arabicTitle,
            englishWords: foundEnglishWords
          });
          issuesFound++;
        }
      } else {
        issues.push({
          id: challenge.id,
          category: challenge.category,
          type: 'Missing Arabic Title',
          content: 'No Arabic title found',
          englishWords: []
        });
        issuesFound++;
      }
      
      // Check Arabic description
      if (challenge.translations?.ar?.description) {
        const arabicDesc = challenge.translations.ar.description;
        
        // Check for English words in Arabic description
        const foundEnglishWords = englishWords.filter(word => 
          arabicDesc.includes(word) || arabicDesc.includes(word.toLowerCase())
        );
        
        if (foundEnglishWords.length > 0) {
          issues.push({
            id: challenge.id,
            category: challenge.category,
            type: 'Arabic Description',
            content: arabicDesc.substring(0, 100) + '...',
            englishWords: foundEnglishWords
          });
          issuesFound++;
        }
      } else {
        issues.push({
          id: challenge.id,
          category: challenge.category,
          type: 'Missing Arabic Description',
          content: 'No Arabic description found',
          englishWords: []
        });
        issuesFound++;
      }
    });
  });
  
  console.log(`📊 VERIFICATION SUMMARY:`);
  console.log(`Total challenges: ${totalChallenges}`);
  console.log(`Issues found: ${issuesFound}`);
  console.log(`Success rate: ${((totalChallenges * 2 - issuesFound) / (totalChallenges * 2) * 100).toFixed(1)}%\n`);
  
  if (issues.length > 0) {
    console.log('⚠️  ISSUES FOUND:');
    issues.forEach(issue => {
      console.log(`- ${issue.id} (${issue.category})`);
      console.log(`  Type: ${issue.type}`);
      console.log(`  Content: "${issue.content}"`);
      if (issue.englishWords.length > 0) {
        console.log(`  English words found: ${issue.englishWords.join(', ')}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ All translations verified successfully!');
    console.log('🎉 No English text found in Arabic translations!');
  }
}

// Run verification
verifyTranslations();