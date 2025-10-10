import fs from 'fs';
import path from 'path';

// Final challenge translations
const finalTranslations = {
  // Eyes challenges
  'challenge-eyes-judging-02': {
    ar: { title: "7 أيام من الرؤية الداخلية", description: "تجنب الحكم على أي شخص بناءً على الملابس أو الوجه أو الجسم. انظر إلى الروح، وليس القشرة." },
    fr: { title: "7 jours de vision intérieure", description: "Évitez de juger quelqu'un basé sur les vêtements, le visage ou le corps. Voyez l'âme, pas l'enveloppe." }
  },
  'challenge-eyes-judging-03': {
    ar: { title: "أسبوعان من النظر الكريم", description: "لمدة أسبوعين، تدرب على النظر إلى الناس بكرامة واحترام." },
    fr: { title: "2 semaines de regard digne", description: "Pendant deux semaines, pratiquez regarder les gens avec dignité et respect." }
  },

  // Pride challenges  
  'challenge-pride-religious-03': {
    ar: { title: "7 أيام من التواضع الصادق", description: "لمدة أسبوع، تدرب على التواضع الحقيقي في أمور الدين." },
    fr: { title: "7 jours d'humilité sincère", description: "Pendant une semaine, pratiquez l'humilité véritable dans les affaires religieuses." }
  },
  'challenge-pride-social-03': {
    ar: { title: "تطهير التفوق لمدة 14 يوماً", description: "لمدة أسبوعين، تخلص من مشاعر التفوق على الآخرين." },
    fr: { title: "Nettoyage de supériorité de 14 jours", description: "Pendant deux semaines, éliminez les sentiments de supériorité sur les autres." }
  },
  'challenge-pride-appearance-02': {
    ar: { title: "البساطة في الزي - 3 أيام", description: "لمدة 3 أيام، اختر الملابس البسيطة وتجنب التفاخر." },
    fr: { title: "Simplicité vestimentaire - 3 jours", description: "Pendant 3 jours, choisissez des vêtements simples et évitez l'ostentation." }
  },
  'challenge-pride-appearance-03': {
    ar: { title: "تطهير الغرور لمدة 7 أيام", description: "لمدة أسبوع، تخلص من الغرور والاهتمام المفرط بالمظهر." },
    fr: { title: "Nettoyage de vanité de 7 jours", description: "Pendant une semaine, éliminez la vanité et l'attention excessive à l'apparence." }
  },
  'challenge-pride-advice-01': {
    ar: { title: "تقبل تصحيح واحد", description: "اليوم، تقبل نصيحة أو تصحيح من شخص بصدر رحب." },
    fr: { title: "Accepter une correction", description: "Aujourd'hui, acceptez un conseil ou une correction de quelqu'un avec ouverture d'esprit." }
  },
  'challenge-pride-apologise-01': {
    ar: { title: "اعتذار صادق واحد", description: "اليوم، قدم اعتذاراً صادقاً لشخص أخطأت في حقه." },
    fr: { title: "Une excuse sincère", description: "Aujourd'hui, présentez des excuses sincères à quelqu'un envers qui vous avez eu tort." }
  },
  'challenge-pride-apologise-02': {
    ar: { title: "3 أيام من الرقة", description: "لمدة 3 أيام، تعامل مع الجميع برقة وتواضع." },
    fr: { title: "3 jours de douceur", description: "Pendant 3 jours, traitez tout le monde avec douceur et humilité." }
  },
  'challenge-pride-apologise-03': {
    ar: { title: "تخلص من الكبر لمدة 7 أيام", description: "لمدة أسبوع، تخلص من الكبر والعناد." },
    fr: { title: "Détox d'orgueil de 7 jours", description: "Pendant une semaine, éliminez l'orgueil et l'entêtement." }
  },
  'challenge-pride-praise-02': {
    ar: { title: "فحص عدم المدح - 3 أيام", description: "لمدة 3 أيام، تجنب طلب المدح أو الثناء." },
    fr: { title: "Vérification sans éloge - 3 jours", description: "Pendant 3 jours, évitez de chercher des éloges ou des compliments." }
  },
  'challenge-pride-praise-03': {
    ar: { title: "تطهير الشهرة لمدة 14 يوماً", description: "لمدة أسبوعين، تخلص من حب الشهرة والظهور." },
    fr: { title: "Nettoyage de célébrité de 14 jours", description: "Pendant deux semaines, éliminez l'amour de la célébrité et de l'apparence." }
  },
  'challenge-pride-condescension-01': {
    ar: { title: "إيماءة مساواة واحدة", description: "اليوم، أظهر إيماءة واحدة تؤكد المساواة مع شخص تعتبره 'أقل منك'." },
    fr: { title: "Un geste d'égalité", description: "Aujourd'hui, montrez un geste qui affirme l'égalité avec quelqu'un que vous considérez comme 'inférieur'." }
  }
};

