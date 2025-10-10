import fs from 'fs';

// Add missing difficulty and update Arabic translations for key challenges
const keyTranslations = {
  'challenge-heart-pride-03': {
    difficulty: 'medium',
    ar: {
      title: "7 أيام من المساواة الصادقة",
      description: "لمدة 7 أيام، تعامل مع الجميع كأنهم أفضل منك — داخلياً وخارجياً."
    },
    fr: {
      title: "7 jours d'égalité sincère",
      description: "Pendant 7 jours, traitez tout le monde comme s'il était meilleur que vous — intérieurement et extérieurement."
    }
  },
  'challenge-heart-rancour-01': {
    difficulty: 'easy',
    ar: {
      title: "اتركوا ضغينة واحدة",
      description: "فكر في شخص آذاك. قل 'أسامحهم' لله، حتى لو كان في صمت."
    },
    fr: {
      title: "Laissez partir une rancune",
      description: "Pensez à quelqu'un qui vous a fait du mal. Dites 'Je lui pardonne' pour Allah, même silencieusement."
    }
  },
  'challenge-heart-rancour-02': {
    difficulty: 'medium',
    ar: {
      title: "دعاء للشخص الصعب - 3 أيام",
      description: "كل يوم، ادع دعاء قصير لشخص لا تحبه أو تتجنبه. اطلب الخير له."
    },
    fr: {
      title: "Du'a pour la personne difficile - 3 jours",
      description: "Chaque jour, faites une courte du'a pour quelqu'un que vous n'aimez pas ou évitez. Demandez leur bien."
    }
  },
  'challenge-heart-rancour-03': {
    difficulty: 'hard',
    ar: {
      title: "تطهير الضغينة لمدة 7 أيام",
      description: "لمدة أسبوع، تدرب على التسامح وتطهير قلبك من الضغائن."
    },
    fr: {
      title: "Nettoyage de rancune de 7 jours",
      description: "Pendant une semaine, pratiquez le pardon et purifiez votre cœur des rancunes."
    }
  },
  'challenge-heart-empathy-01': {
    difficulty: 'easy',
    ar: {
      title: "اتصل أو اطمئن على شخص واحد",
      description: "تواصل مع شخص لم تتحدث معه منذ فترة واطمئن عليه."
    },
    fr: {
      title: "Appelez ou prenez des nouvelles d'une personne",
      description: "Contactez quelqu'un avec qui vous n'avez pas parlé depuis longtemps et prenez de ses nouvelles."
    }
  },
  'challenge-heart-empathy-02': {
    difficulty: 'medium',
    ar: {
      title: "عدسة الرحمة - 3 أيام",
      description: "لمدة 3 أيام، انظر إلى كل شخص بعين الرحمة والتفهم."
    },
    fr: {
      title: "Lentille de miséricorde - 3 jours",
      description: "Pendant 3 jours, regardez chaque personne avec miséricorde et compréhension."
    }
  },
  'challenge-pride-advice-02': {
    difficulty: 'medium',
    ar: {
      title: "اطلب التغذية الراجعة - 3 أيام",
      description: "اطلب نصيحة أو تغذية راجعة من شخص تثق به."
    },
    fr: {
      title: "Demandez des commentaires - 3 jours",
      description: "Demandez conseil ou feedback à quelqu'un en qui vous avez confiance."
    }
  },
  'challenge-pride-advice-03': {
    difficulty: 'hard',
    ar: {
      title: "7 أيام من الانفتاح على التصحيح",
      description: "لمدة أسبوع، كن منفتحاً على النقد البناء والتصحيح."
    },
    fr: {
      title: "7 jours d'ouverture à la correction",
      description: "Pendant une semaine, soyez ouvert à la critique constructive et à la correction."
    }
  },
  'challenge-pride-apologize-01': {
    difficulty: 'easy',
    ar: {
      title: "اعتذار صادق واحد",
      description: "قدم اعتذاراً صادقاً لشخص أخطأت في حقه."
    },
    fr: {
      title: "Une excuse sincère",
      description: "Présentez des excuses sincères à quelqu'un envers qui vous avez eu tort."
    }
  }
};

// Update heart.json file with proper translations
const heartFile = 'client/src/data/challenges/heart.json';
const heartData = JSON.parse(fs.readFileSync(heartFile, 'utf8'));

let heartUpdated = false;

const updatedHeartData = heartData.map(challenge => {
  if (keyTranslations[challenge.id]) {
    const translation = keyTranslations[challenge.id];
    
    // Add difficulty if missing
    if (!challenge.difficulty && translation.difficulty) {
      challenge.difficulty = translation.difficulty;
      heartUpdated = true;
    }
    
    // Update translations
    if (challenge.translations) {
      if (translation.ar) {
        challenge.translations.ar = translation.ar;
        heartUpdated = true;
      }
      if (translation.fr) {
        challenge.translations.fr = translation.fr;
        heartUpdated = true;
      }
    }
    
    console.log(`Updated ${challenge.id} with Arabic and French translations`);
  }
  
  return challenge;
});

if (heartUpdated) {
  fs.writeFileSync(heartFile, JSON.stringify(updatedHeartData, null, 2));
  console.log('Updated heart.json with proper translations');
}

// Update pride.json file with proper translations
const prideFile = 'client/src/data/challenges/pride.json';
const prideData = JSON.parse(fs.readFileSync(prideFile, 'utf8'));

let prideUpdated = false;

const updatedPrideData = prideData.map(challenge => {
  if (keyTranslations[challenge.id]) {
    const translation = keyTranslations[challenge.id];
    
    // Add difficulty if missing
    if (!challenge.difficulty && translation.difficulty) {
      challenge.difficulty = translation.difficulty;
      prideUpdated = true;
    }
    
    // Update translations
    if (challenge.translations) {
      if (translation.ar) {
        challenge.translations.ar = translation.ar;
        prideUpdated = true;
      }
      if (translation.fr) {
        challenge.translations.fr = translation.fr;
        prideUpdated = true;
      }
    }
    
    console.log(`Updated ${challenge.id} with Arabic and French translations`);
  }
  
  return challenge;
});

if (prideUpdated) {
  fs.writeFileSync(prideFile, JSON.stringify(updatedPrideData, null, 2));
  console.log('Updated pride.json with proper translations');
}

console.log('Key challenge translations updated!');