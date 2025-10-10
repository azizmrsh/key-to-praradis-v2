import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { formatDate } from '@/lib/utils';

// Define the Trigger interface
export interface Trigger {
  id: string;
  name: string;
  category: string;
  description: string;
  situations: string[];
  strategies: string[];
  createdAt: Date;
  lastEncountered?: Date;
  encounterCount: number;
}

// Define trigger categories related to different sins
export const TRIGGER_CATEGORIES = [
  { id: 'eyes', name: 'Eyes', description: 'Visual triggers', icon: 'visibility' },
  { id: 'ears', name: 'Ears', description: 'Audio triggers', icon: 'hearing' },
  { id: 'tongue', name: 'Tongue', description: 'Speech triggers', icon: 'record_voice_over' },
  { id: 'heart', name: 'Heart', description: 'Emotional triggers', icon: 'favorite' },
  { id: 'body', name: 'Body', description: 'Physical triggers', icon: 'accessibility' }
];

interface TriggerTrackerProps {
  onTriggerAdded?: (trigger: Trigger) => void;
  onTriggerEncountered?: (triggerId: string) => void;
}

export function TriggerTracker({ onTriggerAdded, onTriggerEncountered }: TriggerTrackerProps) {
  const { userProgress, updateUserProgress } = useUser();
  const [triggers, setTriggers] = useState<Trigger[]>(userProgress?.triggers || []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<Trigger | null>(null);
  
  // Form state for adding a new trigger
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    category: 'eyes',
    description: '',
    situations: '',
    strategies: ''
  });

  const handleAddTrigger = () => {
    // Validate form
    if (!newTrigger.name || !newTrigger.description) {
      return;
    }

    const situationsArray = newTrigger.situations
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '');

    const strategiesArray = newTrigger.strategies
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '');

    // Create new trigger
    const trigger: Trigger = {
      id: Date.now().toString(),
      name: newTrigger.name,
      category: newTrigger.category,
      description: newTrigger.description,
      situations: situationsArray,
      strategies: strategiesArray,
      createdAt: new Date(),
      encounterCount: 0
    };

    // Add to state
    const updatedTriggers = [...triggers, trigger];
    setTriggers(updatedTriggers);
    
    // Update user progress
    updateUserProgress({
      triggers: updatedTriggers,
      lastActivity: new Date()
    });

    // Notify parent component
    if (onTriggerAdded) {
      onTriggerAdded(trigger);
    }

    // Reset form and close dialog
    setNewTrigger({
      name: '',
      category: 'eyes',
      description: '',
      situations: '',
      strategies: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleEncounterTrigger = (trigger: Trigger) => {
    // Update the trigger with a new encounter
    const updatedTrigger = {
      ...trigger,
      lastEncountered: new Date(),
      encounterCount: trigger.encounterCount + 1
    };

    // Update triggers list
    const updatedTriggers = triggers.map(t => 
      t.id === trigger.id ? updatedTrigger : t
    );
    
    setTriggers(updatedTriggers);
    
    // Update user progress
    updateUserProgress({
      triggers: updatedTriggers,
      lastActivity: new Date()
    });

    // Notify parent component
    if (onTriggerEncountered) {
      onTriggerEncountered(trigger.id);
    }
  };

  const viewTriggerDetails = (trigger: Trigger) => {
    setCurrentTrigger(trigger);
    setIsViewDialogOpen(true);
  };

  // Filter triggers by category
  const getTriggersByCategory = (category: string) => {
    return triggers.filter(t => t.category === category);
  };

  const renderTriggersList = (categoryId: string) => {
    const categoryTriggers = getTriggersByCategory(categoryId);
    
    if (categoryTriggers.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>No triggers added for this category yet.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setNewTrigger({...newTrigger, category: categoryId});
              setIsAddDialogOpen(true);
            }}
          >
            Add a trigger
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {categoryTriggers.map(trigger => (
          <Card key={trigger.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-base">{trigger.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {trigger.description}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {trigger.encounterCount}
                </Badge>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewTriggerDetails(trigger)}
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEncounterTrigger(trigger)}
                >
                  I Encountered This
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="trigger-tracker">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trigger Tracker</h2>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Trigger
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Track patterns, triggers, and situations that lead to spiritually harmful behaviors.
        Identify your personal triggers and develop strategies to overcome them.
      </p>

      <Tabs defaultValue="eyes">
        <TabsList className="grid grid-cols-5 mb-4">
          {TRIGGER_CATEGORIES.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {TRIGGER_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card className="mb-4">
              <CardContent className="p-4">
                <p className="text-sm">{category.description}</p>
              </CardContent>
            </Card>
            
            {renderTriggersList(category.id)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Trigger Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Trigger</DialogTitle>
            <DialogDescription>
              Record a new trigger or situation that you want to track and develop strategies for
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="trigger-name">Trigger Name</Label>
              <Input
                id="trigger-name"
                placeholder="E.g., Social media scrolling"
                value={newTrigger.name}
                onChange={e => setNewTrigger({...newTrigger, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="trigger-category">Category</Label>
              <select
                id="trigger-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newTrigger.category}
                onChange={e => setNewTrigger({...newTrigger, category: e.target.value})}
              >
                {TRIGGER_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="trigger-description">Description</Label>
              <Textarea
                id="trigger-description"
                placeholder="Describe the trigger in detail"
                value={newTrigger.description}
                onChange={e => setNewTrigger({...newTrigger, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="trigger-situations">Situations (one per line)</Label>
              <Textarea
                id="trigger-situations"
                placeholder="When does this trigger occur? List one situation per line"
                value={newTrigger.situations}
                onChange={e => setNewTrigger({...newTrigger, situations: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="trigger-strategies">Strategies (one per line)</Label>
              <Textarea
                id="trigger-strategies"
                placeholder="What strategies can you use to overcome this trigger? List one per line"
                value={newTrigger.strategies}
                onChange={e => setNewTrigger({...newTrigger, strategies: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTrigger}>
              Save Trigger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Trigger Dialog */}
      {currentTrigger && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{currentTrigger.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm">{currentTrigger.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Category</h4>
                <p className="text-sm">
                  {TRIGGER_CATEGORIES.find(c => c.id === currentTrigger.category)?.name}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm">{formatDate(currentTrigger.createdAt)}</p>
              </div>
              
              {currentTrigger.lastEncountered && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Last Encountered</h4>
                  <p className="text-sm">{formatDate(currentTrigger.lastEncountered)}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-1">Encounter Count</h4>
                <p className="text-sm">{currentTrigger.encounterCount}</p>
              </div>
              
              {currentTrigger.situations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Situations</h4>
                  <ul className="text-sm list-disc pl-5">
                    {currentTrigger.situations.map((situation, index) => (
                      <li key={index}>{situation}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentTrigger.strategies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Strategies</h4>
                  <ul className="text-sm list-disc pl-5">
                    {currentTrigger.strategies.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleEncounterTrigger(currentTrigger);
                  setIsViewDialogOpen(false);
                }}
              >
                I Encountered This
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}