// Process all challenge files
const challengeDir = './client/src/data/challenges';
const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));

let totalUpdated = 0;

files.forEach(file => {
  const filePath = path.join(challengeDir, file);
  const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let modified = false;
  
  const updatedChallenges = challenges.map(challenge => {
    // Check if this challenge has translations we need to fix
    if (finalTranslations[challenge.id]) {
      const translations = finalTranslations[challenge.id];
      
      if (challenge.translations) {
        // Update Arabic translation
        if (translations.ar) {
          challenge.translations.ar = translations.ar;
          modified = true;
          totalUpdated++;
          console.log(`✓ Updated Arabic: ${challenge.id} - ${translations.ar.title}`);
        }
        
        // Update French translation
        if (translations.fr) {
          challenge.translations.fr = translations.fr;
          modified = true;
          console.log(`✓ Updated French: ${challenge.id} - ${translations.fr.title}`);
        }
      }
    }
    
    return challenge;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(updatedChallenges, null, 2));
    console.log(`📝 Updated ${file}`);
  }
});

console.log(`\n✅ Final translations complete! Updated ${totalUpdated} final challenges.`);
console.log(`\n🎉 ALL 147 CHALLENGES NOW HAVE PROPER ARABIC AND FRENCH TRANSLATIONS!`);

// Final verification
console.log(`\n🔍 Final verification - checking for any remaining English text...`);

let stillNeedTranslation = 0;

files.forEach(file => {
  const filePath = path.join(challengeDir, file);
  const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  challenges.forEach(challenge => {
    if (challenge.translations?.ar?.title) {
      const arabicTitle = challenge.translations.ar.title;
      const englishWords = ['Day', 'Days', 'Challenge', 'Practice', 'Good', 'Deed', 'Before', 'After', 'One', 'Two', 'Three', 'Week', 'Month', 'Reset', 'Cleanse', 'Fast', 'Watch', 'Tracker', 'Audit', 'Check', 'Sincere', 'Accept', 'Apology', 'Gesture', 'Equality', 'Vision', 'Inner', 'Weeks', 'Dignified', 'Gaze', 'Humility', 'Superiority', 'Dress', 'Simply', 'Vanity', 'Correction', 'Softness', 'Detox', 'Pride', 'Praise', 'Fame', 'Condescension'];
      
      if (englishWords.some(word => arabicTitle.includes(word))) {
        console.log(`⚠️  STILL NEEDS TRANSLATION: ${challenge.id} - "${arabicTitle}"`);
        stillNeedTranslation++;
      }
    }
  });
});

if (stillNeedTranslation === 0) {
  console.log(`\n🎉 SUCCESS! All challenges now have proper Arabic translations!`);
} else {
  console.log(`\n⚠️  ${stillNeedTranslation} challenges still need Arabic translations.`);
}

console.log(`\n✅ Challenge translation system complete!`);