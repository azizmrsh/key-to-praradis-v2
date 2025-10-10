import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle, Book, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReflectionEditorProps {
  contentId: number;
  contentType: 'section' | 'lesson';
  contentTitle: string;
  onSave: (text: string, tags: string[]) => Promise<void>;
  onCancel?: () => void;
  defaultValue?: string;
  defaultTags?: string[];
  isEdit?: boolean;
}

export function ReflectionEditor({
  contentId,
  contentType,
  contentTitle,
  onSave,
  onCancel,
  defaultValue = '',
  defaultTags = [],
  isEdit = false
}: ReflectionEditorProps) {
  const [reflectionText, setReflectionText] = useState(defaultValue);
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    if (!reflectionText.trim()) {
      toast({
        title: 'Cannot save empty reflection',
        description: 'Please enter your thoughts before saving.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(reflectionText, tags);
      toast({
        title: 'Reflection saved',
        description: 'Your thoughts have been recorded successfully.'
      });
      if (!isEdit) {
        setReflectionText('');
        setTags([]);
      }
    } catch (error) {
      toast({
        title: 'Error saving reflection',
        description: 'There was a problem saving your reflection. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Book className="h-4 w-4" />
          {isEdit ? 'Edit Reflection' : 'Record Your Reflections'}
        </CardTitle>
        <CardDescription>
          {contentType === 'section' ? 'Section' : 'Lesson'}: {contentTitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reflection">Your Thoughts</Label>
          <Textarea
            id="reflection"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="What did you learn? How does this apply to your life? What challenges do you foresee?"
            className="min-h-[120px] resize-y"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (optional)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a tag and press Enter"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 h-3 w-3 rounded-full hover:bg-primary/20 inline-flex items-center justify-center"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !reflectionText.trim()}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Reflection'}
        </Button>
      </CardFooter>
    </Card>
  );
}