import React from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.svg';

export function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: 'person', label: t('navigation.profile'), path: '/profile' },
    { icon: 'trending_up', label: t('navigation.yourPath'), path: '/my-path' },
    { icon: 'schedule', label: t('navigation.prayers'), path: '/prayers' },
    { icon: 'logo', label: t('navigation.aboutUs'), path: '/about-pgt' }
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-lg border-t border-border fixed bottom-0 left-0 right-0 z-10 shadow-lg shadow-black/5" style={{ height: '80px' }}>
      <div className="flex justify-around py-1 h-full">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center py-3 px-2 flex-1 transition-all duration-200 rounded-xl mx-1",
              location === item.path 
                ? "text-primary bg-primary/10 shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            onClick={() => navigate(item.path)}
          >
            {item.icon === 'logo' ? (
              <img 
                src={logoImage} 
                alt="Logo" 
                className={cn(
                  "h-6 w-6 object-contain transition-transform duration-200",
                  location === item.path ? "scale-110" : ""
                )}
              />
            ) : (
              <span className={cn(
                "material-icons transition-transform duration-200",
                location === item.path ? "scale-110" : ""
              )}>{item.icon}</span>
            )}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
