import { 
  users, type User, type InsertUser,
  userProgress, type UserProgress, type InsertUserProgress,
  triggers, type Trigger, type InsertTrigger,
  practices, type Practice, type InsertPractice,
  reflections, type Reflection, type InsertReflection,
  selfAssessments, type SelfAssessment, type InsertSelfAssessment
} from "@shared/schema";
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { SQL } from 'drizzle-orm/sql';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User progress
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  createUserProgress(userProgress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, userProgress: Partial<UserProgress>): Promise<UserProgress>;
  
  // Triggers
  getTriggers(userId: number): Promise<Trigger[]>;
  getTrigger(id: number): Promise<Trigger | undefined>;
  createTrigger(trigger: InsertTrigger): Promise<Trigger>;
  updateTrigger(id: number, trigger: Partial<Trigger>): Promise<Trigger>;
  
  // Practices
  getPractices(): Promise<Practice[]>;
  getPractice(id: number): Promise<Practice | undefined>;
  markPracticeComplete(userId: number, practiceId: number): Promise<void>;
  
  // Reflections
  getReflections(userId: number, lessonId?: number): Promise<Reflection[]>;
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  
  // Self Assessments
  getSelfAssessment(userId: number): Promise<SelfAssessment | undefined>;
  createSelfAssessment(assessment: InsertSelfAssessment): Promise<SelfAssessment>;
  updateSelfAssessment(id: number, assessment: Partial<SelfAssessment>): Promise<SelfAssessment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userValues = {
      username: insertUser.username,
      password: insertUser.password,
    };
    
    if (insertUser.preferences) {
      Object.assign(userValues, { preferences: insertUser.preferences });
    }
    
    if (insertUser.createdAt) {
      Object.assign(userValues, { createdAt: insertUser.createdAt });
    }
    
    const [user] = await db.insert(users).values([userValues]).returning();
    return user;
  }
  
  // User progress methods
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }
  
  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const progressValues = {
      userId: progress.userId,
    };
    
    if (progress.completedLessons) {
      Object.assign(progressValues, { completedLessons: progress.completedLessons });
    }
    
    if (progress.completedSections) {
      Object.assign(progressValues, { completedSections: progress.completedSections });
    }
    
    if (progress.completedPractices) {
      Object.assign(progressValues, { completedPractices: progress.completedPractices });
    }
    
    if (progress.streak !== undefined) {
      Object.assign(progressValues, { streak: progress.streak });
    }
    
    if (progress.lastActivity) {
      Object.assign(progressValues, { lastActivity: progress.lastActivity });
    }
    
    if (progress.activeChalllenges) {
      Object.assign(progressValues, { activeChalllenges: progress.activeChalllenges });
    }
    
    if (progress.achievements) {
      Object.assign(progressValues, { achievements: progress.achievements });
    }
    
    if (progress.selfAssessment) {
      Object.assign(progressValues, { selfAssessment: progress.selfAssessment });
    }
    
    if (progress.createdAt) {
      Object.assign(progressValues, { createdAt: progress.createdAt });
    } else {
      Object.assign(progressValues, { createdAt: new Date() });
    }
    
    const [newProgress] = await db.insert(userProgress).values([progressValues]).returning();
    return newProgress;
  }
  
  async updateUserProgress(id: number, progress: Partial<UserProgress>): Promise<UserProgress> {
    // Prepare the update object with only valid properties
    const updateData: Record<string, any> = {};
    
    if (progress.completedLessons !== undefined) {
      updateData.completedLessons = progress.completedLessons;
    }
    
    if (progress.completedSections !== undefined) {
      updateData.completedSections = progress.completedSections;
    }
    
    if (progress.completedPractices !== undefined) {
      updateData.completedPractices = progress.completedPractices;
    }
    
    if (progress.streak !== undefined) {
      updateData.streak = progress.streak;
    }
    
    if (progress.lastActivity !== undefined) {
      updateData.lastActivity = progress.lastActivity;
    }
    
    if (progress.activeChalllenges !== undefined) {
      updateData.activeChalllenges = progress.activeChalllenges;
    }
    
    if (progress.achievements !== undefined) {
      updateData.achievements = progress.achievements;
    }
    
    if (progress.selfAssessment !== undefined) {
      updateData.selfAssessment = progress.selfAssessment;
    }
    
    const [updatedProgress] = await db
      .update(userProgress)
      .set(updateData)
      .where(eq(userProgress.id, id))
      .returning();
    
    return updatedProgress;
  }
  
  // Trigger methods
  async getTriggers(userId: number): Promise<Trigger[]> {
    return db.select().from(triggers).where(eq(triggers.userId, userId));
  }
  
  async getTrigger(id: number): Promise<Trigger | undefined> {
    const [trigger] = await db.select().from(triggers).where(eq(triggers.id, id));
    return trigger;
  }
  
  async createTrigger(trigger: InsertTrigger): Promise<Trigger> {
    const triggerValues = {
      name: trigger.name,
      userId: trigger.userId,
      description: trigger.description,
      category: trigger.category
    };
    
    if (trigger.situations) {
      Object.assign(triggerValues, { situations: trigger.situations });
    }
    
    if (trigger.strategies) {
      Object.assign(triggerValues, { strategies: trigger.strategies });
    }
    
    if (trigger.encounterCount !== undefined) {
      Object.assign(triggerValues, { encounterCount: trigger.encounterCount });
    }
    
    if (trigger.lastEncountered) {
      Object.assign(triggerValues, { lastEncountered: trigger.lastEncountered });
    }
    
    if (trigger.createdAt) {
      Object.assign(triggerValues, { createdAt: trigger.createdAt });
    } else {
      Object.assign(triggerValues, { createdAt: new Date() });
    }
    
    const [newTrigger] = await db.insert(triggers).values([triggerValues]).returning();
    return newTrigger;
  }
  
  async updateTrigger(id: number, trigger: Partial<Trigger>): Promise<Trigger> {
    // Prepare the update object with only valid properties
    const updateData: Record<string, any> = {};
    
    if (trigger.name !== undefined) {
      updateData.name = trigger.name;
    }
    
    if (trigger.description !== undefined) {
      updateData.description = trigger.description;
    }
    
    if (trigger.category !== undefined) {
      updateData.category = trigger.category;
    }
    
    if (trigger.situations !== undefined) {
      updateData.situations = trigger.situations;
    }
    
    if (trigger.strategies !== undefined) {
      updateData.strategies = trigger.strategies;
    }
    
    if (trigger.encounterCount !== undefined) {
      updateData.encounterCount = trigger.encounterCount;
    }
    
    if (trigger.lastEncountered !== undefined) {
      updateData.lastEncountered = trigger.lastEncountered;
    }
    
    const [updatedTrigger] = await db
      .update(triggers)
      .set(updateData)
      .where(eq(triggers.id, id))
      .returning();
    
    return updatedTrigger;
  }
  
  // Practice methods
  async getPractices(): Promise<Practice[]> {
    return db.select().from(practices);
  }
  
  async getPractice(id: number): Promise<Practice | undefined> {
    const [practice] = await db.select().from(practices).where(eq(practices.id, id));
    return practice;
  }
  
  async markPracticeComplete(userId: number, practiceId: number): Promise<void> {
    const [userProg] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    if (userProg) {
      const completedPractices = Array.isArray(userProg.completedPractices) 
        ? userProg.completedPractices 
        : [];
      
      if (!completedPractices.includes(practiceId)) {
        await db
          .update(userProgress)
          .set({ 
            completedPractices: [...completedPractices, practiceId],
            lastActivity: new Date()
          })
          .where(eq(userProgress.id, userProg.id));
      }
    }
  }
  
  // Reflection methods
  async getReflections(userId: number, lessonId?: number): Promise<Reflection[]> {
    if (lessonId) {
      return db
        .select()
        .from(reflections)
        .where(and(
          eq(reflections.userId, userId),
          eq(reflections.lessonId, lessonId)
        ));
    }
    return db.select().from(reflections).where(eq(reflections.userId, userId));
  }
  
  async createReflection(reflection: InsertReflection): Promise<Reflection> {
    const reflectionValues = {
      userId: reflection.userId,
      lessonId: reflection.lessonId,
      content: reflection.content,
      questionId: reflection.questionId,
    };
    
    if (reflection.createdAt) {
      Object.assign(reflectionValues, { createdAt: reflection.createdAt });
    } else {
      Object.assign(reflectionValues, { createdAt: new Date() });
    }
    
    const [newReflection] = await db
      .insert(reflections)
      .values([reflectionValues])
      .returning();
    return newReflection;
  }

  async getSelfAssessment(userId: number): Promise<SelfAssessment | undefined> {
    const [assessment] = await db.select().from(selfAssessments).where(eq(selfAssessments.userId, userId));
    return assessment;
  }

  async createSelfAssessment(assessment: InsertSelfAssessment): Promise<SelfAssessment> {
    const [newAssessment] = await db
      .insert(selfAssessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async updateSelfAssessment(id: number, assessment: Partial<SelfAssessment>): Promise<SelfAssessment> {
    const [updatedAssessment] = await db
      .update(selfAssessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(selfAssessments.id, id))
      .returning();
    return updatedAssessment;
  }
}

export const storage = new DatabaseStorage();
