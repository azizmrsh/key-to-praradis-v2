import fs from 'fs';

// Key challenges that need Arabic translations (based on screenshots)
const challengeTranslations = {
  'challenge-heart-envy-03': {
    ar: {
      title: "تطهير الحسد لمدة 7 أيام",
      description: "لمدة أسبوع، استبدل كل فكرة حسد بحمد الله أو دعاء إيجابي."
    },
    fr: {
      title: "Nettoyage de l'envie de 7 jours",
      description: "Pendant une semaine, remplacez chaque pensée jalouse par une louange d'Allah ou une prière positive."
    }
  },
  'challenge-ears-gossip-01': {
    ar: {
      title: "أغلق المحتوى",
      description: "لا تستمع أو تنقر على أي محتوى يتضمن دراما أو فضائح أو نميمة مشاهير اليوم."
    },
    fr: {
      title: "Éteignez-le",
      description: "N'écoutez pas ou ne cliquez pas sur du contenu impliquant des drames, des scandales ou des potins de célébrités aujourd'hui."
    }
  },
  'challenge-ears-gossip-02': {
    ar: {
      title: "نظافة الأذن لمدة 3 أيام",
      description: "لمدة 3 أيام، تجنب جميع أشكال الاستماع للنميمة أو الدراما أو الفضائح."
    },
    fr: {
      title: "Nettoyage des oreilles de 3 jours",
      description: "Pendant 3 jours, évitez toutes les formes d'écoute de commérages, de drames ou de scandales."
    }
  }
};

// Update specific files with proper translations
const filesToUpdate = [
  { file: 'client/src/data/challenges/heart.json', challenges: ['challenge-heart-envy-03'] },
  { file: 'client/src/data/challenges/ears.json', challenges: ['challenge-ears-gossip-01', 'challenge-ears-gossip-02'] }
];

filesToUpdate.forEach(({ file, challenges }) => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  let updated = false;
  
  const updatedData = data.map(challenge => {
    if (challenges.includes(challenge.id) && challengeTranslations[challenge.id]) {
      console.log(`Updating ${challenge.id} with proper translations`);
      
      // Update Arabic and French translations
      const translations = challengeTranslations[challenge.id];
      
      if (challenge.translations) {
        if (translations.ar) {
          challenge.translations.ar = translations.ar;
        }
        if (translations.fr) {
          challenge.translations.fr = translations.fr;
        }
      }
      
      updated = true;
    }
    return challenge;
  });
  
  if (updated) {
    fs.writeFileSync(file, JSON.stringify(updatedData, null, 2));
    console.log(`Updated ${file}`);
  }
});

console.log('Key challenge translations updated!');