import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar, Award, TrendingUp } from 'lucide-react';
import { DailyCheckIn } from '@/lib/dailyCheckInService';
import { format, parseISO, subDays } from 'date-fns';

interface CheckInStatsProps {
  dailyLogs: DailyCheckIn[];
  streakDays: number;
  failureCount: number;
}

export function CheckInStats({ 
  dailyLogs, 
  streakDays, 
  failureCount 
}: CheckInStatsProps) {
  // Calculate weekly success rate
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentLogs = dailyLogs.filter(log => parseISO(log.date) >= sevenDaysAgo);
  
  const successRate = recentLogs.length === 0 
    ? 0 
    : (recentLogs.filter(log => log.success).length / recentLogs.length) * 100;
  
  // Calculate total check-ins
  const totalCheckIns = dailyLogs.length;
  
  // Calculate total successful days
  const totalSuccessfulDays = dailyLogs.filter(log => log.success).length;
  
  // Calculate longest streak
  const calculateLongestStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Sort logs by date (oldest first)
    const sortedLogs = [...dailyLogs].sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    for (const log of sortedLogs) {
      if (log.success) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  };
  
  const longestStreak = calculateLongestStreak();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-primary/20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Flame className="h-4 w-4 mr-2 text-amber-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{streakDays}</p>
          <p className="text-xs text-muted-foreground">consecutive days</p>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Award className="h-4 w-4 mr-2 text-blue-500" />
            Longest Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">days</p>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{successRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">last 7 days</p>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            Total Days
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-2xl font-bold">{totalSuccessfulDays}/{totalCheckIns}</p>
          <p className="text-xs text-muted-foreground">successful days</p>
        </CardContent>
      </Card>
    </div>
  );
}