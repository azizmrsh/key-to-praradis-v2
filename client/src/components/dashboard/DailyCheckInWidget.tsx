import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { getCheckInStatus } from '@/lib/dailyCheckInService';
import { useUser } from '@/contexts/UserContext';

export function DailyCheckInWidget() {
  const { userProgress } = useUser();
  const [checkInStatus, setCheckInStatus] = useState(() => getCheckInStatus());
  
  // Get the current focus sin from user progress
  const focusSin = userProgress?.selfAssessment?.areas?.[0] || 'heart';
  
  // Update check-in status when component mounts
  useEffect(() => {
    setCheckInStatus(getCheckInStatus());
  }, []);
  
  // Get sin category title
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
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Daily Accountability</span>
          {checkInStatus.streakDays > 0 && (
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full inline-flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> {checkInStatus.streakDays} day streak
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Track your progress with {sinTitle.toLowerCase()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {checkInStatus.hasCheckedInToday ? (
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium">Checked in today</h4>
              <p className="text-sm text-muted-foreground">
                Great job staying accountable!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h4 className="font-medium">Check-in required</h4>
              <p className="text-sm text-muted-foreground">
                How did you do with {sinTitle.toLowerCase()} today?
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Link href="/check-in">
          <Button variant={checkInStatus.hasCheckedInToday ? "outline" : "default"} className="w-full">
            {checkInStatus.hasCheckedInToday ? 'View progress' : 'Check in now'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}