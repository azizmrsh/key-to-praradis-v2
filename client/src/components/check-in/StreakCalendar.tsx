import React from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { DailyCheckIn } from '@/lib/dailyCheckInService';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {
  dailyLogs: DailyCheckIn[];
  month?: Date; // Month to display, defaults to current month
}

export function StreakCalendar({ dailyLogs, month = new Date() }: StreakCalendarProps) {
  const { t } = useTranslation();
  
  // Generate days in the month
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDay = monthStart.getDay();
  
  // Function to determine status for a day
  const getDayStatus = (day: Date) => {
    const matchingLog = dailyLogs.find(log => 
      isSameDay(parseISO(log.date), day)
    );
    
    if (!matchingLog) return 'empty';
    return matchingLog.success ? 'success' : 'failure';
  };
  
  // Generate empty cells for days before the first of the month
  const emptyCells = Array.from({ length: startDay }, (_, i) => (
    <div key={`empty-${i}`} className="h-8 md:h-10"></div>
  ));
  
  return (
    <div className="w-full">
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium">
          {format(month, 'MMMM yyyy')}
        </h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
        <div>{t('calendar.days.sunday')}</div>
        <div>{t('calendar.days.monday')}</div>
        <div>{t('calendar.days.tuesday')}</div>
        <div>{t('calendar.days.wednesday')}</div>
        <div>{t('calendar.days.thursday')}</div>
        <div>{t('calendar.days.friday')}</div>
        <div>{t('calendar.days.saturday')}</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {emptyCells}
        
        {days.map(day => {
          const status = getDayStatus(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toString()}
              className={cn(
                "flex items-center justify-center h-8 md:h-10 text-sm rounded-full",
                isToday && "border border-primary",
                status === 'success' && "bg-green-100 dark:bg-green-900/30",
                status === 'failure' && "bg-red-100 dark:bg-red-900/30"
              )}
            >
              <div 
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full",
                  status === 'success' && "bg-green-500 text-white",
                  status === 'failure' && "bg-red-500 text-white"
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}