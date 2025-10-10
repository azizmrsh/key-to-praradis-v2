import { SinCategory } from './selfAssessmentData';

export interface ContentLesson {
  id: string;
  title: string;
  duration: number; // in minutes
  coreMessage: string;
  content: {
    introduction: string;
    keyPoints: string[];
    practicalSteps: string[];
    reflection: string;
    quranicReference?: {
      verse: string;
      translation: string;
      reference: string;
    };
    hadithReference?: {
      text: string;
      narrator: string;
      source: string;
    };
  };
  tags: string[];
  order: number;
}

export interface AudioContent {
  id: string;
  title: string;
  type: 'dhikr' | 'talk' | 'recitation';
  duration: number;
  audioFile?: string; // local file path
  transcript?: string;
  benefits: string[];
}

export interface CategoryContent {
  id: SinCategory;
  title: string;
  description: string;
  overview: {
    islamicPerspective: string;
    commonCauses: string[];
    spiritualConsequences: string[];
    pathToRecovery: string[];
  };
  lessons: ContentLesson[];
  audioContent: AudioContent[];
  videoLinks: {
    id: string;
    title: string;
    url: string;
    description: string;
    duration: number;
  }[];
  milestones: {
    lessonCount: number;
    title: string;
    description: string;
    badge: string;
  }[];
}

