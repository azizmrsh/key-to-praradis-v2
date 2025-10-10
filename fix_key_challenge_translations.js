import fs from 'fs';
import path from 'path';

// Key challenge translations that were mentioned by the user
const keyTranslations = {
  // Pride challenges
  'Do It in Secret': {
    ar: { title: "افعلها في السر", description: "اليوم، افعل شيئاً جيداً في السر لا يعرفه أحد غير الله." },
    fr: { title: "Faites-le en secret", description: "Aujourd'hui, faites quelque chose de bien en secret que personne ne connaît sauf Allah." }
  },
  
  // Stomach challenges
  'Say Bismillah': {
    ar: { title: "قل بسم الله", description: "قل بسم الله قبل كل وجبة وشراب اليوم." },
    fr: { title: "Dites Bismillah", description: "Dites Bismillah avant chaque repas et boisson aujourd'hui." }
  },
  
  // Tongue challenges
  'Delete the Message': {
    ar: { title: "احذف الرسالة", description: "إذا كتبت رسالة غاضبة أو قاسية اليوم، احذفها بدلاً من إرسالها." },
    fr: { title: "Supprimez le message", description: "Si vous écrivez un message en colère ou dur aujourd'hui, supprimez-le au lieu de l'envoyer." }
  },
  
  "Say 'I Don't Know'": {
    ar: { title: "قل 'لا أعرف'", description: "اليوم، إذا سئلت عن شيء لا تعرفه، قل 'لا أعرف' بدلاً من التخمين." },
    fr: { title: "Dites 'Je ne sais pas'", description: "Aujourd'hui, si on vous demande quelque chose que vous ne savez pas, dites 'Je ne sais pas' au lieu de deviner." }
  },
  
  'Silent Smile': {
    ar: { title: "ابتسامة صامتة", description: "اليوم، رد على الإهانة بابتسامة صامتة وادع للشخص في قلبك." },
    fr: { title: "Sourire silencieux", description: "Aujourd'hui, répondez à l'insulte par un sourire silencieux et priez pour la personne dans votre cœur." }
  },
  
  'Silent Mornings': {
    ar: { title: "صباح صامت", description: "اليوم، ابدأ صباحك بساعة من الصمت والتأمل." },
    fr: { title: "Matins silencieux", description: "Aujourd'hui, commencez votre matinée par une heure de silence et de réflexion." }
  },
  
  'Truthful Compliments Only': {
    ar: { title: "مجاملات صادقة فقط", description: "اليوم، قل فقط المجاملات الصادقة والصحيحة." },
    fr: { title: "Compliments véridiques seulement", description: "Aujourd'hui, ne dites que des compliments sincères et vrais." }
  },
  
  'Zip the Lips': {
    ar: { title: "اقفل شفتيك", description: "اليوم، التزم الصمت عندما تشعر بالرغبة في قول شيء سلبي." },
    fr: { title: "Fermez les lèvres", description: "Aujourd'hui, restez silencieux quand vous ressentez l'envie de dire quelque chose de négatif." }
  },
  
  'Safeguard the Trust': {
    ar: { title: "احفظ الأمانة", description: "اليوم، احفظ كل أمانة وسر أوكل إليك." },
    fr: { title: "Protégez la confiance", description: "Aujourd'hui, protégez chaque confiance et secret qui vous est confié." }
  },
  
  'Honour the Private': {
    ar: { title: "أكرم الخاص", description: "اليوم، احترم خصوصية الآخرين ولا تفشِ أسرارهم." },
    fr: { title: "Honorez le privé", description: "Aujourd'hui, respectez la vie privée des autres et ne révélez pas leurs secrets." }
  },
  
  'Let It Go (Once)': {
    ar: { title: "اتركها (مرة واحدة)", description: "اليوم، اترك شيئاً واحداً كان يؤذيك واعف عنه." },
    fr: { title: "Laissez tomber (une fois)", description: "Aujourd'hui, laissez tomber une chose qui vous blessait et pardonnez-la." }
  },
  
  'Shift the Thought': {
    ar: { title: "غير الفكرة", description: "اليوم، كلما جاءتك فكرة سيئة، غيرها إلى فكرة طيبة." },
    fr: { title: "Changez la pensée", description: "Aujourd'hui, chaque fois qu'une mauvaise pensée vous vient, changez-la en une bonne pensée." }
  },
  
  'Unfollow Temptation': {
    ar: { title: "إلغاء متابعة الإغراء", description: "اليوم، ألغ متابعة حساب أو مصدر يثير فيك الرغبات المحرمة." },
    fr: { title: "Arrêtez de suivre la tentation", description: "Aujourd'hui, arrêtez de suivre un compte ou une source qui éveille en vous des désirs interdits." }
  },
  
  'Cut the Thread': {
    ar: { title: "اقطع الخيط", description: "اليوم، اقطع التواصل مع شخص يجرك إلى المعصية." },
    fr: { title: "Coupez le fil", description: "Aujourd'hui, coupez la communication avec quelqu'un qui vous entraîne vers le péché." }
  },
  
  'Du\'a of Hope': {
    ar: { title: "دعاء الأمل", description: "اليوم، ادع دعاء الأمل والتوبة من القلب." },
    fr: { title: "Du'a d'espoir", description: "Aujourd'hui, faites une du'a d'espoir et de repentir du cœur." }
  }
};

