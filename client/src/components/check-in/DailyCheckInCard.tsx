import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TimePicker, TimeValue } from '@/components/ui/time-picker';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface DailyCheckInCardProps {
  focusSin: string;
  streakDays: number;
  onSubmit: (success: boolean, note: string, reminderTime?: string) => Promise<void>;
  loading?: boolean;
  reminderTime?: string | null;
}

export function DailyCheckInCard({ 
  focusSin, 
  streakDays, 
  onSubmit, 
  loading = false,
  reminderTime 
}: DailyCheckInCardProps) {
  const [success, setSuccess] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [enableReminder, setEnableReminder] = useState(!!reminderTime);
  const [selectedReminderTime, setSelectedReminderTime] = useState<TimeValue>(() => {
    if (reminderTime) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      return { hours, minutes };
    }
    // Default to 8:00 PM if no reminder time set
    return { hours: 20, minutes: 0 };
  });
  
  // Format today's date for display
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  // Get the sin category title
  const sinTitles: Record<string, string> = {
    'tongue': 'Speech',
    'eyes': 'Gaze',
    'ears': 'Listening',
    'heart': 'Heart',
    'pride': 'Humility',
    'stomach': 'Consumption',
    'zina': 'Modesty'
  };
  
  const sinTitle = sinTitles[focusSin] || 'Focus Area';
  
  const handleSubmit = async () => {
    if (success === null) return;
    
    let reminderTimeString: string | undefined = undefined;
    
    if (enableReminder) {
      reminderTimeString = `${String(selectedReminderTime.hours).padStart(2, '0')}:${String(selectedReminderTime.minutes).padStart(2, '0')}`;
    }
    
    await onSubmit(success, note, reminderTimeString);
  };
  
  return (
    <Card className="border-primary/20 w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">Daily Check-in</CardTitle>
        <CardDescription className="text-center">
          {today}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground">Current Focus</div>
          <div className="text-lg font-medium">{sinTitle}</div>
          {streakDays > 0 && (
            <div className="mt-2 bg-primary/10 text-primary px-3 py-1 rounded-full inline-block">
              {streakDays} day streak 🔥
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">
            Did you stay mindful of your intention today?
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={success === true ? "default" : "outline"}
              className={`h-auto py-6 ${success === true ? "border-green-500" : ""}`}
              onClick={() => setSuccess(true)}
            >
              <div className="flex flex-col items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <span className="font-medium">Yes</span>
                <span className="text-xs text-muted-foreground mt-1">I stayed mindful</span>
              </div>
            </Button>
            
            <Button
              variant={success === false ? "default" : "outline"}
              className={`h-auto py-6 ${success === false ? "border-destructive" : ""}`}
              onClick={() => setSuccess(false)}
            >
              <div className="flex flex-col items-center">
                <XCircle className="h-8 w-8 text-destructive mb-2" />
                <span className="font-medium">No</span>
                <span className="text-xs text-muted-foreground mt-1">I slipped today</span>
              </div>
            </Button>
          </div>
        </div>
        
        {success !== null && (
          <div className="space-y-4">
            {showNoteInput ? (
              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Daily Reflection
                </Label>
                <Textarea
                  id="note"
                  placeholder={success 
                    ? "What helped you stay mindful today?" 
                    : "What challenges did you face today?"
                  }
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full border border-dashed" 
                onClick={() => setShowNoteInput(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Add a reflection note (optional)
              </Button>
            )}
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminder-toggle" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily Reminder
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Set a reminder for your daily check-in
                  </p>
                </div>
                <Switch 
                  id="reminder-toggle"
                  checked={enableReminder}
                  onCheckedChange={setEnableReminder}
                />
              </div>
              
              {enableReminder && (
                <div className="mt-3 ml-6">
                  <TimePicker
                    value={selectedReminderTime}
                    onChange={setSelectedReminderTime}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          disabled={success === null || loading}
          className="w-full"
        >
          {loading ? "Submitting..." : "Submit Check-in"}
        </Button>
      </CardFooter>
    </Card>
  );
}