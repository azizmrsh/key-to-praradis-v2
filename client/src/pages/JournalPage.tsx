import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Edit2, Trash2, Smile, Heart, Star, Sparkles, BookHeart, CloudRain, Flame, Lock, Target, Zap, BookOpen, Calendar, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { journalManager, type JournalEntry, type JournalArea, type JournalOrigin } from '@/services/journalManager';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { AssessmentHeader } from '@/components/layout/AssessmentHeader';
import { useToast } from '@/hooks/use-toast';

const moodIcons: Record<string, any> = {
  happy: Smile,
  grateful: Heart,
  peaceful: Star,
  hopeful: Sparkles,
  reflective: BookHeart,
  struggling: CloudRain,
  determined: Flame
};

const moodColors: Record<string, string> = {
  happy: 'text-yellow-500 bg-yellow-50',
  grateful: 'text-pink-500 bg-pink-50',
  peaceful: 'text-blue-500 bg-blue-50',
  hopeful: 'text-purple-500 bg-purple-50',
  reflective: 'text-indigo-500 bg-indigo-50',
  struggling: 'text-gray-500 bg-gray-50',
  determined: 'text-orange-500 bg-orange-50'
};

const originIcons: Record<JournalOrigin, any> = {
  Goal: Target,
  Challenge: Zap,
  Lesson: BookOpen,
  CheckIn: Calendar,
  Manual: PenTool
};

const areaColors: Record<JournalArea, string> = {
  Primary: 'bg-blue-100 text-blue-800',
  Secondary: 'bg-green-100 text-green-800',
  Misc: 'bg-gray-100 text-gray-800'
};

