// SOS content configuration

// Dhikr data
export interface DhikrItem {
  id: number;
  title: string;
  text: string;
  transliteration?: string;
  translation: string;
  audioSrc?: string;
}

export const dhikrData: DhikrItem[] = [
  {
    id: 1,
    title: 'Istighfar',
    text: 'أَسْتَغْفِرُ اللهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
  },
  {
    id: 2,
    title: 'Tasbih',
    text: 'سُبْحَانَ اللهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
  },
  {
    id: 3,
    title: 'Tahmid',
    text: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
  },
  {
    id: 4,
    title: 'Takbir',
    text: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
  },
  {
    id: 5,
    title: "La hawla wa la quwwata",
    text: 'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no might nor power except with Allah',
  }
];

// Inspirational quotes data
export interface QuoteItem {
  id: number;
  text: string;
  source: string;
}

export const quotes: QuoteItem[] = [
  {
    id: 1,
    text: "Every time you feel like sinning, remember that the shaytan is trying to drag you towards him with a piece of thread. Don't let him upgrade to a rope, and then to a chain.",
    source: "Inspirational reminder"
  },
  {
    id: 2,
    text: "Allah burdens not a person beyond his scope.",
    source: "Quran 2:286"
  },
  {
    id: 3,
    text: "So, verily, with every difficulty, there is relief. Verily, with every difficulty there is relief.",
    source: "Quran 94:5-6"
  },
  {
    id: 4,
    text: "The strongest among you is the one who controls his anger.",
    source: "Prophet Muhammad ﷺ"
  },
  {
    id: 5,
    text: "The key to success is to focus on goals, not obstacles.",
    source: "Islamic Wisdom"
  }
];

// Emergency actions data
export interface EmergencyAction {
  id: number;
  title: string;
  route: string;
}

export const emergencyActions: EmergencyAction[] = [
  {
    id: 1,
    title: "Immediate Prayers",
    route: "/sos/prayers"
  },
  {
    id: 2,
    title: "Counter Strategies",
    route: "/sos/strategies"
  },
  {
    id: 3,
    title: "Success Stories",
    route: "/sos/stories"
  }
];

// Breathing exercise configuration
export const breathingExerciseConfig = {
  defaultDuration: 120, // in seconds
  phases: {
    inhale: 4,  // seconds
    hold: 4,    // seconds
    exhale: 6,  // seconds
    rest: 2     // seconds
  }
};