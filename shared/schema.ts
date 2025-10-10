import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferences: text("preferences", { mode: "json" }).$type<UserPreferences>(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const sections = sqliteTable("sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  colorClass: text("color_class").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sectionId: integer("section_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  content: text("content", { mode: "json" }).$type<LessonContent>(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  sinCategory: text("sin_category").notNull(), // Links to SinCategory
  type: text("type").notNull(), // 'micro', 'habit', 'seasonal'
  duration: integer("duration").notNull(), // Duration in days
  completionLogic: text("completion_logic").notNull(), // 'streak', 'count', 'time-locked'
  targetCount: integer("target_count"), // For count-based challenges
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  seasonalStartDate: text("seasonal_start_date"), // For seasonal challenges (MM-DD format)
  seasonalEndDate: text("seasonal_end_date"), // For seasonal challenges (MM-DD format)
  motivationalQuote: text("motivational_quote"),
  badgeIcon: text("badge_icon"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

// Track user progress on active challenges
export const userChallengeProgress = sqliteTable("user_challenge_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  status: text("status").notNull(), // 'active', 'completed', 'failed', 'paused'
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  completedDate: integer("completed_date", { mode: "timestamp" }),
  currentStreak: integer("current_streak").default(0),
  totalSuccessDays: integer("total_success_days").default(0),
  lastLoggedDate: integer("last_logged_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

// Daily logs for challenge progress
export const challengeDailyLogs = sqliteTable("challenge_daily_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userChallengeProgressId: integer("user_challenge_progress_id").notNull(),
  logDate: integer("log_date", { mode: "timestamp" }).notNull(), // The date this log represents
  logType: text("log_type").notNull(), // 'success', 'infraction', 'journal', 'skip'
  note: text("note"), // Optional reflection or reason
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()) // When the log was actually made
});

export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  completedLessons: text("completed_lessons", { mode: "json" }).$type<number[]>(),
  completedSections: text("completed_sections", { mode: "json" }).$type<number[]>(),
  completedPractices: text("completed_practices", { mode: "json" }).$type<number[]>(),
  streak: integer("streak").notNull().default(0),
  lastActivity: integer("last_activity", { mode: "timestamp" }),
  activeChallenges: text("active_challenges", { mode: "json" }).$type<number[]>(),
  achievements: text("achievements", { mode: "json" }).$type<Achievement[]>(),
  selfAssessment: text("self_assessment", { mode: "json" }).$type<SelfAssessment>(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

// New tables for additional features

export const practices = sqliteTable("practices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'daily', 'weekly', 'occasional'
  source: text("source").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const triggers = sqliteTable("triggers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'eyes', 'ears', 'tongue', 'heart', 'body'
  description: text("description").notNull(),
  situations: text("situations", { mode: "json" }).$type<string[]>(),
  strategies: text("strategies", { mode: "json" }).$type<string[]>(),
  encounterCount: integer("encounter_count").notNull().default(0),
  lastEncountered: integer("last_encountered", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const reflections = sqliteTable("reflections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  content: text("content", { mode: "json" }).$type<Record<string, string>>(),
  completedAt: integer("completed_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const selfAssessments = sqliteTable("self_assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // 'in_progress', 'completed', 'paused'
  currentQuestionIndex: integer("current_question_index").default(0),
  responses: text("responses", { mode: "json" }).$type<Record<string, any>>().default({}),
  skippedQuestions: text("skipped_questions", { mode: "json" }).$type<string[]>().default([]),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

// Advanced Assessment Analytics Tables
export const assessmentHistory = sqliteTable("assessment_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  assessmentType: text("assessment_type").notNull(), // 'full' | 'single_category'
  targetCategory: text("target_category"), // SinCategory if single_category
  scores: text("scores", { mode: "json" }).$type<Record<string, number>>().notNull(), // CategoryScores
  primaryArea: text("primary_area").notNull(),
  secondaryArea: text("secondary_area"),
  totalQuestions: integer("total_questions").notNull(),
  completionTime: integer("completion_time"), // seconds
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const assessmentStreaks = sqliteTable("assessment_streaks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // SinCategory
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastAssessmentDate: integer("last_assessment_date", { mode: "timestamp" }),
  totalAssessments: integer("total_assessments").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date())
});

export const assessmentMilestones = sqliteTable("assessment_milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  milestoneType: text("milestone_type").notNull(), // 'streak' | 'improvement' | 'consistency'
  category: text("category"), // SinCategory if category-specific
  title: text("title").notNull(),
  description: text("description").notNull(),
  value: integer("value"), // streak count, improvement percentage, etc.
  unlockedAt: integer("unlocked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  isViewed: integer("is_viewed", { mode: "boolean" }).default(false)
});

export const personalizedRecommendations = sqliteTable("personalized_recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // SinCategory
  recommendationType: text("recommendation_type").notNull(), // 'lesson' | 'practice' | 'challenge'
  contentId: integer("content_id"), // ID of recommended content
  priority: integer("priority").default(5), // 1-10 priority score
  reason: text("reason").notNull(), // Why this was recommended
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" })
});

// Types
export type NotificationPreference = {
  prayer: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'midnight' | 'tahajjud';
  enabled: boolean;
  timing: 'at' | 'before15' | 'before30' | 'after15' | 'after30';
};

export type PrayerSettings = {
  method: 'muslim-world-league' | 'egyptian' | 'karachi' | 'umm-al-qura' | 'dubai' | 'north-america' | 'kuwait' | 'qatar' | 'singapore';
  madhab: 'shafi' | 'hanafi';
  highLatitudeRule: 'middle-of-the-night' | 'seventh-of-the-night' | 'twilight-angle';
  adjustments?: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
};

export type UserPreferences = {
  selectedAreas: string[];
  reflectionFrequency: string;
  preferredTime: string;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  notifications: boolean;
  prayerNotifications: NotificationPreference[];
  prayerSettings: PrayerSettings;
  location?: UserLocation;
};

export type LessonContent = {
  introduction: string;
  keyPoints: string[];
  practicalGuidance: {
    title: string;
    content: string;
  }[];
  reflectionQuestions: string[];
  quotes: {
    text: string;
    source: string;
  }[];
};

export type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
};

interface SpeechAssessment {
  gossip: string;
  backbiting: string;
  lying: string;
  mockery: string;
  arguments: string;
  vulgarity: string;
  excessive: string;
  boasting: string;
  slander: string;
  harsh: string;
}

interface LegacySelfAssessment {
  areas: string[];
  reflectionFrequency: string;
  preferredTime: string;
  speechAssessment?: SpeechAssessment;
}

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferences: true
});

export const insertSectionSchema = createInsertSchema(sections).pick({
  title: true,
  description: true,
  icon: true,
  colorClass: true,
  tags: true,
  order: true
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  sectionId: true,
  title: true,
  description: true,
  order: true,
  content: true
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  icon: true,
  sinCategory: true,
  type: true,
  duration: true,
  completionLogic: true,
  targetCount: true,
  isActive: true,
  seasonalStartDate: true,
  seasonalEndDate: true,
  motivationalQuote: true,
  badgeIcon: true
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).pick({
  userId: true,
  challengeId: true,
  status: true,
  startDate: true,
  completedDate: true,
  currentStreak: true,
  totalSuccessDays: true,
  lastLoggedDate: true
});

export const insertChallengeDailyLogSchema = createInsertSchema(challengeDailyLogs).pick({
  userChallengeProgressId: true,
  logDate: true,
  logType: true,
  note: true
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  completedLessons: true,
  completedSections: true,
  completedPractices: true,
  streak: true,
  lastActivity: true,
  activeChallenges: true,
  achievements: true,
  selfAssessment: true
});

export const insertPracticeSchema = createInsertSchema(practices).pick({
  name: true,
  description: true,
  category: true,
  source: true,
  difficulty: true,
  tags: true
});

export const insertTriggerSchema = createInsertSchema(triggers).pick({
  userId: true,
  name: true,
  category: true,
  description: true,
  situations: true,
  strategies: true,
  encounterCount: true,
  lastEncountered: true
});

export const insertReflectionSchema = createInsertSchema(reflections).pick({
  userId: true,
  lessonId: true,
  content: true
});

export const insertSelfAssessmentSchema = createInsertSchema(selfAssessments).pick({
  userId: true,
  status: true,
  currentQuestionIndex: true,
  responses: true,
  skippedQuestions: true,
  completedAt: true
});

export const insertAssessmentHistorySchema = createInsertSchema(assessmentHistory).pick({
  userId: true,
  assessmentType: true,
  targetCategory: true,
  scores: true,
  primaryArea: true,
  secondaryArea: true,
  totalQuestions: true,
  completionTime: true
});

export const insertAssessmentStreaksSchema = createInsertSchema(assessmentStreaks).pick({
  userId: true,
  category: true,
  currentStreak: true,
  longestStreak: true,
  lastAssessmentDate: true,
  totalAssessments: true
});

export const insertAssessmentMilestonesSchema = createInsertSchema(assessmentMilestones).pick({
  userId: true,
  milestoneType: true,
  category: true,
  title: true,
  description: true,
  value: true,
  isViewed: true
});

export const insertPersonalizedRecommendationsSchema = createInsertSchema(personalizedRecommendations).pick({
  userId: true,
  category: true,
  recommendationType: true,
  contentId: true,
  priority: true,
  reason: true,
  isCompleted: true,
  completedAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type InsertChallengeDailyLog = z.infer<typeof insertChallengeDailyLogSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertPractice = z.infer<typeof insertPracticeSchema>;
export type InsertTrigger = z.infer<typeof insertTriggerSchema>;
export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type InsertSelfAssessment = z.infer<typeof insertSelfAssessmentSchema>;
export type InsertAssessmentHistory = z.infer<typeof insertAssessmentHistorySchema>;
export type InsertAssessmentStreaks = z.infer<typeof insertAssessmentStreaksSchema>;
export type InsertAssessmentMilestones = z.infer<typeof insertAssessmentMilestonesSchema>;
export type InsertPersonalizedRecommendations = z.infer<typeof insertPersonalizedRecommendationsSchema>;

export type User = typeof users.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type ChallengeDailyLog = typeof challengeDailyLogs.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Practice = typeof practices.$inferSelect;
export type Trigger = typeof triggers.$inferSelect;
export type Reflection = typeof reflections.$inferSelect;
export type SelfAssessment = typeof selfAssessments.$inferSelect;
export type AssessmentHistory = typeof assessmentHistory.$inferSelect;
export type AssessmentStreaks = typeof assessmentStreaks.$inferSelect;
export type AssessmentMilestones = typeof assessmentMilestones.$inferSelect;
export type PersonalizedRecommendations = typeof personalizedRecommendations.$inferSelect;