export default function JournalPage() {
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    emotion: '',
    area: 'Misc' as JournalArea
  });

  // Filter state
  const [filterArea, setFilterArea] = useState<JournalArea | 'all'>('all');
  const [filterOrigin, setFilterOrigin] = useState<JournalOrigin | 'all'>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');

  useEffect(() => {
    loadEntries();
  }, [filterArea, filterOrigin, filterEmotion]);

  const loadEntries = () => {
    const filters: any = {};
    if (filterArea !== 'all') filters.area = filterArea;
    if (filterOrigin !== 'all') filters.origin = filterOrigin;
    if (filterEmotion !== 'all') filters.emotion = filterEmotion;
    
    setEntries(journalManager.getAllEntries(filters));
  };

  const handleCreate = () => {
    if (!formData.content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please write something in your journal entry.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.emotion) {
      toast({
        title: 'Emotion required',
        description: 'Please select an emotion for your entry.',
        variant: 'destructive'
      });
      return;
    }

    journalManager.addJournalEntry({
      content: formData.content,
      emotion: formData.emotion,
      area: formData.area,
      origin: 'Manual',
      origin_id: null
    });

    resetForm();
    setIsCreateDialogOpen(false);
    loadEntries();
    
    toast({
      title: 'Entry created',
      description: 'Your journal entry has been saved.'
    });
  };

  const handleUpdate = () => {
    if (!editingEntry || !formData.content.trim()) return;

    const result = journalManager.editJournalEntry(
      editingEntry.id, 
      formData.content,
      formData.emotion
    );

    if (!result.success) {
      toast({
        title: 'Cannot edit entry',
        description: result.reason === 'Locked' 
          ? 'This entry is locked because the linked goal/challenge is completed.'
          : 'Entry not found.',
        variant: 'destructive'
      });
      return;
    }

    resetForm();
    setEditingEntry(null);
    loadEntries();
    
    toast({
      title: 'Entry updated',
      description: 'Your journal entry has been updated.'
    });
  };

  const handleDelete = (id: string) => {
    const success = journalManager.deleteJournalEntry(id);
    
    if (success) {
      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been deleted.'
      });
    }
    
    setDeleteEntryId(null);
    loadEntries();
  };

  const resetForm = () => {
    setFormData({
      content: '',
      emotion: '',
      area: 'Misc'
    });
  };

  const openEditDialog = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      content: entry.content,
      emotion: entry.emotion,
      area: entry.area
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmotionIcon = (emotion: string) => {
    const Icon = moodIcons[emotion] || BookHeart;
    const colorClass = moodColors[emotion] || 'text-gray-500 bg-gray-50';
    return <Icon className={`h-5 w-5 ${colorClass}`} />;
  };

  const getOriginIcon = (origin: JournalOrigin) => {
    const Icon = originIcons[origin];
    return <Icon className="h-4 w-4" />;
  };

  const getOriginTranslationKey = (origin: JournalOrigin): string => {
    const keyMap: Record<JournalOrigin, string> = {
      'Goal': 'goal',
      'Challenge': 'challenge',
      'Lesson': 'lesson',
      'CheckIn': 'checkin',
      'Manual': 'manual'
    };
    return keyMap[origin];
  };

  const availableEmotions = journalManager.getAvailableEmotions();

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <AssessmentHeader 
        title={t('journal.title')}
        onBack={() => navigate('/my-path')} 
        language="en"
      />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">{t('journal.filterEntries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{t('journal.area')}</Label>
                <Select value={filterArea} onValueChange={(value) => setFilterArea(value as JournalArea | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('journal.allAreas')}</SelectItem>
                    <SelectItem value="Primary">{t('journal.areas.primary')}</SelectItem>
                    <SelectItem value="Secondary">{t('journal.areas.secondary')}</SelectItem>
                    <SelectItem value="Misc">{t('journal.areas.misc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t('journal.origin')}</Label>
                <Select value={filterOrigin} onValueChange={(value) => setFilterOrigin(value as JournalOrigin | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('journal.allOrigins')}</SelectItem>
                    <SelectItem value="Goal">{t('journal.origins.goal')}</SelectItem>
                    <SelectItem value="Challenge">{t('journal.origins.challenge')}</SelectItem>
                    <SelectItem value="Lesson">{t('journal.origins.lesson')}</SelectItem>
                    <SelectItem value="CheckIn">{t('journal.origins.checkIn')}</SelectItem>
                    <SelectItem value="Manual">{t('journal.origins.manual')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t('journal.emotion')}</Label>
                <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('journal.allEmotions')}</SelectItem>
                    {availableEmotions.map(emotion => (
                      <SelectItem key={emotion} value={emotion}>
                        {t(`journal.moods.${emotion}`) || emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookHeart className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('journal.noEntries')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('journal.noEntriesDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {entry.emotion && (
                          <Badge variant="outline" className={`${moodColors[entry.emotion] || 'text-gray-500 bg-gray-50'}`}>
                            {getEmotionIcon(entry.emotion)}
                            <span className="ml-1">{t(`journal.moods.${entry.emotion}`) || entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)}</span>
                          </Badge>
                        )}
                        <Badge variant="outline" className={areaColors[entry.area]}>
                          {t(`journal.areas.${entry.area.toLowerCase()}`)}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {getOriginIcon(entry.origin)}
                          <span className="ml-1">{t(`journal.origins.${getOriginTranslationKey(entry.origin)}`)}</span>
                        </Badge>
                        {entry.locked && (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            <Lock className="h-3 w-3 mr-1" />
                            {t('journal.locked')}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(entry)}
                        disabled={entry.locked}
                        data-testid={`button-edit-journal-${entry.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteEntryId(entry.id)}
                        data-testid={`button-delete-journal-${entry.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700">{entry.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <Button
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700"
          size="icon"
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-add-journal"
        >
          <Plus className="h-6 w-6" />
        </Button>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('journal.createEntry')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="area">{t('journal.area')} *</Label>
              <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value as JournalArea })}>
                <SelectTrigger id="area" data-testid="select-journal-area">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">{t('journal.areas.primary')}</SelectItem>
                  <SelectItem value="Secondary">{t('journal.areas.secondary')}</SelectItem>
                  <SelectItem value="Misc">{t('journal.areas.misc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotion">{t('journal.emotion')} *</Label>
              <Select value={formData.emotion} onValueChange={(value) => setFormData({ ...formData, emotion: value })}>
                <SelectTrigger id="emotion" data-testid="select-journal-emotion">
                  <SelectValue placeholder={t('journal.selectEmotion')} />
                </SelectTrigger>
                <SelectContent>
                  {availableEmotions.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>
                      {t(`journal.moods.${emotion}`) || emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder={t('journal.entryPlaceholder')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px]"
                data-testid="input-journal-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setIsCreateDialogOpen(false); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700" data-testid="button-save-journal">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('journal.editEntry')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-emotion">{t('journal.emotion')} *</Label>
              <Select value={formData.emotion} onValueChange={(value) => setFormData({ ...formData, emotion: value })}>
                <SelectTrigger id="edit-emotion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableEmotions.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>
                      {t(`journal.moods.${emotion}`) || emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder={t('journal.entryPlaceholder')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setEditingEntry(null); }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdate} className="bg-red-600 hover:bg-red-700">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEntryId} onOpenChange={(open) => !open && setDeleteEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('journal.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('journal.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteEntryId && handleDelete(deleteEntryId)} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
}
