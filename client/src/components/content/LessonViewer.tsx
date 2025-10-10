import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  Heart,
  Quote,
  Lightbulb,
  Target,
  BookHeart
} from 'lucide-react';
import { ContentLesson } from '@/data/contentRepository';
import { journalManager } from '@/services/journalManager';
import { AddJournalModal } from '@/components/journal/AddJournalModal';
import { useTranslation } from 'react-i18next';

interface LessonViewerProps {
  lesson: ContentLesson;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
  isCompleted?: boolean;
}

export function LessonViewer({ lesson, onComplete, onBack, isCompleted = false }: LessonViewerProps) {
  const [currentSection, setCurrentSection] = useState<'content' | 'reflection'>('content');
  const [addJournalModalOpen, setAddJournalModalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState(journalManager.getEntriesByOrigin(lesson.id, 'Lesson'));
  const { t } = useTranslation();

  const handleOpenJournalModal = () => {
    setAddJournalModalOpen(true);
  };

  const handleJournalSuccess = () => {
    setJournalEntries(journalManager.getEntriesByOrigin(lesson.id, 'Lesson'));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.duration} min
            </Badge>
            {isCompleted && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                <CheckCircle className="w-3 h-3" />
                Completed
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold mb-2">{lesson.title}</CardTitle>
          <p className="text-lg text-muted-foreground italic">"{lesson.coreMessage}"</p>
        </CardHeader>

        <CardContent>
          {/* Section Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={currentSection === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSection('content')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Lesson Content
            </Button>
            <Button
              variant={currentSection === 'reflection' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSection('reflection')}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Reflection
            </Button>
          </div>

          <ScrollArea className="h-[60vh]">
            {currentSection === 'content' ? (
              <div className="space-y-6">
                {/* Introduction */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Introduction
                  </h3>
                  <p className="text-base leading-relaxed">{lesson.content.introduction}</p>
                </section>

                <Separator />

                {/* Key Points */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {lesson.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-base leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <Separator />

                {/* Practical Steps */}
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Practical Steps
                  </h3>
                  <div className="space-y-3">
                    {lesson.content.practicalSteps.map((step, index) => (
                      <div key={index} className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-base leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Quranic Reference */}
                {lesson.content.quranicReference && (
                  <>
                    <Separator />
                    <section>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Quote className="w-5 h-5 text-purple-500" />
                        Quranic Guidance
                      </h3>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                        <p className="text-base italic mb-3 leading-relaxed">
                          "{lesson.content.quranicReference.translation}"
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                          - {lesson.content.quranicReference.reference}
                        </p>
                      </div>
                    </section>
                  </>
                )}

                {/* Hadith Reference */}
                {lesson.content.hadithReference && (
                  <>
                    <Separator />
                    <section>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Quote className="w-5 h-5 text-green-500" />
                        Prophetic Guidance
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                        <p className="text-base italic mb-3 leading-relaxed">
                          "{lesson.content.hadithReference.text}"
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                          - Narrated by {lesson.content.hadithReference.narrator}, {lesson.content.hadithReference.source}
                        </p>
                      </div>
                    </section>
                  </>
                )}
              </div>
            ) : (
              /* Reflection Section */
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Personal Reflection
                  </h3>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                    <p className="text-base leading-relaxed italic">
                      {lesson.content.reflection}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-4">{t('journal.journalYourReflections')}</h3>
                  <div className="space-y-4">
                    <p className="text-base text-muted-foreground">
                      {t('journal.captureThoughts')}
                    </p>
                    <Button 
                      onClick={handleOpenJournalModal}
                      className="w-full flex items-center gap-2"
                      variant="outline"
                      size="lg"
                      data-testid="button-add-journal-lesson"
                    >
                      <BookHeart className="h-5 w-5" />
                      {t('journal.addEntry')}
                    </Button>

                    {journalEntries.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">{t('journal.yourReflections')} ({journalEntries.length})</h4>
                        {journalEntries.map((entry) => (
                          <div key={entry.id} className="bg-muted/30 p-4 rounded-lg border border-muted">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {entry.emotion}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{entry.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Lesson {lesson.order}</span>
              <span>•</span>
              <span>{lesson.tags.join(', ')}</span>
            </div>
            
            {!isCompleted ? (
              <Button 
                onClick={() => onComplete(lesson.id)}
                className="flex items-center gap-2"
                size="lg"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Complete
              </Button>
            ) : (
              <Badge variant="default" className="flex items-center gap-1 bg-green-600 px-4 py-2">
                <CheckCircle className="w-4 h-4" />
                Completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Journal Entry Modal */}
      <AddJournalModal
        open={addJournalModalOpen}
        onOpenChange={setAddJournalModalOpen}
        defaultOrigin="Lesson"
        defaultOriginId={lesson.id}
        defaultArea="Misc"
        onSuccess={handleJournalSuccess}
        title={`Reflect on: ${lesson.title}`}
      />
    </div>
  );
}