// Function to update challenge translations
function updateChallengeTranslations() {
  const challengeDir = './client/src/data/challenges';
  const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));
  
  let totalUpdated = 0;
  
  files.forEach(file => {
    const filePath = path.join(challengeDir, file);
    const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let modified = false;
    
    const updatedChallenges = challenges.map(challenge => {
      const title = challenge.title;
      
      // Check if this challenge title has translations we need to fix
      if (keyTranslations[title]) {
        const translations = keyTranslations[title];
        
        if (challenge.translations) {
          // Update Arabic translation
          if (translations.ar) {
            challenge.translations.ar = translations.ar;
            modified = true;
            totalUpdated++;
            console.log(`✓ Updated Arabic: ${challenge.id} - ${title} → ${translations.ar.title}`);
          }
          
          // Update French translation
          if (translations.fr) {
            challenge.translations.fr = translations.fr;
            modified = true;
            console.log(`✓ Updated French: ${challenge.id} - ${title} → ${translations.fr.title}`);
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
  
  console.log(`\n✅ Key challenge translations updated! Fixed ${totalUpdated} challenges.`);
}

// Run the update
updateChallengeTranslations();

// Final verification for remaining English text
console.log(`\n🔍 Checking for remaining English text in Arabic translations...`);

const challengeDir = './client/src/data/challenges';
const files = fs.readdirSync(challengeDir).filter(file => file.endsWith('.json'));

let remainingIssues = 0;

files.forEach(file => {
  const filePath = path.join(challengeDir, file);
  const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  challenges.forEach(challenge => {
    if (challenge.translations?.ar?.title) {
      const arabicTitle = challenge.translations.ar.title;
      
      // Check for common English words that shouldn't be in Arabic
      const englishWords = ['Do', 'It', 'in', 'Secret', 'Say', 'Delete', 'the', 'Message', 'Don\'t', 'Know', 'Silent', 'Smile', 'Mornings', 'Truthful', 'Compliments', 'Only', 'Zip', 'Lips', 'Safeguard', 'Trust', 'Honour', 'Private', 'Let', 'Go', 'Once', 'Shift', 'Thought', 'Unfollow', 'Temptation', 'Cut', 'Thread', 'Hope'];
      
      if (englishWords.some(word => arabicTitle.includes(word))) {
        console.log(`⚠️  NEEDS TRANSLATION: ${challenge.id} - "${arabicTitle}"`);
        remainingIssues++;
      }
    }
  });
});

if (remainingIssues === 0) {
  console.log(`\n🎉 All key challenges now have proper Arabic translations!`);
} else {
  console.log(`\n⚠️  ${remainingIssues} challenges still need translation.`);
}

console.log(`\n✅ Key challenge translation fix complete!`);