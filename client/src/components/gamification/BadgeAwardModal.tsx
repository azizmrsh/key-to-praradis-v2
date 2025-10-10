import React, { useEffect, useState } from 'react';
import { Badge } from '@/lib/gamificationService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BadgeAwardModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProgress: () => void;
}

export function BadgeAwardModal({ badge, isOpen, onClose, onViewProgress }: BadgeAwardModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      setShowAnimation(true);
      // Auto-close after 5 seconds if user doesn't interact
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, badge, onClose]);

  if (!badge) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'sincere': return 'from-purple-500 to-purple-700';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'Bronze Achievement';
      case 'silver': return 'Silver Achievement';
      case 'gold': return 'Gold Achievement';
      case 'sincere': return 'Sincere Mastery';
      default: return 'Achievement';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-green-800 mb-4">
            🎉 Badge Earned!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6">
          {/* Badge Display */}
          <div className={`relative ${showAnimation ? 'animate-bounce' : ''}`}>
            <Card className={`p-6 bg-gradient-to-br ${getTierColor(badge.tier)} shadow-2xl border-0`}>
              <div className="text-center">
                <div className="text-6xl mb-3 animate-pulse">
                  {badge.icon}
                </div>
                <div className="text-white font-bold text-lg">
                  {getTierLabel(badge.tier)}
                </div>
              </div>
            </Card>
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(badge.tier)} opacity-30 blur-xl -z-10 ${showAnimation ? 'animate-ping' : ''}`}></div>
          </div>

          {/* Badge Details */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-gray-800">
              {badge.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {badge.description}
            </p>
            
            {/* Motivational Message */}
            <div className="bg-green-100 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-green-800 text-sm font-medium">
                "May Allah continue to strengthen your resolve and guide you on the straight path."
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 w-full">
            <Button
              onClick={onViewProgress}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              View My Progress
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}