// Content Repository - Structured content for all sin categories
export const contentRepository: Record<SinCategory, CategoryContent> = {
  tongue: {
    id: 'tongue',
    title: 'Sins of the Tongue',
    description: 'Mastering speech and cultivating beneficial communication',
    overview: {
      islamicPerspective: 'The tongue is a powerful tool that can either elevate us spiritually or lead us astray. The Prophet (peace be upon him) said: "Whoever believes in Allah and the Last Day should speak good or keep silent."',
      commonCauses: [
        'Lack of mindfulness in speech',
        'Desire to fit in or impress others',
        'Anger and emotional reactions',
        'Boredom and idle time',
        'Pride and jealousy'
      ],
      spiritualConsequences: [
        'Distance from Allah\'s mercy',
        'Damaged relationships',
        'Loss of barakah in speech',
        'Hardening of the heart',
        'Accountability on the Day of Judgment'
      ],
      pathToRecovery: [
        'Constant remembrance of Allah (dhikr)',
        'Seeking forgiveness (istighfar)',
        'Practical speech exercises',
        'Increasing beneficial knowledge',
        'Building positive speech habits'
      ]
    },
    lessons: [
      {
        id: 'tongue_lesson_1',
        title: 'The Weight of Words in Islam',
        duration: 8,
        coreMessage: 'Understanding the spiritual significance of speech in Islamic teachings',
        content: {
          introduction: 'Every word we speak carries weight in the sight of Allah. Our speech can be a source of immense reward or grave punishment.',
          keyPoints: [
            'Speech is recorded by the noble scribes (Kiraman Katibin)',
            'A single word can determine paradise or hellfire',
            'The tongue is the translator of the heart',
            'Righteous speech is a form of charity (sadaqah)'
          ],
          practicalSteps: [
            'Before speaking, pause and consider: Is it true, necessary, and kind?',
            'Practice the prophetic formula: "If it is good, speak; if not, remain silent"',
            'Make abundant dhikr to purify your tongue',
            'Seek Allah\'s protection from harmful speech each morning'
          ],
          reflection: 'Reflect on a recent conversation. How could you have made your speech more pleasing to Allah? What words brought you closer to Him, and which ones may have distanced you?'
        },
        tags: ['foundation', 'speech', 'accountability'],
        order: 1
      },
      {
        id: 'tongue_lesson_2',
        title: 'The Disease of Backbiting (Ghiba)',
        duration: 10,
        coreMessage: 'Understanding and overcoming the destructive habit of speaking ill of others',
        content: {
          introduction: 'Backbiting is mentioned in the Quran as eating the flesh of your dead brother - a vivid imagery that shows its spiritual ugliness.',
          keyPoints: [
            'Ghiba destroys good deeds like fire consumes wood',
            'It harms the speaker more than the subject',
            'Even true statements can be backbiting',
            'Listening to backbiting is equally sinful'
          ],
          practicalSteps: [
            'When others begin backbiting, redirect the conversation or leave',
            'Make dua for the person being discussed',
            'Practice the "3 excuses" rule - find three possible excuses for their behavior',
            'If you must address someone\'s faults, do so privately and constructively'
          ],
          reflection: 'Think of someone you may have spoken about negatively. Make sincere tawbah and consider reaching out to ask for their forgiveness.',
          quranicReference: {
            verse: 'O you who believe! Avoid much suspicion, indeed some suspicions are sins. And spy not, neither backbite one another. Would one of you like to eat the flesh of his dead brother? You would hate it. And fear Allah. Verily, Allah is the One Who forgives and accepts repentance, Most Merciful.',
            translation: 'Quran 49:12',
            reference: 'Surah Al-Hujurat, Verse 12'
          }
        },
        tags: ['ghiba', 'backbiting', 'purification'],
        order: 2
      },
      {
        id: 'tongue_lesson_3',
        title: 'Transforming Gossip into Beneficial Speech',
        duration: 7,
        coreMessage: 'Replacing idle talk with speech that benefits this life and the hereafter',
        content: {
          introduction: 'Instead of filling our tongues with harmful gossip, we can train ourselves to speak words that bring light and benefit to all.',
          keyPoints: [
            'Every conversation is an opportunity for spiritual growth',
            'Beneficial speech includes dhikr, knowledge sharing, and encouragement',
            'Speaking good of others increases their good deeds in your scale',
            'Silence is often the safest choice'
          ],
          practicalSteps: [
            'Start conversations with "Bismillah" and end with "Alhamdulillah"',
            'Share one piece of beneficial Islamic knowledge daily',
            'Compliment others genuinely and specifically',
            'When in doubt, choose silence and dhikr'
          ],
          reflection: 'What beneficial topics could you discuss instead of gossip? How can you become someone others trust with their secrets?'
        },
        tags: ['beneficial-speech', 'transformation', 'habits'],
        order: 3
      },
      {
        id: 'tongue_lesson_4',
        title: 'The Healing Power of Istighfar',
        duration: 6,
        coreMessage: 'Using seeking forgiveness as medicine for the tongue and heart',
        content: {
          introduction: 'Istighfar is not just about seeking forgiveness - it\'s a powerful tool for spiritual purification and protection.',
          keyPoints: [
            'Regular istighfar cleanses the heart and tongue',
            'It brings barakah and opens doors of sustenance',
            'Istighfar protects from the evil consequences of our words',
            'It\'s the practice of all prophets and righteous people'
          ],
          practicalSteps: [
            'Recite "Astaghfirullah" 100 times daily',
            'Use the comprehensive istighfar of Sayyid al-Istighfar',
            'Seek forgiveness immediately after any harmful speech',
            'Make it a habit before and after every conversation'
          ],
          reflection: 'How has seeking forgiveness changed your relationship with Allah? What barriers does istighfar help you break through?',
          hadithReference: {
            text: 'Whoever persists in seeking forgiveness, Allah will grant him relief from every distress and a way out from every tight spot, and will provide for him from where he least expects.',
            narrator: 'Ibn Abbas',
            source: 'Abu Dawud'
          }
        },
        tags: ['istighfar', 'forgiveness', 'purification'],
        order: 4
      },
      {
        id: 'tongue_lesson_5',
        title: 'Building Prophetic Speech Habits',
        duration: 9,
        coreMessage: 'Adopting the beautiful speech characteristics of Prophet Muhammad (peace be upon him)',
        content: {
          introduction: 'The Prophet\'s speech was a reflection of his noble character. By following his example, we can transform our own communication.',
          keyPoints: [
            'The Prophet spoke with deliberation and clarity',
            'He never spoke unnecessarily or harmfully',
            'His words were always truthful and beneficial',
            'He used gentle speech even when correcting others'
          ],
          practicalSteps: [
            'Speak slowly and clearly, giving weight to your words',
            'Use the Prophet\'s frequent phrases: "BarakAllahu feeki", "Jazakallahu khair"',
            'Practice giving advice with wisdom and gentleness',
            'Always begin with praising Allah and sending salawat'
          ],
          reflection: 'In what ways can you make your speech more prophetic? Which of the Prophet\'s speech habits resonates most with your current needs?'
        },
        tags: ['prophetic-example', 'character', 'habits'],
        order: 5
      }
    ],
    audioContent: [
      {
        id: 'tongue_dhikr_1',
        title: 'Morning Tongue Protection',
        type: 'dhikr',
        duration: 5,
        transcript: 'Allahumma ahfaz lisani min kulli ma la yardika...',
        benefits: [
          'Protects tongue from harmful speech',
          'Increases mindfulness in communication',
          'Brings barakah to daily conversations'
        ]
      },
      {
        id: 'tongue_talk_1',
        title: 'The Etiquette of Islamic Speech',
        type: 'talk',
        duration: 15,
        benefits: [
          'Learn prophetic communication principles',
          'Understand the spiritual dimensions of speech',
          'Practical tips for daily implementation'
        ]
      }
    ],
    videoLinks: [
      {
        id: 'tongue_video_1',
        title: 'The Power of Words in Islam',
        url: 'https://youtube.com/watch?v=example1',
        description: 'Comprehensive lecture on Islamic speech etiquette',
        duration: 25
      }
    ],
    milestones: [
      {
        lessonCount: 5,
        title: 'Speech Guardian',
        description: 'Completed foundational lessons on controlling the tongue',
        badge: '🛡️'
      },
      {
        lessonCount: 10,
        title: 'Word Master',
        description: 'Advanced understanding of beneficial speech',
        badge: '💎'
      }
    ]
  },

  // Similar structure for other categories - adding basic structure for now
  eyes: {
    id: 'eyes',
    title: 'Sins of the Eyes',
    description: 'Protecting your vision and cultivating pure sight',
    overview: {
      islamicPerspective: 'The eyes are the windows to the soul. Controlling what we look at is fundamental to maintaining spiritual purity.',
      commonCauses: ['Unrestricted media consumption', 'Lack of mindful looking', 'Social media addiction'],
      spiritualConsequences: ['Hardening of the heart', 'Loss of spiritual focus', 'Increased desires'],
      pathToRecovery: ['Lowering the gaze', 'Purifying media consumption', 'Increasing dhikr']
    },
    lessons: [],
    audioContent: [],
    videoLinks: [],
    milestones: []
  },

  ears: {
    id: 'ears',
    title: 'Sins of the Ears',
    description: 'Guarding what you listen to and cultivating beneficial hearing',
    overview: {
      islamicPerspective: 'What we listen to shapes our hearts and minds. Protecting our ears from harmful content is essential for spiritual growth.',
      commonCauses: ['Inappropriate music', 'Listening to gossip', 'Harmful podcasts'],
      spiritualConsequences: ['Distraction from dhikr', 'Normalized sin', 'Weakened faith'],
      pathToRecovery: ['Selecting beneficial audio', 'Increasing Quran recitation', 'Mindful listening']
    },
    lessons: [],
    audioContent: [],
    videoLinks: [],
    milestones: []
  },

  pride: {
    id: 'pride',
    title: 'Pride and Arrogance',
    description: 'Overcoming pride and cultivating true humility',
    overview: {
      islamicPerspective: 'Pride is the first sin that led to Iblis\'s downfall. Humility is the path to Allah\'s mercy.',
      commonCauses: ['Academic achievements', 'Wealth and status', 'Religious knowledge without practice'],
      spiritualConsequences: ['Distance from Allah', 'Broken relationships', 'Spiritual blindness'],
      pathToRecovery: ['Regular self-reflection', 'Serving others', 'Remembering death']
    },
    lessons: [],
    audioContent: [],
    videoLinks: [],
    milestones: []
  },

  stomach: {
    id: 'stomach',
    title: 'Sins of the Stomach',
    description: 'Controlling appetite and practicing mindful consumption',
    overview: {
      islamicPerspective: 'Moderation in eating and drinking is a prophetic practice that brings physical and spiritual benefits.',
      commonCauses: ['Overeating', 'Eating forbidden foods', 'Lack of gratitude'],
      spiritualConsequences: ['Spiritual lethargy', 'Weakened worship', 'Distance from fasting benefits'],
      pathToRecovery: ['Prophetic eating habits', 'Regular fasting', 'Gratitude practices']
    },
    lessons: [],
    audioContent: [],
    videoLinks: [],
    milestones: []
  },

  zina: {
    id: 'zina',
    title: 'Protection from Zina',
    description: 'Maintaining chastity and spiritual purity',
    overview: {
      islamicPerspective: 'Protecting oneself from zina and its pathways is a fundamental aspect of Islamic morality.',
      commonCauses: ['Inappropriate relationships', 'Uncontrolled desires', 'Weak boundaries'],
      spiritualConsequences: ['Major sin consequences', 'Loss of spiritual light', 'Damaged soul'],
      pathToRecovery: ['Strong boundaries', 'Beneficial marriage', 'Increased worship']
    },
    lessons: [],
    audioContent: [],
    videoLinks: [],
    milestones: []
  },

  heart: {
    id: 'heart',
    title: 'Sins of the Heart',
    description: 'Purifying the heart from envy, hatred, and spiritual diseases',
    overview: {
      islamicPerspective: 'The heart is the center of faith. Purifying it from spiritual diseases is the key to closeness with Allah.',
      commonCauses: ['Envy and jealousy', 'Hatred and resentment', 'Spiritual pride'],
      spiritualConsequences: ['Loss of faith clarity', 'Damaged relationships', 'Spiritual darkness'],
      pathToRecovery: ['Heart purification practices', 'Forgiveness work', 'Increased love for Allah']
    },
    lessons: [],
    audioContent: [],
    videoLinks: [],
    milestones: []
  }
};

// Helper functions for content delivery
export const getContentByCategory = (category: SinCategory): CategoryContent => {
  return contentRepository[category];
};

export const getLessonsByCategory = (category: SinCategory): ContentLesson[] => {
  return contentRepository[category].lessons;
};

export const getNextLesson = (category: SinCategory, completedLessons: string[]): ContentLesson | null => {
  const lessons = contentRepository[category].lessons;
  const nextLesson = lessons.find(lesson => !completedLessons.includes(lesson.id));
  return nextLesson || null;
};

export const getCategoryProgress = (category: SinCategory, completedLessons: string[]): {
  completed: number;
  total: number;
  percentage: number;
} => {
  const total = contentRepository[category].lessons.length;
  const completed = completedLessons.filter(lessonId => 
    contentRepository[category].lessons.some(lesson => lesson.id === lessonId)
  ).length;
  
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};