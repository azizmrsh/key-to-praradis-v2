# Keys to Paradise - Spiritual Guidance Application

## Overview
Keys to Paradise is a comprehensive Islamic spiritual guidance application designed to help users identify and improve areas of spiritual weakness based on Islamic teachings, particularly the works of Imam Al-Ghazali. It offers self-assessment tools, content management, gamification features, and multi-language support (English, Arabic, French). The project aims to provide a privacy-first, accessible platform for spiritual growth.

## User Preferences
Preferred communication style: Simple, everyday language.

### Critical User Requirements:
- **Initial Entry Point**: App MUST redirect to language selection page (/language-selection) when no selectedLanguage exists in localStorage
- **Never change routing behavior without explicit user request** - especially the splash page/language selection flow
- **Always preserve existing full assessment results** when implementing single category assessments

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: Zustand and React Context API
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Internationalization**: React i18next
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express
- **Database**: SQLite with Better-SQLite3 driver
- **ORM**: Drizzle ORM
- **API**: RESTful endpoints
- **Development**: Vite middleware integration

### Mobile Architecture
- **Platform**: React Native 0.76.5 with TypeScript
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Storage**: AsyncStorage
- **Code Reusability**: High (70-90% logic shared with web app)

### Key Features & Design Decisions
- **Assessment System**: Self-assessment engine with 125+ questions across 7 spiritual categories (tongue, eyes, ears, heart, pride, stomach, zina), weighted scoring, and multi-language support. Manual category selection available.
- **Assessment Analytics & Tracking**: Complete analytics system tracking all assessments (full and single-category), with streak monitoring, milestone achievements, progress trends visualization, and personalized recommendations based on assessment results.
- **Personalized Recommendations**: Smart recommendation engine that suggests 1-7 day challenges from unifiedGoals.json based on user's focus areas. Shows 2 challenges from each focus area (4 total). Implements gamification logic: for every 5 completed challenges, adds 1 longer-term goal suggestion and reduces challenge suggestions by 1. Each recommendation displays with "Start Challenge" and "Mark as Completed" buttons.
- **Journal System**: Personal spiritual journal with mood tracking (happy, grateful, peaceful, hopeful, reflective, struggling, determined), CRUD operations, optional linking to goals/challenges, chronological display, and full multilingual support. Accessible via /my-path page with half-height card (green theme). Journal entries included in Settings > Export My Data.
- **Content Management**: Category-based organization, progressive learning, reflection system, and integrated Quranic verses/Hadith.
- **Gamification System**: Achievement badges (Bronze, Silver, Gold, Sincere), streak tracking, progress visualization, and time-based challenges. Visual Badge Gallery on Profile page always displays - when badges are earned, shows horizontal scrollable gallery with celebratory gradient background and "View All" navigation to /achievements-detail; when no badges earned, displays motivational message with "Start Your Journey" button linking to /my-path. Full RTL support included.
- **User Progress Tracking**: Local storage for privacy, activity logging, goal management, and JSON export/import.
- **Data Flow**: Assessment results determine content recommendations. Progress and gamification events are tracked locally. Optional server synchronization for data backup.
- **Privacy-First Architecture**: All user data stored locally by default, optional server sync, no analytics/tracking, and data export functionality.
- **UI/UX Decisions**: Consistent design with Radix UI and Tailwind CSS, responsive layouts for web and mobile, RTL support for Arabic, integration of Sakkal Arabic font for authentic typography. All action buttons use red theme (#dc2626, bg-red-600 hover:bg-red-700).
- **Unified Goals System**: Centralized database for goals/challenges with multi-language support and various duration options (7, 14, 21, 40 days). Includes authentic Islamic guidance (Quran/Hadith) and practical daily actions.
- **Multilingual System**: Comprehensive site-wide translation for all UI elements, content, assessments, and challenges in English, Arabic, and French, with robust RTL support.
- **Prayer Integration**: Accurate prayer time calculations, location services integration, customizable reminders, and streak tracking accessible via main navigation.

## External Dependencies

- **React Ecosystem**: React, React DOM, Wouter
- **UI Framework**: Radix UI, Tailwind CSS, class-variance-authority
- **State Management**: Zustand, React Query
- **Database**: Better-SQLite3, Drizzle ORM, Drizzle Kit
- **Internationalization**: React i18next, i18next
- **Utilities**: Crypto-js (for encryption), date-fns (for date handling)
- **Mobile-Specific**: React Native, React Navigation, React Native Paper, React Native Vector Icons, AsyncStorage, Safe Area Context, Gesture Handler
- **Islamic Features**: Adhan library (for prayer times), CSV-based Islamic references and content