import React from 'react';
import { cn } from '@/lib/utils';

interface ArabicTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'heading' | 'verse' | 'dhikr';
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
}

export const ArabicText: React.FC<ArabicTextProps> = ({
  children,
  className,
  variant = 'body',
  size = 'base',
  weight = 'regular'
}) => {
  const baseClasses = "font-arabic direction-rtl text-right";
  
  const variantClasses = {
    body: "arabic-text",
    heading: "arabic-heading",
    verse: "arabic-verse",
    dhikr: "arabic-dhikr"
  };
  
  const sizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg", 
    xl: "text-xl",
    '2xl': "text-2xl"
  };

  const weightClasses = {
    light: "font-light",      // 300
    regular: "font-normal",   // 400
    medium: "font-medium",    // 500
    bold: "font-bold",        // 700
    heavy: "font-black"       // 900
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      weightClasses[weight],
      className
    )}>
      {children}
    </div>
  );
};

interface BilingualTextProps {
  arabic: string;
  translation: string;
  transliteration?: string;
  className?: string;
  arabicSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  arabicWeight?: 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  arabic,
  translation,
  transliteration,
  className,
  arabicSize = 'lg',
  arabicWeight = 'regular'
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <ArabicText 
        variant="dhikr" 
        size={arabicSize}
        weight={arabicWeight}
      >
        {arabic}
      </ArabicText>
      
      {transliteration && (
        <p className="text-sm italic text-muted-foreground text-center">
          {transliteration}
        </p>
      )}
      
      <p className="text-sm text-muted-foreground text-center">
        {translation}
      </p>
    </div>
  );
};