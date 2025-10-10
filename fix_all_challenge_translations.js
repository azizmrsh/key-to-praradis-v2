import fs from 'fs';
import path from 'path';

// Comprehensive Arabic and French translations for all challenges
const challengeTranslations = {
  // Heart challenges
  'challenge-heart-empathy-03': {
    ar: { title: "ممارسة الرحمة لمدة 7 أيام", description: "ساعد أو أظهر التعاطف مع شخص جديد كل يوم. اكتب ما شعرت به." },
    fr: { title: "Pratique de compassion de 7 jours", description: "Aidez activement ou montrez de l'empathie envers quelqu'un de nouveau chaque jour. Notez ce que vous avez ressenti." }
  },
  'challenge-heart-riya-01': {
    ar: { title: "اخف عملاً صالحاً", description: "اليوم، افعل شيئاً خالصاً لله لا يعرفه أحد. احتفظ بسريته." },
    fr: { title: "Cacher une bonne action", description: "Aujourd'hui, faites quelque chose purement pour Allah que personne ne connaît. Gardez-le secret." }
  },
  'challenge-heart-riya-02': {
    ar: { title: "دعاء قبل الأعمال - 3 أيام", description: "اجعل النية والدعاء للإخلاص قبل كل عمل عبادة لمدة 3 أيام." },
    fr: { title: "Du'a avant les actes - 3 jours", description: "Faites l'intention et la du'a pour la sincérité avant chaque acte d'adoration pendant 3 jours." }
  },
  'challenge-heart-riya-03': {
    ar: { title: "7 أيام من النية المطهرة", description: "قل 'هذا لك يا الله' قبل كل عمل عام أو مرئي لمدة أسبوع." },
    fr: { title: "7 jours d'intention purifiée", description: "Dites 'C'est pour Vous, ô Allah' avant chaque action publique ou visible pendant une semaine." }
  },
  'challenge-heart-despair-01': {
    ar: { title: "اقرأ آية رحمة واحدة", description: "اقرأ آية واحدة عن رحمة الله. تأمل في معناها وتذكر أن الله غفور رحيم." },
    fr: { title: "Lire un verset de miséricorde", description: "Lisez un verset sur la miséricorde d'Allah. Réfléchissez à sa signification et rappelez-vous qu'Allah est Pardonneur et Miséricordieux." }
  },
  'challenge-heart-despair-02': {
    ar: { title: "دعاء الأمل - 3 أيام", description: "لمدة 3 أيام، ادع دعاء الأمل والتوبة كل صباح." },
    fr: { title: "Du'a d'espoir - 3 jours", description: "Pendant 3 jours, faites une du'a d'espoir et de repentir chaque matin." }
  },
  'challenge-heart-despair-03': {
    ar: { title: "7 أيام من ممارسة الأمل", description: "لمدة أسبوع، اذكر نفسك يومياً بأن الله يحب التوابين." },
    fr: { title: "7 jours de pratique d'espoir", description: "Pendant une semaine, rappelez-vous quotidiennement qu'Allah aime ceux qui se repentent." }
  },
  'challenge-heart-hereafter-01': {
    ar: { title: "تأمل في الموت", description: "اقض 10 دقائق في تذكر الموت والآخرة. كيف سيؤثر ذلك على أولوياتك؟" },
    fr: { title: "Réfléchir à la mort", description: "Passez 10 minutes à vous rappeler la mort et l'au-delà. Comment cela affectera-t-il vos priorités?" }
  },
  'challenge-heart-hereafter-02': {
    ar: { title: "تركيز الآخرة لمدة 3 أيام", description: "لمدة 3 أيام، اسأل نفسك: 'هل هذا ينفعني في الآخرة؟' قبل كل قرار." },
    fr: { title: "Focus sur l'au-delà - 3 jours", description: "Pendant 3 jours, demandez-vous: 'Est-ce que cela me profite dans l'au-delà?' avant chaque décision." }
  },
  'challenge-heart-hereafter-03': {
    ar: { title: "7 أيام من ممارسة الوعي بالموت", description: "لمدة أسبوع، اجعل تذكر الموت جزءاً من روتينك اليومي." },
    fr: { title: "7 jours de pratique de conscience de la mort", description: "Pendant une semaine, faites du rappel de la mort une partie de votre routine quotidienne." }
  },

  // Eyes challenges
  'challenge-eyes-lustful-01': {
    ar: { title: "غض البصر لمدة يوم واحد", description: "اليوم، اغضض بصرك فور رؤية أي شيء حرام. لا تنظر مرة ثانية." },
    fr: { title: "Baisser le regard pour un jour", description: "Aujourd'hui, baissez votre regard dès que vous voyez quelque chose d'illicite. Ne regardez pas une seconde fois." }
  },
  'challenge-eyes-lustful-02': {
    ar: { title: "أسبوع غض البصر", description: "لمدة 7 أيام، مارس غض البصر عن كل ما هو حرام باستمرار." },
    fr: { title: "Semaine de baissement du regard", description: "Pendant 7 jours, pratiquez constamment le fait de baisser le regard de tout ce qui est illicite." }
  },
  'challenge-eyes-lustful-03': {
    ar: { title: "14 يوماً من تطهير النظر", description: "لمدة أسبوعين، تجنب النظر إلى أي محتوى يثير الشهوة." },
    fr: { title: "14 jours de purification du regard", description: "Pendant deux semaines, évitez de regarder tout contenu qui éveille la luxure." }
  },
  'challenge-eyes-prolonged-01': {
    ar: { title: "تجنب النظر الطويل", description: "اليوم، تجنب النظر الطويل إلى الأشخاص. انظر واصرف بصرك." },
    fr: { title: "Éviter le regard prolongé", description: "Aujourd'hui, évitez de regarder longuement les gens. Regardez et détournez votre regard." }
  },
  'challenge-eyes-prolonged-02': {
    ar: { title: "أسبوع من النظر المحترم", description: "لمدة 7 أيام، تدرب على النظر المحترم والمناسب فقط." },
    fr: { title: "Semaine de regard respectueux", description: "Pendant 7 jours, pratiquez seulement un regard respectueux et approprié." }
  },
  'challenge-eyes-prolonged-03': {
    ar: { title: "14 يوماً من انضباط النظر", description: "لمدة أسبوعين، اتقن فن النظر المحترم والمناسب." },
    fr: { title: "14 jours de discipline du regard", description: "Pendant deux semaines, maîtrisez l'art du regard respectueux et approprié." }
  },
  'challenge-eyes-images-01': {
    ar: { title: "يوم بلا صور محرمة", description: "اليوم، تجنب النظر إلى أي صور أو مقاطع فيديو غير لائقة." },
    fr: { title: "Jour sans images interdites", description: "Aujourd'hui, évitez de regarder des images ou vidéos inappropriées." }
  },
  'challenge-eyes-images-02': {
    ar: { title: "تطهير بصري لمدة 7 أيام", description: "تجنب وسائل التواصل الاجتماعي أو الأفلام أو الإعلانات التي تعرض الفحش أو تمجد الخطيئة." },
    fr: { title: "Désintoxication visuelle de 7 jours", description: "Évitez les médias sociaux, les films ou les publicités qui affichent l'indécence ou glorifient le péché." }
  },
  'challenge-eyes-images-03': {
    ar: { title: "صوم وسائل الإعلام المطهرة لمدة 14 يوماً", description: "لمدة أسبوعين، تجنب بنشاط كل تعرض للمحتوى البصري الحرام." },
    fr: { title: "Jeûne médiatique de pureté de 14 jours", description: "Pendant 2 semaines, évitez activement toute exposition au contenu visuel haram." }
  },
  'challenge-eyes-envy-01': {
    ar: { title: "تصفح بلا حسد", description: "اليوم، تصفح وسائل التواصل دون أن تشعر بالحسد. احمد الله على نعمه." },
    fr: { title: "Naviguer sans jalousie", description: "Aujourd'hui, naviguez sur les réseaux sociaux sans ressentir de jalousie. Remerciez Allah pour Ses bienfaits." }
  },
  'challenge-eyes-envy-02': {
    ar: { title: "7 أيام بلا مقارنة", description: "لمدة أسبوع، تجنب مقارنة نفسك بالآخرين بصرياً." },
    fr: { title: "7 jours sans comparaison", description: "Pendant une semaine, évitez de vous comparer visuellement aux autres." }
  },
  'challenge-eyes-envy-03': {
    ar: { title: "تطهير المقارنة لمدة 14 يوماً", description: "لمدة أسبوعين، تدرب على الامتنان بدلاً من المقارنة." },
    fr: { title: "Nettoyage de comparaison de 14 jours", description: "Pendant deux semaines, pratiquez la gratitude au lieu de la comparaison." }
  },
  'challenge-eyes-staring-01': {
    ar: { title: "تحدي العيون المؤدبة", description: "اليوم، تجنب التحديق في الناس. انظر بأدب واحترام." },
    fr: { title: "Défi des yeux polis", description: "Aujourd'hui, évitez de fixer les gens. Regardez avec politesse et respect." }
  },
  'challenge-eyes-staring-02': {
    ar: { title: "أسبوع بلا تحديق", description: "لمدة 7 أيام، تدرب على النظر المحترم دون تحديق." },
    fr: { title: "Semaine sans fixation", description: "Pendant 7 jours, pratiquez le regard respectueux sans fixer." }
  },
  'challenge-eyes-staring-03': {
    ar: { title: "احترم مساحة الآخرين", description: "لمدة أسبوعين، احترم الحدود البصرية للآخرين." },
    fr: { title: "Respecter l'espace des autres", description: "Pendant deux semaines, respectez les limites visuelles des autres." }
  },
  'challenge-eyes-prayer-01': {
    ar: { title: "صلاة واحدة مركزة", description: "اليوم، صل صلاة واحدة بتركيز كامل، غاضاً بصرك عن كل ما يلهي." },
    fr: { title: "Une prière concentrée", description: "Aujourd'hui, priez une prière avec une concentration totale, en détournant votre regard de toute distraction." }
  },
  'challenge-eyes-prayer-02': {
    ar: { title: "ضبط العين في الصلاة - 7 أيام", description: "لمدة 7 أيام، تدرب على التركيز البصري في كل صلاة." },
    fr: { title: "Contrôle des yeux en prière - 7 jours", description: "Pendant 7 jours, pratiquez la concentration visuelle dans chaque prière." }
  },
  'challenge-eyes-prayer-03': {
    ar: { title: "14 يوماً من انضباط النظر في الصلاة", description: "لمدة أسبوعين، اتقن التركيز البصري في الصلاة." },
    fr: { title: "14 jours de discipline du regard en prière", description: "Pendant deux semaines, maîtrisez la concentration visuelle en prière." }
  },

  // Ears challenges
  'challenge-ears-backbiting-01': {
    ar: { title: "أوقف النميمة", description: "اليوم، إذا سمعت نميمة، قل 'لا أريد أن أسمع هذا' أو اتركهم." },
    fr: { title: "Arrêter les commérages", description: "Aujourd'hui, si vous entendez des commérages, dites 'Je ne veux pas entendre cela' ou quittez-les." }
  },
  'challenge-ears-backbiting-02': {
    ar: { title: "تطهير الأذن لمدة 3 أيام", description: "لمدة 3 أيام، تجنب الاستماع إلى النميمة أو الغيبة." },
    fr: { title: "Nettoyage des oreilles de 3 jours", description: "Pendant 3 jours, évitez d'écouter les commérages ou la médisance." }
  },
  'challenge-ears-backbiting-03': {
    ar: { title: "7 أيام من الاستماع المطهر", description: "لمدة أسبوع، استمع فقط إلى ما هو مفيد وإيجابي." },
    fr: { title: "7 jours d'écoute purifiée", description: "Pendant une semaine, écoutez seulement ce qui est utile et positif." }
  },
  'challenge-ears-gossip-01': {
    ar: { title: "أغلق المحتوى", description: "لا تستمع أو تنقر على أي محتوى يتضمن دراما أو فضائح أو نميمة مشاهير اليوم." },
    fr: { title: "Éteignez-le", description: "N'écoutez pas ou ne cliquez pas sur du contenu impliquant des drames, des scandales ou des potins de célébrités aujourd'hui." }
  },
  'challenge-ears-gossip-02': {
    ar: { title: "نظافة الأذن لمدة 3 أيام", description: "لمدة 3 أيام، تجنب جميع أشكال الاستماع للنميمة أو الدراما أو الفضائح." },
    fr: { title: "Nettoyage des oreilles de 3 jours", description: "Pendant 3 jours, évitez toutes les formes d'écoute de commérages, de drames ou de scandales." }
  },
  'challenge-ears-gossip-03': {
    ar: { title: "14 يوماً من حراسة الشرف", description: "لمدة أسبوعين، كن حارساً للشرف ولا تستمع لما يضر بسمعة الآخرين." },
    fr: { title: "14 jours de garde d'honneur", description: "Pendant deux semaines, soyez un gardien de l'honneur et n'écoutez pas ce qui nuit à la réputation des autres." }
  },
  'challenge-ears-harmful-01': {
    ar: { title: "تجنب الكلام الضار", description: "اليوم، تجنب الاستماع إلى أي كلام يضر بك أو بالآخرين." },
    fr: { title: "Éviter les paroles nuisibles", description: "Aujourd'hui, évitez d'écouter toute parole qui vous nuit ou nuit aux autres." }
  },
  'challenge-ears-harmful-02': {
    ar: { title: "مساحة خالية من الضرر لمدة 3 أيام", description: "لمدة 3 أيام، اخلق مساحة خالية من الكلام الضار." },
    fr: { title: "Espace sans dommage de 3 jours", description: "Pendant 3 jours, créez un espace exempt de paroles nuisibles." }
  },
  'challenge-ears-harmful-03': {
    ar: { title: "7 أيام من الاستماع بكرامة", description: "لمدة أسبوع، استمع فقط لما يحفظ كرامتك وكرامة الآخرين." },
    fr: { title: "7 jours d'écoute avec dignité", description: "Pendant une semaine, écoutez seulement ce qui préserve votre dignité et celle des autres." }
  },
  'challenge-ears-inappropriate-01': {
    ar: { title: "كتم الألفاظ النابية", description: "اليوم، تجنب الاستماع إلى الموسيقى أو المحتوى ذي الكلمات النابية." },
    fr: { title: "Couper la vulgarité", description: "Aujourd'hui, évitez d'écouter de la musique ou du contenu avec des mots vulgaires." }
  },
  'challenge-ears-inappropriate-02': {
    ar: { title: "تطهير الصوت لمدة 7 أيام", description: "لمدة أسبوع، تجنب كل المحتوى الصوتي غير اللائق." },
    fr: { title: "Purification sonore de 7 jours", description: "Pendant une semaine, évitez tout contenu audio inapproprié." }
  },
  'challenge-ears-inappropriate-03': {
    ar: { title: "تغذية نظيفة لمدة 14 يوماً", description: "لمدة أسبوعين، استمع فقط إلى المحتوى الطاهر والمفيد." },
    fr: { title: "Alimentation propre de 14 jours", description: "Pendant deux semaines, écoutez seulement du contenu pur et utile." }
  },
  'challenge-ears-eavesdrop-01': {
    ar: { title: "احترم الحدود", description: "اليوم، تجنب الاستماع إلى المحادثات الخاصة. احترم خصوصية الآخرين." },
    fr: { title: "Respecter les limites", description: "Aujourd'hui, évitez d'écouter les conversations privées. Respectez l'intimité des autres." }
  },
  'challenge-ears-eavesdrop-02': {
    ar: { title: "آذان الثقة لمدة 3 أيام", description: "لمدة 3 أيام، كن أهلاً للثقة في ما تسمعه." },
    fr: { title: "Oreilles de confiance de 3 jours", description: "Pendant 3 jours, soyez digne de confiance dans ce que vous entendez." }
  },
  'challenge-ears-eavesdrop-03': {
    ar: { title: "صوم التجسس لمدة 7 أيام", description: "لمدة أسبوع، تجنب التجسس على المحادثات الخاصة." },
    fr: { title: "Jeûne d'espionnage de 7 jours", description: "Pendant une semaine, évitez d'espionner les conversations privées." }
  },
  'challenge-ears-defend-01': {
    ar: { title: "قل كلمة طيبة واحدة", description: "اليوم، دافع عن شخص غائب بكلمة طيبة واحدة." },
    fr: { title: "Dire un bon mot", description: "Aujourd'hui, défendez une personne absente avec un bon mot." }
  },
  'challenge-ears-defend-02': {
    ar: { title: "صوت الشرف - 3 أيام", description: "لمدة 3 أيام، كن صوتاً للشرف والدفاع عن الغائبين." },
    fr: { title: "Voix d'honneur - 3 jours", description: "Pendant 3 jours, soyez une voix d'honneur et défendez les absents." }
  },
  'challenge-ears-defend-03': {
    ar: { title: "مدافع الشرف لمدة 14 يوماً", description: "لمدة أسبوعين، كن مدافعاً ثابتاً عن شرف الآخرين." },
    fr: { title: "Défenseur d'honneur de 14 jours", description: "Pendant deux semaines, soyez un défenseur constant de l'honneur des autres." }
  },
  'challenge-ears-beneficial-01': {
    ar: { title: "حديث واحد، تأمل واحد", description: "اليوم، استمع إلى حديث واحد وتأمل في معناه." },
    fr: { title: "Un hadith, une réflexion", description: "Aujourd'hui, écoutez un hadith et réfléchissez à sa signification." }
  },
  'challenge-ears-beneficial-02': {
    ar: { title: "تغذية الحكمة لمدة 7 أيام", description: "لمدة أسبوع، استمع يومياً إلى محتوى إسلامي مفيد." },
    fr: { title: "Alimentation de sagesse de 7 jours", description: "Pendant une semaine, écoutez quotidiennement du contenu islamique utile." }
  },
  'challenge-ears-beneficial-03': {
    ar: { title: "عادة التعلم الصوتي لمدة 14 يوماً", description: "لمدة أسبوعين، اجعل الاستماع للعلم النافع عادة يومية." },
    fr: { title: "Habitude d'apprentissage audio de 14 jours", description: "Pendant deux semaines, faites de l'écoute de la connaissance utile une habitude quotidienne." }
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
    if (challengeTranslations[challenge.id]) {
      const translations = challengeTranslations[challenge.id];
      
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
    
    // Check if Arabic translation is still in English (contains common English words)
    if (challenge.translations?.ar?.title) {
      const arabicTitle = challenge.translations.ar.title;
      const englishWords = ['Day', 'Days', 'Challenge', 'Practice', 'Good', 'Deed', 'Before', 'After', 'One', 'Two', 'Three', 'Week', 'Month'];
      
      if (englishWords.some(word => arabicTitle.includes(word))) {
        console.log(`⚠️  WARNING: ${challenge.id} still has English in Arabic: "${arabicTitle}"`);
      }
    }
    
    return challenge;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(updatedChallenges, null, 2));
    console.log(`📝 Updated ${file}`);
  }
});

console.log(`\n✅ Translation update complete! Updated ${totalUpdated} challenges.`);