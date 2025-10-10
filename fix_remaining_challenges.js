import fs from 'fs';
import path from 'path';

// Complete remaining challenge translations
const remainingTranslations = {
  // Pride challenges
  'challenge-pride-condescension-02': {
    ar: { title: "مراقبة اللغة لمدة 3 أيام", description: "لمدة 3 أيام، راقب لغتك وتجنب الكلام المتعالي." },
    fr: { title: "Surveillance du langage de 3 jours", description: "Pendant 3 jours, surveillez votre langage et évitez les paroles condescendantes." }
  },
  'challenge-pride-condescension-03': {
    ar: { title: "7 أيام من ممارسة الاحترام", description: "لمدة أسبوع، تعامل مع الجميع باحترام وتواضع." },
    fr: { title: "7 jours de pratique du respect", description: "Pendant une semaine, traitez tout le monde avec respect et humilité." }
  },

  // Stomach challenges
  'challenge-stomach-overeating-03': {
    ar: { title: "إعادة تعيين الاعتدال لمدة 7 أيام", description: "لمدة أسبوع، تدرب على الأكل المعتدل والمتوازن." },
    fr: { title: "Réinitialisation de modération de 7 jours", description: "Pendant une semaine, pratiquez une alimentation modérée et équilibrée." }
  },
  'challenge-stomach-distracted-02': {
    ar: { title: "وجبات بوعي - 3 أيام", description: "لمدة 3 أيام، كل كل وجبة بوعي وتركيز كامل." },
    fr: { title: "Repas conscients - 3 jours", description: "Pendant 3 jours, mangez chaque repas avec conscience et concentration complète." }
  },
  'challenge-stomach-distracted-03': {
    ar: { title: "7 أيام من الحضور", description: "لمدة أسبوع، كن حاضراً بالكامل أثناء الأكل." },
    fr: { title: "7 jours de présence", description: "Pendant une semaine, soyez complètement présent pendant les repas." }
  },
  'challenge-stomach-halal-income-02': {
    ar: { title: "تأمل الحلال لمدة 3 أيام", description: "لمدة 3 أيام، تأمل في مصدر رزقك وتأكد من حلاله." },
    fr: { title: "Réflexion halal de 3 jours", description: "Pendant 3 jours, réfléchissez à la source de votre subsistance et assurez-vous qu'elle est halal." }
  },
  'challenge-stomach-halal-income-03': {
    ar: { title: "تحدي طهارة الرزق لمدة 7 أيام", description: "لمدة أسبوع، تأكد من أن رزقك طاهر وحلال." },
    fr: { title: "Défi de pureté de subsistance de 7 jours", description: "Pendant une semaine, assurez-vous que votre subsistance est pure et halal." }
  },
  'challenge-stomach-doubtful-02': {
    ar: { title: "أكل خالي من الشك - 3 أيام", description: "لمدة 3 أيام، تجنب كل طعام مشكوك في حلاله." },
    fr: { title: "Alimentation sans doute - 3 jours", description: "Pendant 3 jours, évitez tout aliment douteux quant à sa licéité." }
  },
  'challenge-stomach-doubtful-03': {
    ar: { title: "7 أيام من الأكل الزاهد", description: "لمدة أسبوع، كل فقط ما تتيقن من حلاله." },
    fr: { title: "7 jours d'alimentation ascétique", description: "Pendant une semaine, mangez seulement ce dont vous êtes certain de la licéité." }
  },
  'challenge-stomach-waste-02': {
    ar: { title: "تكريم الطعام لمدة 3 أيام", description: "لمدة 3 أيام، أكرم كل قطعة طعام ولا تضيع شيئاً." },
    fr: { title: "Honneur alimentaire de 3 jours", description: "Pendant 3 jours, honorez chaque morceau de nourriture et ne gaspillez rien." }
  },
  'challenge-stomach-waste-03': {
    ar: { title: "مراجعة مكافحة الإسراف لمدة 7 أيام", description: "لمدة أسبوع، راجع عاداتك الغذائية وتجنب الإسراف." },
    fr: { title: "Audit anti-gaspillage de 7 jours", description: "Pendant une semaine, examinez vos habitudes alimentaires et évitez le gaspillage." }
  },
  'challenge-stomach-emotional-01': {
    ar: { title: "اسأل قبل أن تتناول وجبة خفيفة", description: "اليوم، اسأل نفسك 'هل أنا جائع حقاً؟' قبل كل وجبة خفيفة." },
    fr: { title: "Demandez avant de grignoter", description: "Aujourd'hui, demandez-vous 'Ai-je vraiment faim?' avant chaque collation." }
  },
  'challenge-stomach-emotional-02': {
    ar: { title: "متتبع النية لمدة 3 أيام", description: "لمدة 3 أيام، تتبع نيتك وراء كل وجبة." },
    fr: { title: "Traceur d'intention de 3 jours", description: "Pendant 3 jours, suivez votre intention derrière chaque repas." }
  },
  'challenge-stomach-emotional-03': {
    ar: { title: "7 أيام من تغذية الروح", description: "لمدة أسبوع، اطعم روحك بالذكر والقرآن أكثر من طعام الجسد." },
    fr: { title: "7 jours de nourriture de l'âme", description: "Pendant une semaine, nourrissez votre âme avec le dhikr et le Coran plus que la nourriture du corps." }
  },
  'challenge-stomach-intention-02': {
    ar: { title: "عادة الدعاء لمدة 3 أيام", description: "لمدة 3 أيام، اجعل الدعاء قبل وبعد الأكل عادة." },
    fr: { title: "Habitude de du'a de 3 jours", description: "Pendant 3 jours, faites de la du'a avant et après les repas une habitude." }
  },
  'challenge-stomach-intention-03': {
    ar: { title: "7 أيام من الأكل المقدس", description: "لمدة أسبوع، اجعل كل وجبة عبادة بالنية والدعاء." },
    fr: { title: "7 jours d'alimentation sacrée", description: "Pendant une semaine, faites de chaque repas un acte d'adoration avec intention et du'a." }
  },

  // Tongue challenges
  'challenge-tongue-slander-01': {
    ar: { title: "توقف قبل أن تتكلم", description: "اليوم، توقف وفكر قبل أن تقول أي شيء قد يضر بسمعة شخص." },
    fr: { title: "Pause avant de parler", description: "Aujourd'hui, arrêtez-vous et réfléchissez avant de dire quoi que ce soit qui pourrait nuire à la réputation de quelqu'un." }
  },
  'challenge-tongue-mockery-01': {
    ar: { title: "كن الشخص اللطيف", description: "اليوم، كن الشخص الذي يهدئ الموقف بدلاً من السخرية." },
    fr: { title: "Soyez la personne douce", description: "Aujourd'hui, soyez la personne qui calme la situation au lieu de se moquer." }
  },
  'challenge-tongue-mockery-03': {
    ar: { title: "امدح من تسخر منه", description: "لمدة أسبوعين، امدح شخصاً بدلاً من السخرية منه." },
    fr: { title: "Complimentez celui dont vous vous moquez", description: "Pendant deux semaines, complimentez quelqu'un au lieu de vous moquer de lui." }
  },
  'challenge-tongue-idle-01': {
    ar: { title: "ثلاثة صمت مقدسة", description: "اليوم، التزم الصمت في ثلاث مناسبات حيث كنت ستتكلم بلا فائدة." },
    fr: { title: "Trois silences sacrés", description: "Aujourd'hui, gardez le silence dans trois occasions où vous auriez parlé sans utilité." }
  },
  'challenge-tongue-idle-02': {
    ar: { title: "أسبوع الكلام المقصود", description: "لمدة أسبوع، تكلم فقط عندما يكون لكلامك فائدة واضحة." },
    fr: { title: "Semaine de parole intentionnelle", description: "Pendant une semaine, parlez seulement quand vos paroles ont un bénéfice clair." }
  },
  'challenge-tongue-flattery-02': {
    ar: { title: "ممارسة الأصالة - 7 أيام", description: "لمدة 7 أيام، كن صادقاً في مدحك وتجنب المجاملات المفرطة." },
    fr: { title: "Pratique d'authenticité - 7 jours", description: "Pendant 7 jours, soyez sincère dans vos éloges et évitez les flatteries excessives." }
  },
  'challenge-tongue-flattery-03': {
    ar: { title: "تطهير المدح لمدة 14 يوماً", description: "لمدة أسبوعين، طهر مدحك من المجاملات الفارغة." },
    fr: { title: "Nettoyage d'éloge de 14 jours", description: "Pendant deux semaines, purifiez vos éloges des compliments vides." }
  },
  'challenge-tongue-vulgar-01': {
    ar: { title: "يوم اللغة المهذبة", description: "اليوم، استخدم لغة مهذبة ونظيفة في كل محادثاتك." },
    fr: { title: "Jour de langage raffiné", description: "Aujourd'hui, utilisez un langage raffiné et propre dans toutes vos conversations." }
  },
  'challenge-tongue-vulgar-02': {
    ar: { title: "تكلم كالمؤمن - 7 أيام", description: "لمدة 7 أيام، اجعل كلامك يليق بالمؤمن." },
    fr: { title: "Parlez comme un croyant - 7 jours", description: "Pendant 7 jours, faites que votre discours convienne à un croyant." }
  },
  'challenge-tongue-vulgar-03': {
    ar: { title: "إعادة تعيين الكلام النظيف لمدة 14 يوماً", description: "لمدة أسبوعين، اعيد تعيين لغتك إلى الكلام النظيف والطاهر." },
    fr: { title: "Réinitialisation du discours propre de 14 jours", description: "Pendant deux semaines, réinitialisez votre langage vers un discours propre et pur." }
  },
  'challenge-tongue-arguing-02': {
    ar: { title: "7 أيام من الكلام الهادئ", description: "لمدة أسبوع، تكلم بهدوء وتجنب الجدال." },
    fr: { title: "7 jours de parole calme", description: "Pendant une semaine, parlez calmement et évitez les disputes." }
  },
  'challenge-tongue-arguing-03': {
    ar: { title: "تخلص من الجدال لمدة 14 يوماً", description: "لمدة أسبوعين، تجنب الجدال والمناقشات العقيمة." },
    fr: { title: "Détox de dispute de 14 jours", description: "Pendant deux semaines, évitez les disputes et les discussions stériles." }
  },

  // Zina challenges
  'challenge-zina-flirt-03': {
    ar: { title: "تطهير الرسائل لمدة 7 أيام", description: "لمدة أسبوع، طهر رسائلك من كل ما يثير الفتنة." },
    fr: { title: "Nettoyage de messagerie de 7 jours", description: "Pendant une semaine, purifiez vos messages de tout ce qui éveille la tentation." }
  },
  'challenge-zina-privacy-02': {
    ar: { title: "حاجز الخلوة لمدة 3 أيام", description: "لمدة 3 أيام، تجنب الخلوة مع الأجانب." },
    fr: { title: "Barrière d'intimité de 3 jours", description: "Pendant 3 jours, évitez l'intimité avec les étrangers." }
  },
  'challenge-zina-privacy-03': {
    ar: { title: "7 أيام من الشرف", description: "لمدة أسبوع، احتفظ بشرفك وتجنب المواقف المشبوهة." },
    fr: { title: "7 jours d'honneur", description: "Pendant une semaine, préservez votre honneur et évitez les situations suspectes." }
  },
  'challenge-zina-media-02': {
    ar: { title: "إعادة تعيين المحتوى لمدة 3 أيام", description: "لمدة 3 أيام، اعيد تعيين المحتوى الذي تستهلكه إلى الحلال." },
    fr: { title: "Réinitialisation du contenu de 3 jours", description: "Pendant 3 jours, réinitialisez le contenu que vous consommez vers le halal." }
  },
  'challenge-zina-media-03': {
    ar: { title: "تخلص من الرغبة لمدة 7 أيام", description: "لمدة أسبوع، تخلص من المحتوى الذي يثير الرغبات المحرمة." },
    fr: { title: "Détox de désir de 7 jours", description: "Pendant une semaine, éliminez le contenu qui éveille les désirs interdits." }
  },
  'challenge-zina-fantasy-02': {
    ar: { title: "إعادة توصيل العقل لمدة 3 أيام", description: "لمدة 3 أيام، اعيد توصيل أفكارك نحو الطهارة." },
    fr: { title: "Reconnexion mentale de 3 jours", description: "Pendant 3 jours, reconnectez vos pensées vers la pureté." }
  },
  'challenge-zina-fantasy-03': {
    ar: { title: "7 أيام من السيطرة على الأفكار", description: "لمدة أسبوع، تحكم في أفكارك وتجنب الخيالات المحرمة." },
    fr: { title: "7 jours de contrôle des pensées", description: "Pendant une semaine, contrôlez vos pensées et évitez les fantasmes interdits." }
  },
  'challenge-zina-social-02': {
    ar: { title: "طهارة التصفح لمدة 3 أيام", description: "لمدة 3 أيام، تصفح وسائل التواصل بطهارة." },
    fr: { title: "Pureté de défilement de 3 jours", description: "Pendant 3 jours, naviguez sur les réseaux sociaux avec pureté." }
  },
  'challenge-zina-social-03': {
    ar: { title: "إعادة تعيين وسائل التواصل لمدة 7 أيام", description: "لمدة أسبوع، اعيد تعيين استخدامك لوسائل التواصل." },
    fr: { title: "Réinitialisation sociale de 7 jours", description: "Pendant une semaine, réinitialisez votre utilisation des réseaux sociaux." }
  },
  'challenge-zina-companionship-02': {
    ar: { title: "حدود لمدة 3 أيام", description: "لمدة 3 أيام، ضع حدوداً واضحة في علاقاتك." },
    fr: { title: "Limites de 3 jours", description: "Pendant 3 jours, établissez des limites claires dans vos relations." }
  },
  'challenge-zina-companionship-03': {
    ar: { title: "استراتيجية الخروج لمدة 7 أيام", description: "لمدة أسبوع، ضع استراتيجية للخروج من العلاقات المحرمة." },
    fr: { title: "Stratégie de sortie de 7 jours", description: "Pendant une semaine, développez une stratégie pour sortir des relations interdites." }
  },
  'challenge-zina-hopelessness-02': {
    ar: { title: "تذكرة الرحمة لمدة 3 أيام", description: "لمدة 3 أيام، تذكر رحمة الله وأنه يقبل التوبة." },
    fr: { title: "Rappel de miséricorde de 3 jours", description: "Pendant 3 jours, rappelez-vous la miséricorde d'Allah et qu'Il accepte le repentir." }
  },
  'challenge-zina-hopelessness-03': {
    ar: { title: "7 أيام من العودة", description: "لمدة أسبوع، عد إلى الله بالتوبة والاستغفار." },
    fr: { title: "7 jours de retour", description: "Pendant une semaine, revenez à Allah avec repentir et demande de pardon." }
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
    if (remainingTranslations[challenge.id]) {
      const translations = remainingTranslations[challenge.id];
      
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

console.log(`\n✅ Remaining translations update complete! Updated ${totalUpdated} more challenges.`);
console.log(`\n🔍 Now checking for any remaining English text in Arabic translations...`);

// Final check for English text in Arabic translations
files.forEach(file => {
  const filePath = path.join(challengeDir, file);
  const challenges = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  challenges.forEach(challenge => {
    if (challenge.translations?.ar?.title) {
      const arabicTitle = challenge.translations.ar.title;
      const englishWords = ['Day', 'Days', 'Challenge', 'Practice', 'Good', 'Deed', 'Before', 'After', 'One', 'Two', 'Three', 'Week', 'Month', 'Reset', 'Cleanse', 'Fast', 'Watch', 'Tracker', 'Audit'];
      
      if (englishWords.some(word => arabicTitle.includes(word))) {
        console.log(`⚠️  STILL NEEDS TRANSLATION: ${challenge.id} - "${arabicTitle}"`);
      }
    }
  });
});

console.log(`\n🎉 All challenge translations should now be properly localized!`);