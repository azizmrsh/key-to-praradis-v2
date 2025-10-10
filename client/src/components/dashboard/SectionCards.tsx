import React from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Section } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCompletionPercentage } from '@/lib/utils';

interface SectionCardsProps {
  sections: Section[];
  sectionProgress: Record<number, { completed: number; total: number }>;
}

export function SectionCards({ sections, sectionProgress }: SectionCardsProps) {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const getSectionIcon = (icon: string) => {
    return (
      <span className="material-icons mr-2">{icon}</span>
    );
  };

  const getProgressText = (sectionId: number) => {
    const progress = sectionProgress[sectionId] || { completed: 0, total: 0 };
    return `${progress.completed}/${progress.total} ${t('sections.lessonsCompleted')}`;
  };

  const isCompleted = (sectionId: number) => {
    const progress = sectionProgress[sectionId] || { completed: 0, total: 0 };
    return progress.completed > 0 && progress.completed === progress.total;
  };

  const getProgressStatus = (sectionId: number) => {
    if (isCompleted(sectionId)) {
      return "text-success";
    }
    const progress = sectionProgress[sectionId] || { completed: 0, total: 0 };
    return progress.completed > 0 ? "text-success" : "";
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">{t('sections.contentSections')}</h2>
      <div className="grid grid-cols-1 gap-4 mb-20">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className={`bg-primary-light p-3 text-white`}>
              <div className="flex items-center">
                {getSectionIcon(section.icon)}
                <h3 className="font-medium">{section.title}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-neutral-700 mb-3">{section.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {section.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="bg-neutral-100 text-xs py-1 px-2 rounded">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`material-icons text-xs ${getProgressStatus(section.id)} mr-1`}>
                    {isCompleted(section.id) ? "check_circle" : "circle"}
                  </span>
                  <span className={`text-xs ${getProgressStatus(section.id)}`}>
                    {getProgressText(section.id)}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-primary text-sm font-medium"
                  onClick={() => navigate(`/section/${section.id}`)}
                >
                  {sectionProgress[section.id]?.completed > 0 ? t('sections.continue') : t('sections.start')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
