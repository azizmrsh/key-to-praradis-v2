import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for content synchronization
  app.get('/api/content/version', (req, res) => {
    // Check if there's a new content version available
    // This would be used to notify users of content updates
    res.json({ 
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    });
  });

  app.get('/api/content/sections', (req, res) => {
    // Return section metadata (no actual content)
    // In a real app, this would return data from a database
    res.json({ 
      success: true,
      message: 'Sections available for local storage'
    });
  });

  // Practices API
  app.get('/api/practices', async (req: Request, res: Response) => {
    try {
      const practices = await storage.getPractices();
      res.json({ success: true, practices });
    } catch (error) {
      console.error('Error fetching practices:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch practices' });
    }
  });

  // Mark a practice as complete
  app.post('/api/practices/:id/complete', async (req: Request, res: Response) => {
    try {
      const practiceId = parseInt(req.params.id);
      const userId = req.body.userId; // In a real app, this would be from auth session
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      await storage.markPracticeComplete(userId, practiceId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error completing practice:', error);
      res.status(500).json({ success: false, error: 'Failed to mark practice as complete' });
    }
  });

  // Triggers API
  app.get('/api/triggers', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string); // In a real app, this would be from auth session
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const triggers = await storage.getTriggers(userId);
      res.json({ success: true, triggers });
    } catch (error) {
      console.error('Error fetching triggers:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch triggers' });
    }
  });

  // Create a new trigger
  app.post('/api/triggers', async (req: Request, res: Response) => {
    try {
      const trigger = req.body;
      const newTrigger = await storage.createTrigger(trigger);
      res.json({ success: true, trigger: newTrigger });
    } catch (error) {
      console.error('Error creating trigger:', error);
      res.status(500).json({ success: false, error: 'Failed to create trigger' });
    }
  });

  // Update a trigger (e.g., when encountered)
  app.patch('/api/triggers/:id', async (req: Request, res: Response) => {
    try {
      const triggerId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTrigger = await storage.updateTrigger(triggerId, updates);
      res.json({ success: true, trigger: updatedTrigger });
    } catch (error) {
      console.error('Error updating trigger:', error);
      res.status(500).json({ success: false, error: 'Failed to update trigger' });
    }
  });

  app.post('/api/analytics/anonymous', (req, res) => {
    // Handle completely anonymous analytics
    // No personal data, just usage patterns for app improvement
    const { eventType, timestamp } = req.body;
    
    // In a real app, this would store anonymized analytics data
    console.log('Anonymous analytics event:', eventType, timestamp);
    
    res.json({ success: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
