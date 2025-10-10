import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {NativeModules, Platform} from 'react-native';

// Get device language
const getDeviceLanguage = () => {
  const deviceLanguage =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      : NativeModules.I18nManager.localeIdentifier;

  return deviceLanguage ? deviceLanguage.substring(0, 2) : 'en';
};

// Translation resources - same as web app
const resources = {
  en: {
    translation: {
      navigation: {
        dashboard: "Dashboard",
        assessment: "Assessment",
        challenges: "Challenges",
        content: "Content",
        profile: "Profile",
        settings: "Settings",
        prayers: "Prayers"
      },
      dashboard: {
        title: "Spiritual Journey Dashboard",
        subtitle: "Your path to spiritual growth and self-improvement",
        activeFocusAreas: "Your Active Focus Areas",
        workingOnAreas: "Working on {{count}} areas of spiritual growth",
        continueLearning: "Continue Learning",
        quickActions: "Quick Actions",
        takeAssessment: "Take Assessment",
        browseContent: "Browse Content",
        emergencySupport: "Emergency Support",
        todaysProgress: "Today's Progress",
        lessonsCompleted: "Lessons Completed",
        dayStreak: "Day Streak",
        yourPathItems: "Your Path Items"
      },
      settings: {
        languageRegion: "Language & Region",
        currentLanguage: "Current Language",
        change: "Change",
        appearance: "Appearance",
        lightTheme: "Light Theme",
        darkTheme: "Dark Theme",
        notifications: "Notifications",
        enableNotifications: "Enable Notifications",
        notificationsDescription: "Receive reminders and spiritual guidance",
        dataManagement: "Data Management",
        clearAllData: "Clear All Data",
        clearDataDescription: "Remove all user data and reset the app",
        clear: "Clear",
        selectLanguage: "Select Language",
        confirmClearData: "Confirm Clear Data",
        clearDataWarning: "This action will permanently delete all your progress, assessment results, and preferences. This cannot be undone.",
        clearData: "Clear Data",
        dataCleared: "Data Cleared",
        "dataCleared.description": "All user data has been cleared. The app will redirect to language selection."
      },
      common: {
        ok: "OK",
        cancel: "Cancel",
        back: "Back",
        next: "Next",
        skip: "Skip",
        getStarted: "Get Started",
        done: "Done",
        save: "Save",
        error: "Error"
      },
      goals: {
        title: "Goals",
        activeGoals: "Active Goals",
        noActiveGoals: "No active goals yet",
        setFirstGoal: "Set Your First Goal",
        focusAreas: "Focus Areas",
        yourPath: "Your Path",
        trackGrowth: "Track Your Growth"
      },
      challenges: {
        title: "Challenges",
        activeChallenges: "Active Challenges",
        noActiveChallenges: "No active challenges yet",
        startFirstChallenge: "Start Your First Challenge",
        daysCompleted: "Days Completed",
        streak: "Streak",
        daysRemaining: "Days Remaining"
      },
      achievements: {
        title: "Achievements",
        yourAchievements: "Your Achievements",
        daysActive: "Days Active",
        lessonsCompleted: "Lessons",
        currentStreak: "Current Streak",
        totalPoints: "Total Points",
        firstAssessment: "First Assessment",
        firstAssessmentDesc: "Complete your first self-assessment",
        weekStreak: "Week Warrior",
        weekStreakDesc: "Maintain a 7-day streak",
        monthStreak: "Month Master",
        monthStreakDesc: "Maintain a 30-day streak",
        sincereSeeker: "Sincere Seeker",
        sincereSeekerDesc: "Complete 100 lessons with reflection",
        tier: {
          bronze: "Bronze",
          silver: "Silver",
          gold: "Gold",
          sincere: "Sincere"
        }
      },
      prayers: {
        fajr: "Fajr",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
        settings: {
          title: "Prayer Settings",
          location: "Location",
          currentLocation: "Current Location",
          calculationMethod: "Calculation Method",
          method: "Method",
          madhab: "Madhab",
          notifications: "Prayer Notifications",
          notificationDescription: "Get notified at prayer time",
          saveSettings: "Save Settings",
          saved: "Settings Saved",
          savedDescription: "Your prayer settings have been saved successfully.",
          saveError: "Failed to save settings. Please try again.",
          editLocation: "Edit Location",
          city: "City",
          country: "Country",
          latitude: "Latitude",
          longitude: "Longitude",
          selectMethod: "Select Calculation Method"
        },
        methods: {
          mwl: "Muslim World League",
          egyptian: "Egyptian General Authority",
          karachi: "University of Karachi",
          ummAlQura: "Umm Al-Qura University",
          dubai: "Dubai"
        },
        madhab: {
          shafi: "Shafi",
          hanafi: "Hanafi"
        }
      },
      onboarding: {
        getStarted: "Get Started",
        chooseYourPath: "Choose Your Path",
        pathDescription: "You can take a guided assessment with questions, or directly select the areas you wish to focus on.",
        takeAssessment: "TAKE SELF-ASSESSMENT",
        assessmentDescription: "Answer questions to help identify your primary areas of focus (15-10 minutes)",
        or: "OR",
        chooseManually: "CHOOSE MANUALLY",
        manualDescription: "Skip the assessment and select the spiritual areas you want to work on",
        bottomNote: "You can always retake the assessment or change your focus areas later from your profile page."
      },
      manualSelection: {
        title: "Choose Your Focus Areas",
        subtitle: "Select your spiritual focus areas manually",
        cardTitle: "Select Your Spiritual Focus Areas",
        cardDescription: "Choose which spiritual challenges you'd like to focus on improving.",
        primaryFocusLabel: "Primary Focus Area (Required)",
        primaryFocusPlaceholder: "Select your main focus area",
        secondaryFocusLabel: "Secondary Focus Area (Optional)",
        secondaryFocusPlaceholder: "Select a secondary focus area",
        takeAssessmentInstead: "Take Assessment Instead",
        continueWithSelection: "Continue with Selection",
        categories: {
          tongue: "Tongue (Speech & Communication)",
          eyes: "Eyes (What We Watch)",
          ears: "Ears (What We Listen To)",
          heart: "Heart (Intentions & Emotions)",
          pride: "Pride & Arrogance",
          stomach: "Stomach (What We Consume)",
          zina: "Zina (Unlawful Relations)"
        }
      },
      assessmentButtons: {
        previous: "Previous",
        next: "Next",
        complete: "Complete",
        skipForNow: "Skip for Now",
        pauseAndSave: "Pause & Save",
        restartToSeeReferences: "Restart to See Islamic References",
        questionSkipped: "Question Skipped",
        questionSkippedMessage: "This question has been moved to the end of the assessment."
      },
      languageSelection: {
        title: "Keys to Paradise",
        subtitle: "Breaking Bad Habits",
        instruction: "Please select your preferred language to begin your spiritual journey",
        languages: {
          english: "ENGLISH",
          arabic: "عربي",
          french: "FRANÇAIS"
        }
      }
    }
  },
  ar: {
    translation: {
      navigation: {
        dashboard: "لوحة القيادة",
        assessment: "التقييم",
        challenges: "التحديات",
        content: "المحتوى",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        prayers: "الصلوات"
      },
      dashboard: {
        title: "لوحة الرحلة الروحية",
        subtitle: "طريقك إلى النمو الروحي وتحسين الذات",
        activeFocusAreas: "مجالات التركيز النشطة",
        workingOnAreas: "العمل على {{count}} مجالات من النمو الروحي",
        continueLearning: "متابعة التعلم",
        quickActions: "إجراءات سريعة",
        takeAssessment: "إجراء التقييم",
        browseContent: "تصفح المحتوى",
        emergencySupport: "الدعم الطارئ",
        todaysProgress: "تقدم اليوم",
        lessonsCompleted: "الدروس المكتملة",
        dayStreak: "سلسلة الأيام",
        yourPathItems: "عناصر مسارك"
      },
      settings: {
        languageRegion: "اللغة والمنطقة",
        currentLanguage: "اللغة الحالية",
        change: "تغيير",
        appearance: "المظهر",
        lightTheme: "المظهر الفاتح",
        darkTheme: "المظهر الداكن",
        notifications: "الإشعارات",
        enableNotifications: "تمكين الإشعارات",
        notificationsDescription: "تلقي التذكيرات والتوجيه الروحي",
        dataManagement: "إدارة البيانات",
        clearAllData: "مسح جميع البيانات",
        clearDataDescription: "إزالة جميع بيانات المستخدم وإعادة تعيين التطبيق",
        clear: "مسح",
        selectLanguage: "اختر اللغة",
        confirmClearData: "تأكيد مسح البيانات",
        clearDataWarning: "هذا الإجراء سيحذف نهائياً جميع تقدمك ونتائج التقييم وتفضيلاتك. لا يمكن التراجع عن هذا الإجراء.",
        clearData: "مسح البيانات",
        dataCleared: "تم مسح البيانات",
        "dataCleared.description": "تم مسح جميع بيانات المستخدم. سيتم إعادة توجيه التطبيق إلى اختيار اللغة."
      },
      common: {
        ok: "موافق",
        cancel: "إلغاء",
        back: "العودة",
        next: "التالي",
        skip: "تخطي",
        getStarted: "البدء",
        done: "تم",
        save: "حفظ",
        error: "خطأ"
      },
      goals: {
        title: "الأهداف",
        activeGoals: "الأهداف النشطة",
        noActiveGoals: "لا توجد أهداف نشطة بعد",
        setFirstGoal: "تعيين هدفك الأول",
        focusAreas: "مجالات التركيز",
        yourPath: "طريقك",
        trackGrowth: "تتبع نموك"
      },
      challenges: {
        title: "التحديات",
        activeChallenges: "التحديات النشطة",
        noActiveChallenges: "لا توجد تحديات نشطة بعد",
        startFirstChallenge: "ابدأ تحديك الأول",
        daysCompleted: "الأيام المكتملة",
        streak: "السلسلة",
        daysRemaining: "الأيام المتبقية"
      },
      achievements: {
        title: "الإنجازات",
        yourAchievements: "إنجازاتك",
        daysActive: "الأيام النشطة",
        lessonsCompleted: "الدروس",
        currentStreak: "السلسلة الحالية",
        totalPoints: "إجمالي النقاط",
        firstAssessment: "التقييم الأول",
        firstAssessmentDesc: "أكمل تقييمك الذاتي الأول",
        weekStreak: "محارب الأسبوع",
        weekStreakDesc: "حافظ على سلسلة 7 أيام",
        monthStreak: "سيد الشهر",
        monthStreakDesc: "حافظ على سلسلة 30 يوماً",
        sincereSeeker: "الطالب المخلص",
        sincereSeekerDesc: "أكمل 100 درس مع التأمل",
        tier: {
          bronze: "برونزي",
          silver: "فضي",
          gold: "ذهبي",
          sincere: "مخلص"
        }
      },
      prayers: {
        fajr: "الفجر",
        dhuhr: "الظهر",
        asr: "العصر",
        maghrib: "المغرب",
        isha: "العشاء",
        settings: {
          title: "إعدادات الصلاة",
          location: "الموقع",
          currentLocation: "الموقع الحالي",
          calculationMethod: "طريقة الحساب",
          method: "الطريقة",
          madhab: "المذهب",
          notifications: "إشعارات الصلاة",
          notificationDescription: "احصل على إشعارات في وقت الصلاة",
          saveSettings: "حفظ الإعدادات",
          saved: "تم حفظ الإعدادات",
          savedDescription: "تم حفظ إعدادات الصلاة بنجاح.",
          saveError: "فشل في حفظ الإعدادات. يرجى المحاولة مرة أخرى.",
          editLocation: "تعديل الموقع",
          city: "المدينة",
          country: "البلد",
          latitude: "خط العرض",
          longitude: "خط الطول",
          selectMethod: "اختر طريقة الحساب"
        },
        methods: {
          mwl: "رابطة العالم الإسلامي",
          egyptian: "الهيئة المصرية العامة",
          karachi: "جامعة كراتشي",
          ummAlQura: "جامعة أم القرى",
          dubai: "دبي"
        },
        madhab: {
          shafi: "شافعي",
          hanafi: "حنفي"
        }
      },
      onboarding: {
        getStarted: "ابدأ الآن",
        chooseYourPath: "اختر مسارك",
        pathDescription: "يمكنك إجراء تقييم موجه مع الأسئلة، أو اختيار المجالات التي تريد التركيز عليها مباشرة.",
        takeAssessment: "إجراء التقييم الذاتي",
        assessmentDescription: "أجب على الأسئلة لمساعدتك في تحديد مجالات التركيز الأساسية (15-10 دقائق)",
        or: "أو",
        chooseManually: "الاختيار يدوياً",
        manualDescription: "تخطي التقييم واختر المجالات الروحية التي تريد العمل عليها",
        bottomNote: "يمكنك دائماً إعادة إجراء التقييم أو تغيير مجالات التركيز لاحقاً من صفحة الملف الشخصي."
      },
      manualSelection: {
        title: "اختر مجالات التركيز",
        subtitle: "اختر مجالات التركيز الروحية يدوياً",
        cardTitle: "اختر مجالات التركيز الروحية",
        cardDescription: "اختر التحديات الروحية التي تريد التركيز على تحسينها.",
        primaryFocusLabel: "مجال التركيز الأساسي (مطلوب)",
        primaryFocusPlaceholder: "اختر مجال التركيز الرئيسي",
        secondaryFocusLabel: "مجال التركيز الثانوي (اختياري)",
        secondaryFocusPlaceholder: "اختر مجال التركيز الثانوي",
        takeAssessmentInstead: "إجراء التقييم بدلاً من ذلك",
        continueWithSelection: "المتابعة مع الاختيار",
        categories: {
          tongue: "اللسان (الكلام والتواصل)",
          eyes: "العينان (ما نشاهده)",
          ears: "الأذنان (ما نستمع إليه)",
          heart: "القلب (النوايا والعواطف)",
          pride: "الكبر والغرور",
          stomach: "المعدة (ما نستهلكه)",
          zina: "الزنا (العلاقات غير المشروعة)"
        }
      },
      assessmentButtons: {
        previous: "السابق",
        next: "التالي",
        complete: "إكمال",
        skipForNow: "تخطي الآن",
        pauseAndSave: "إيقاف مؤقت وحفظ",
        restartToSeeReferences: "إعادة التشغيل لرؤية المراجع الإسلامية",
        questionSkipped: "تم تخطي السؤال",
        questionSkippedMessage: "تم نقل هذا السؤال إلى نهاية التقييم."
      },
      languageSelection: {
        title: "مفاتيح الجنة",
        subtitle: "كسر العادات السيئة",
        instruction: "يرجى اختيار لغتك المفضلة لبدء رحلتك الروحية",
        languages: {
          english: "ENGLISH",
          arabic: "عربي",
          french: "FRANÇAIS"
        }
      }
    }
  },
  fr: {
    translation: {
      navigation: {
        dashboard: "Tableau de bord",
        assessment: "Évaluation",
        challenges: "Défis",
        content: "Contenu",
        profile: "Profil",
        settings: "Paramètres",
        prayers: "Prières"
      },
      dashboard: {
        title: "Tableau de bord du voyage spirituel",
        subtitle: "Votre chemin vers la croissance spirituelle et l'amélioration de soi",
        activeFocusAreas: "Vos domaines de concentration actifs",
        workingOnAreas: "Travail sur {{count}} domaines de croissance spirituelle",
        continueLearning: "Continuer l'apprentissage",
        quickActions: "Actions rapides",
        takeAssessment: "Passer l'évaluation",
        browseContent: "Parcourir le contenu",
        emergencySupport: "Support d'urgence",
        todaysProgress: "Progrès d'aujourd'hui",
        lessonsCompleted: "Leçons terminées",
        dayStreak: "Séquence de jours",
        yourPathItems: "Éléments de votre chemin"
      },
      settings: {
        languageRegion: "Langue et région",
        currentLanguage: "Langue actuelle",
        change: "Changer",
        appearance: "Apparence",
        lightTheme: "Thème clair",
        darkTheme: "Thème sombre",
        notifications: "Notifications",
        enableNotifications: "Activer les notifications",
        notificationsDescription: "Recevoir des rappels et des conseils spirituels",
        dataManagement: "Gestion des données",
        clearAllData: "Effacer toutes les données",
        clearDataDescription: "Supprimer toutes les données utilisateur et réinitialiser l'application",
        clear: "Effacer",
        selectLanguage: "Sélectionner la langue",
        confirmClearData: "Confirmer l'effacement des données",
        clearDataWarning: "Cette action supprimera définitivement tous vos progrès, résultats d'évaluation et préférences. Cela ne peut pas être annulé.",
        clearData: "Effacer les données",
        dataCleared: "Données effacées",
        "dataCleared.description": "Toutes les données utilisateur ont été effacées. L'application sera redirigée vers la sélection de langue."
      },
      common: {
        ok: "OK",
        cancel: "Annuler",
        back: "Retour",
        next: "Suivant",
        skip: "Passer",
        getStarted: "Commencer",
        done: "Terminé",
        save: "Enregistrer",
        error: "Erreur"
      },
      goals: {
        title: "Objectifs",
        activeGoals: "Objectifs actifs",
        noActiveGoals: "Aucun objectif actif pour le moment",
        setFirstGoal: "Définir votre premier objectif",
        focusAreas: "Domaines de concentration",
        yourPath: "Votre chemin",
        trackGrowth: "Suivre votre croissance"
      },
      challenges: {
        title: "Défis",
        activeChallenges: "Défis actifs",
        noActiveChallenges: "Aucun défi actif pour le moment",
        startFirstChallenge: "Commencer votre premier défi",
        daysCompleted: "Jours terminés",
        streak: "Série",
        daysRemaining: "Jours restants"
      },
      achievements: {
        title: "Réalisations",
        yourAchievements: "Vos réalisations",
        daysActive: "Jours actifs",
        lessonsCompleted: "Leçons",
        currentStreak: "Série actuelle",
        totalPoints: "Total des points",
        firstAssessment: "Première évaluation",
        firstAssessmentDesc: "Terminez votre première auto-évaluation",
        weekStreak: "Guerrier de la semaine",
        weekStreakDesc: "Maintenez une série de 7 jours",
        monthStreak: "Maître du mois",
        monthStreakDesc: "Maintenez une série de 30 jours",
        sincereSeeker: "Chercheur sincère",
        sincereSeekerDesc: "Terminez 100 leçons avec réflexion",
        tier: {
          bronze: "Bronze",
          silver: "Argent",
          gold: "Or",
          sincere: "Sincère"
        }
      },
      prayers: {
        fajr: "Fajr",
        dhuhr: "Dhuhr",
        asr: "Asr",
        maghrib: "Maghrib",
        isha: "Isha",
        settings: {
          title: "Paramètres de prière",
          location: "Emplacement",
          currentLocation: "Emplacement actuel",
          calculationMethod: "Méthode de calcul",
          method: "Méthode",
          madhab: "Madhab",
          notifications: "Notifications de prière",
          notificationDescription: "Recevoir des notifications à l'heure de la prière",
          saveSettings: "Enregistrer les paramètres",
          saved: "Paramètres enregistrés",
          savedDescription: "Vos paramètres de prière ont été enregistrés avec succès.",
          saveError: "Échec de l'enregistrement des paramètres. Veuillez réessayer.",
          editLocation: "Modifier l'emplacement",
          city: "Ville",
          country: "Pays",
          latitude: "Latitude",
          longitude: "Longitude",
          selectMethod: "Sélectionner la méthode de calcul"
        },
        methods: {
          mwl: "Ligue du monde islamique",
          egyptian: "Autorité générale égyptienne",
          karachi: "Université de Karachi",
          ummAlQura: "Université Umm Al-Qura",
          dubai: "Dubai"
        },
        madhab: {
          shafi: "Chafi'i",
          hanafi: "Hanafi"
        }
      },
      onboarding: {
        getStarted: "Commencer",
        chooseYourPath: "Choisissez votre chemin",
        pathDescription: "Vous pouvez passer une évaluation guidée avec des questions, ou sélectionner directement les domaines sur lesquels vous souhaitez vous concentrer.",
        takeAssessment: "PASSER L'AUTO-ÉVALUATION",
        assessmentDescription: "Répondez aux questions pour aider à identifier vos domaines de concentration principaux (15-10 minutes)",
        or: "OU",
        chooseManually: "CHOISIR MANUELLEMENT",
        manualDescription: "Ignorer l'évaluation et sélectionner les domaines spirituels sur lesquels vous souhaitez travailler",
        bottomNote: "Vous pouvez toujours repasser l'évaluation ou changer vos domaines de concentration plus tard depuis votre page de profil."
      },
      manualSelection: {
        title: "Choisissez vos domaines de concentration",
        subtitle: "Sélectionnez vos domaines de concentration spirituels manuellement",
        cardTitle: "Sélectionnez vos domaines de concentration spirituels",
        cardDescription: "Choisissez les défis spirituels sur lesquels vous souhaitez vous concentrer pour vous améliorer.",
        primaryFocusLabel: "Domaine de concentration principal (Requis)",
        primaryFocusPlaceholder: "Sélectionnez votre domaine de concentration principal",
        secondaryFocusLabel: "Domaine de concentration secondaire (Optionnel)",
        secondaryFocusPlaceholder: "Sélectionnez un domaine de concentration secondaire",
        takeAssessmentInstead: "Passer l'évaluation à la place",
        continueWithSelection: "Continuer avec la sélection",
        categories: {
          tongue: "Langue (Parole et Communication)",
          eyes: "Yeux (Ce que nous regardons)",
          ears: "Oreilles (Ce que nous écoutons)",
          heart: "Cœur (Intentions et Émotions)",
          pride: "Orgueil et Arrogance",
          stomach: "Estomac (Ce que nous consommons)",
          zina: "Zina (Relations illégales)"
        }
      },
      assessmentButtons: {
        previous: "Précédent",
        next: "Suivant",
        complete: "Terminé",
        skipForNow: "Passer pour maintenant",
        pauseAndSave: "Pause et sauvegarde",
        restartToSeeReferences: "Redémarrer pour voir les références islamiques",
        questionSkipped: "Question ignorée",
        questionSkippedMessage: "Cette question a été déplacée à la fin de l'évaluation."
      },
      languageSelection: {
        title: "Clés du Paradis",
        subtitle: "Briser les mauvaises habitudes",
        instruction: "Veuillez sélectionner votre langue préférée pour commencer votre voyage spirituel",
        languages: {
          english: "ENGLISH",
          arabic: "عربي",
          french: "FRANÇAIS"
        }
      }
    }
  }
};

const defaultLanguage = 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    debug: __DEV__,
  });

export default i18n;