import { SinCategory } from '@/data/selfAssessmentData';
import { ChallengeType, ChallengeCompletionLogic } from '@/lib/challengeService';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  sinCategory: SinCategory;
  type: ChallengeType;
  duration: number; // in days
  completionLogic: ChallengeCompletionLogic;
  targetCount?: number;
  motivationalQuote: string;
  badgeIcon: string;
  seasonalStartDate?: string; // MM-DD format
  seasonalEndDate?: string; // MM-DD format
}

// Comprehensive challenge repository organized by sin category
export const challengeTemplates: ChallengeTemplate[] = [
  // TONGUE CHALLENGES
  {
    id: 'tongue-mindful-speech-1day',
    title: 'Mindful Speech (1 Day)',
    description: 'Practice speaking only with intention and kindness for one full day.',
    icon: '🗣️',
    sinCategory: 'tongue',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'The believer is not one who eats his fill while his neighbor goes hungry. - Prophet Muhammad (PBUH)',
    badgeIcon: '🎯'
  },
  {
    id: 'tongue-no-gossip-7days',
    title: '7 Days Without Gossip',
    description: 'Completely avoid speaking about others behind their backs for a full week.',
    icon: '🤐',
    sinCategory: 'tongue',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'Whoever believes in Allah and the Last Day should speak good or keep quiet. - Prophet Muhammad (PBUH)',
    badgeIcon: '🏆'
  },
  {
    id: 'tongue-no-backbiting-40days',
    title: '40 Days of Pure Speech',
    description: 'Master the art of pure speech - no backbiting, slander, or harmful words for 40 days.',
    icon: '💎',
    sinCategory: 'tongue',
    type: 'habit',
    duration: 40,
    completionLogic: 'streak',
    motivationalQuote: 'The tongue is a small part of the body, but it makes great boasts. - Islamic wisdom',
    badgeIcon: '👑'
  },
  {
    id: 'tongue-positive-words-7days',
    title: 'Week of Positive Words',
    description: 'Speak only positive, encouraging words to others for 7 consecutive days.',
    icon: '🌟',
    sinCategory: 'tongue',
    type: 'habit',
    duration: 7,
    completionLogic: 'count',
    targetCount: 7,
    motivationalQuote: 'A good word is charity. - Prophet Muhammad (PBUH)',
    badgeIcon: '⭐'
  },

  // EYES CHALLENGES
  {
    id: 'eyes-lower-gaze-1day',
    title: 'Mindful Gaze (1 Day)',
    description: 'Practice lowering your gaze and being mindful of what you look at for one day.',
    icon: '👁️',
    sinCategory: 'eyes',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'Lower your gaze and guard your private parts. - Quran 24:30',
    badgeIcon: '🛡️'
  },
  {
    id: 'eyes-avoid-haram-content-7days',
    title: '7 Days of Pure Viewing',
    description: 'Avoid all inappropriate visual content online and offline for a full week.',
    icon: '🚫',
    sinCategory: 'eyes',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'The gaze is a poisoned arrow of Satan. - Prophet Muhammad (PBUH)',
    badgeIcon: '🏅'
  },
  {
    id: 'eyes-beneficial-content-30days',
    title: '30 Days of Beneficial Learning',
    description: 'Only consume educational, spiritual, or beneficial visual content for 30 days.',
    icon: '📚',
    sinCategory: 'eyes',
    type: 'habit',
    duration: 30,
    completionLogic: 'count',
    targetCount: 30,
    motivationalQuote: 'Seek knowledge from the cradle to the grave. - Prophet Muhammad (PBUH)',
    badgeIcon: '🎓'
  },

  // EARS CHALLENGES
  {
    id: 'ears-avoid-gossip-1day',
    title: 'Pure Listening (1 Day)',
    description: 'Avoid listening to gossip, backbiting, or harmful speech for one day.',
    icon: '👂',
    sinCategory: 'ears',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'The one who listens to backbiting is like the one who does it. - Islamic teaching',
    badgeIcon: '🎯'
  },
  {
    id: 'ears-beneficial-audio-7days',
    title: '7 Days of Beneficial Audio',
    description: 'Listen only to Quran, Islamic lectures, or educational content for a week.',
    icon: '🎧',
    sinCategory: 'ears',
    type: 'habit',
    duration: 7,
    completionLogic: 'count',
    targetCount: 7,
    motivationalQuote: 'When the Quran is recited, listen to it and pay attention. - Quran 7:204',
    badgeIcon: '🎵'
  },
  {
    id: 'ears-dhikr-listening-40days',
    title: '40 Days of Sacred Sounds',
    description: 'Replace all unnecessary audio with dhikr, Quran, or beneficial Islamic content.',
    icon: '🕌',
    sinCategory: 'ears',
    type: 'habit',
    duration: 40,
    completionLogic: 'streak',
    motivationalQuote: 'In the remembrance of Allah do hearts find rest. - Quran 13:28',
    badgeIcon: '💫'
  },

  // PRIDE CHALLENGES
  {
    id: 'pride-humility-practice-1day',
    title: 'Day of Humility',
    description: 'Practice genuine humility in all interactions for one day.',
    icon: '🙏',
    sinCategory: 'pride',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'Whoever humbles himself for Allah, Allah will elevate him. - Prophet Muhammad (PBUH)',
    badgeIcon: '🤲'
  },
  {
    id: 'pride-no-boasting-7days',
    title: '7 Days Without Boasting',
    description: 'Avoid all forms of showing off or boasting about your accomplishments.',
    icon: '🤫',
    sinCategory: 'pride',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'Pride and arrogance led to the downfall of Iblis. Guard your heart.',
    badgeIcon: '💖'
  },
  {
    id: 'pride-gratitude-practice-30days',
    title: '30 Days of Gratitude',
    description: 'Focus on Allah\'s blessings and express gratitude instead of pride daily.',
    icon: '🌅',
    sinCategory: 'pride',
    type: 'habit',
    duration: 30,
    completionLogic: 'count',
    targetCount: 30,
    motivationalQuote: 'If you are grateful, I will certainly give you more. - Quran 14:7',
    badgeIcon: '🌟'
  },

  // STOMACH CHALLENGES
  {
    id: 'stomach-mindful-eating-1day',
    title: 'Mindful Eating (1 Day)',
    description: 'Eat only halal, beneficial food with gratitude and moderation for one day.',
    icon: '🍽️',
    sinCategory: 'stomach',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'The son of Adam fills no worse vessel than his stomach. - Prophet Muhammad (PBUH)',
    badgeIcon: '⚖️'
  },
  {
    id: 'stomach-no-overeating-7days',
    title: '7 Days of Moderation',
    description: 'Practice eating in moderation - stop before feeling completely full.',
    icon: '🥗',
    sinCategory: 'stomach',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'A third for food, a third for drink, and a third for breathing. - Prophet Muhammad (PBUH)',
    badgeIcon: '🏃'
  },
  {
    id: 'stomach-intermittent-fasting-30days',
    title: '30 Days of Sunnah Fasting',
    description: 'Practice voluntary fasting (Mondays/Thursdays or 3 days per month) for 30 days.',
    icon: '🌙',
    sinCategory: 'stomach',
    type: 'habit',
    duration: 30,
    completionLogic: 'count',
    targetCount: 8, // Realistic target for voluntary fasts in a month
    motivationalQuote: 'Fasting is a shield from the fire. - Prophet Muhammad (PBUH)',
    badgeIcon: '🛡️'
  },

  // ZINA CHALLENGES
  {
    id: 'zina-pure-thoughts-1day',
    title: 'Day of Pure Thoughts',
    description: 'Guard your thoughts and avoid any impure mental content for one day.',
    icon: '🧠',
    sinCategory: 'zina',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'Verily, Allah forgives my ummah for what crosses their minds. - Prophet Muhammad (PBUH)',
    badgeIcon: '✨'
  },
  {
    id: 'zina-digital-purity-7days',
    title: '7 Days of Digital Purity',
    description: 'Completely avoid all inappropriate online content and maintain digital purity.',
    icon: '📱',
    sinCategory: 'zina',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'Whoever guards his chastity, Allah will make Paradise easy for him.',
    badgeIcon: '🏰'
  },
  {
    id: 'zina-marriage-focus-40days',
    title: '40 Days of Chastity Mastery',
    description: 'Complete spiritual purification - guard all boundaries for 40 consecutive days.',
    icon: '💍',
    sinCategory: 'zina',
    type: 'habit',
    duration: 40,
    completionLogic: 'streak',
    motivationalQuote: 'When a servant commits zina, faith leaves him. - Prophet Muhammad (PBUH)',
    badgeIcon: '👑'
  },

  // HEART CHALLENGES
  {
    id: 'heart-dhikr-1day',
    title: 'Day of Remembrance',
    description: 'Fill your day with constant dhikr and remembrance of Allah.',
    icon: '❤️',
    sinCategory: 'heart',
    type: 'micro',
    duration: 1,
    completionLogic: 'streak',
    motivationalQuote: 'In the remembrance of Allah do hearts find rest. - Quran 13:28',
    badgeIcon: '💎'
  },
  {
    id: 'heart-no-envy-7days',
    title: '7 Days Without Envy',
    description: 'Completely avoid jealousy and envy, focusing on your own blessings.',
    icon: '🌱',
    sinCategory: 'heart',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'Envy devours good deeds like fire devours wood. - Prophet Muhammad (PBUH)',
    badgeIcon: '🔥'
  },
  {
    id: 'heart-love-for-allah-40days',
    title: '40 Days of Divine Love',
    description: 'Purify your heart and focus all love and hope on Allah alone.',
    icon: '🕌',
    sinCategory: 'heart',
    type: 'habit',
    duration: 40,
    completionLogic: 'streak',
    motivationalQuote: 'Allah has not created anything more beloved to Him than faith. - Islamic teaching',
    badgeIcon: '🌟'
  },

  // PRAYER CHALLENGES - Build on existing streaks
  {
    id: 'prayer-all-7days',
    title: '7 Days All Prayers',
    description: 'Complete all 5 daily prayers for 7 consecutive days. Your current streak counts!',
    icon: '🕌',
    sinCategory: 'heart',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'And establish prayer and give zakah and bow with those who bow. - Quran 2:43',
    badgeIcon: '🕌'
  },
  {
    id: 'prayer-all-21days',
    title: '21 Days Prayer Consistency',
    description: 'Build a strong prayer habit with 21 consecutive days of all 5 prayers.',
    icon: '📿',
    sinCategory: 'heart',
    type: 'habit',
    duration: 21,
    completionLogic: 'streak',
    motivationalQuote: 'Prayer is the pillar of religion and the key to Paradise. - Prophet Muhammad (PBUH)',
    badgeIcon: '🎯'
  },
  {
    id: 'prayer-all-40days',
    title: '40 Days Prayer Mastery',
    description: 'Achieve spiritual discipline with 40 consecutive days of complete daily prayers.',
    icon: '⭐',
    sinCategory: 'heart',
    type: 'habit',
    duration: 40,
    completionLogic: 'streak',
    motivationalQuote: 'The first matter that the servant will be brought to account for on the Day of Judgment is the prayer. - Prophet Muhammad (PBUH)',
    badgeIcon: '👑'
  },
  {
    id: 'fajr-streak-14days',
    title: 'Fajr Champion - 14 Days',
    description: 'Master the most challenging prayer by maintaining Fajr for 14 consecutive days.',
    icon: '🌅',
    sinCategory: 'heart',
    type: 'habit',
    duration: 14,
    completionLogic: 'streak',
    motivationalQuote: 'Whoever prays the dawn prayer in congregation, it is as if he had prayed the whole night long. - Prophet Muhammad (PBUH)',
    badgeIcon: '🌅'
  },
  {
    id: 'fajr-streak-40days',
    title: 'Fajr Mastery - 40 Days',
    description: 'Transform your spiritual discipline with 40 consecutive days of Fajr prayer.',
    icon: '🌄',
    sinCategory: 'heart',
    type: 'habit',
    duration: 40,
    completionLogic: 'streak',
    motivationalQuote: 'The two rak\'ahs before Fajr are better than the world and all it contains. - Prophet Muhammad (PBUH)',
    badgeIcon: '💎'
  },
  {
    id: 'prayer-ontime-7days',
    title: '7 Days On-Time Prayers',
    description: 'Pray all 5 prayers within their proper times for 7 consecutive days.',
    icon: '⏰',
    sinCategory: 'heart',
    type: 'habit',
    duration: 7,
    completionLogic: 'streak',
    motivationalQuote: 'Prayer performed at its proper time is loved by Allah. - Prophet Muhammad (PBUH)',
    badgeIcon: '⏰'
  },
  {
    id: 'prayer-ontime-30days',
    title: '30 Days Punctual Prayer',
    description: 'Excellence in timing - all prayers within their prescribed times for 30 days.',
    icon: '🎯',
    sinCategory: 'heart',
    type: 'habit',
    duration: 30,
    completionLogic: 'streak',
    motivationalQuote: 'The best of deeds is prayer performed at its proper time. - Prophet Muhammad (PBUH)',
    badgeIcon: '🏆'
  },

  // SEASONAL CHALLENGES
  {
    id: 'ramadan-extra-prayers',
    title: 'Ramadan Night Prayers',
    description: 'Perform additional night prayers (Tahajjud/Qiyam) throughout Ramadan.',
    icon: '🌙',
    sinCategory: 'heart',
    type: 'seasonal',
    duration: 30,
    completionLogic: 'count',
    targetCount: 20, // Realistic target
    seasonalStartDate: '03-10', // Approximate Ramadan start (varies by year)
    seasonalEndDate: '04-09',
    motivationalQuote: 'The night prayer is the honor of the believer. - Prophet Muhammad (PBUH)',
    badgeIcon: '🌟'
  },
  {
    id: 'dhul-hijjah-good-deeds',
    title: 'First 10 Days of Dhul-Hijjah',
    description: 'Perform extra good deeds during the blessed first 10 days of Dhul-Hijjah.',
    icon: '🕋',
    sinCategory: 'heart',
    type: 'seasonal',
    duration: 10,
    completionLogic: 'count',
    targetCount: 10,
    seasonalStartDate: '06-15', // Approximate (varies by year)
    seasonalEndDate: '06-24',
    motivationalQuote: 'There are no days when righteous deeds are more beloved to Allah than these ten days.',
    badgeIcon: '🏔️'
  }
];

// Helper functions for challenge management
export const getChallengesByCategory = (category: SinCategory): ChallengeTemplate[] => {
  return challengeTemplates.filter(challenge => challenge.sinCategory === category);
};

export const getChallengesByType = (type: ChallengeType): ChallengeTemplate[] => {
  return challengeTemplates.filter(challenge => challenge.type === type);
};

export const getMicroChallenges = (): ChallengeTemplate[] => {
  return getChallengesByType('micro');
};

export const getHabitChallenges = (): ChallengeTemplate[] => {
  return getChallengesByType('habit');
};

export const getSeasonalChallenges = (): ChallengeTemplate[] => {
  return getChallengesByType('seasonal');
};

export const getChallengeById = (id: string): ChallengeTemplate | undefined => {
  return challengeTemplates.find(challenge => challenge.id === id);
};

export const getActiveChallengesForCategories = (categories: SinCategory[]): ChallengeTemplate[] => {
  return challengeTemplates.filter(challenge => 
    categories.includes(challenge.sinCategory)
  );
};