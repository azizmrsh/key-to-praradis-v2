import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { journalManager, type JournalArea, type JournalOrigin } from '@/services/journalManager';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface AddJournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultArea?: JournalArea;
  defaultOrigin?: JournalOrigin;
  defaultOriginId?: string | null;
  onSuccess?: () => void;
  title?: string;
}

export function AddJournalModal({
  open,
  onOpenChange,
  defaultArea = 'Misc',
  defaultOrigin = 'Manual',
  defaultOriginId = null,
  onSuccess,
  title
}: AddJournalModalProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    content: '',
    emotion: '',
    area: defaultArea
  });

  const availableEmotions = journalManager.getAvailableEmotions();

  useEffect(() => {
    if (open) {
      setFormData({
        content: '',
        emotion: '',
        area: defaultArea
      });
    }
  }, [open, defaultArea]);

  const handleSave = () => {
    if (!formData.content.trim()) {
      toast({
        title: t('journal.entryContent'),
        description: t('journal.entryPlaceholder'),
        variant: 'destructive'
      });
      return;
    }

    if (!formData.emotion) {
      toast({
        title: t('journal.emotion'),
        description: t('journal.selectEmotion'),
        variant: 'destructive'
      });
      return;
    }

    journalManager.addJournalEntry({
      content: formData.content,
      emotion: formData.emotion,
      area: formData.area,
      origin: defaultOrigin,
      origin_id: defaultOriginId
    });

    toast({
      title: t('common.success'),
      description: t('journal.createEntry')
    });

    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    setFormData({ content: '', emotion: '', area: defaultArea });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title || t('journal.addEntry')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="modal-area">{t('journal.area')} *</Label>
            <Select 
              value={formData.area} 
              onValueChange={(value) => setFormData({ ...formData, area: value as JournalArea })}
            >
              <SelectTrigger id="modal-area" data-testid="select-modal-journal-area">
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
            <Label htmlFor="modal-emotion">{t('journal.emotion')} *</Label>
            <Select 
              value={formData.emotion} 
              onValueChange={(value) => setFormData({ ...formData, emotion: value })}
            >
              <SelectTrigger id="modal-emotion" data-testid="select-modal-journal-emotion">
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
            <Label htmlFor="modal-content">{t('journal.entryContent')} *</Label>
            <Textarea
              id="modal-content"
              placeholder={t('journal.entryPlaceholder')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[200px]"
              data-testid="input-modal-journal-content"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-red-600 hover:bg-red-700" 
            data-testid="button-save-modal-journal"
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
