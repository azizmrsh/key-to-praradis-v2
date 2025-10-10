import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  className?: string;
}

export function SOSButton({ className }: SOSButtonProps) {
  const [_, navigate] = useLocation();
  
  return (
    <Button 
      variant="destructive" 
      size="sm" 
      className={cn("font-semibold", className)}
      onClick={() => navigate('/sos')}
    >
      <span className="material-icons mr-1 text-sm">emergency</span>
      SOS
    </Button>
  );
}