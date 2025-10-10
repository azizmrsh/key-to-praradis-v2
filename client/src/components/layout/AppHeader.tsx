import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  rightElement?: React.ReactNode;
}

export function AppHeader({ 
  title, 
  showBackButton = true, 
  backPath = '/content-dashboard', 
  rightElement 
}: AppHeaderProps) {
  const [location] = useLocation();
  
  // Don't show back button on dashboard
  const shouldShowBackButton = showBackButton && location !== '/';
  
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {shouldShowBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="mr-3 hover:bg-primary/10"
            >
              <Link to={backPath}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        </div>
        
        {rightElement && (
          <div>
            {rightElement}
          </div>
        )}
      </div>
    </header>
  );
}