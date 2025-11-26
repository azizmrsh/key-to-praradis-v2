import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchCities, getTimezoneFromCoordinates, type CityData } from '@/lib/geocodingService';

interface CitySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCitySelect: (city: CityData) => void;
}

export function CitySearchDialog({ open, onOpenChange, onCitySelect }: CitySearchDialogProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // البحث عند تغيير النص (مع debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        setError(null);
        try {
          const results = await searchCities(searchQuery);
          // إضافة timezone لكل مدينة
          const citiesWithTimezone = results.map(city => ({
            ...city,
            timezone: getTimezoneFromCoordinates(city.latitude, city.longitude)
          }));
          setSearchResults(citiesWithTimezone);
        } catch (error) {
          console.error('Error searching cities:', error);
          setError(
            currentLanguage === 'ar' 
              ? 'فشل البحث عن المدن. يرجى المحاولة مرة أخرى.' 
              : 'Failed to search cities. Please try again.'
          );
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 500); // انتظار 500ms بعد التوقف عن الكتابة

    return () => clearTimeout(timer);
  }, [searchQuery, currentLanguage]);

  // إعادة تعيين البحث عند فتح الـ Dialog
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [open]);

  const handleCityClick = (city: CityData) => {
    onCitySelect(city);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-600" />
            {t('prayerSettings.searchCity.title', 'Search for Your City')}
          </DialogTitle>
          <DialogDescription>
            {t('prayerSettings.searchCity.description', 'Type any city name in the world - Arabic or English')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder={t('prayerSettings.searchCity.placeholder', 'Search for city (e.g. Mecca, London, Jakarta)...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-lg"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-emerald-600" />
          )}
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-red-500" />
                  <p className="text-red-700 dark:text-red-400 font-semibold mb-2">
                    {currentLanguage === 'ar' ? 'خطأ في البحث' : 'Search Error'}
                  </p>
                  <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-emerald-600" />
                <p>{t('prayerSettings.searchCity.searching', 'Searching...')}</p>
              </div>
            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('prayerSettings.searchCity.noResults', 'No cities found')}</p>
                <p className="text-sm mt-1">
                  {t('prayerSettings.searchCity.tryDifferent', 'Try typing a different city name')}
                </p>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('prayerSettings.searchCity.startTyping', 'Start typing to search for cities worldwide')}</p>
              </div>
            ) : (
              searchResults.map((city, index) => (
                <Button
                  key={`${city.name}-${city.latitude}-${city.longitude}-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  onClick={() => handleCityClick(city)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base">
                        {city.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {city.country}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {city.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-1 font-mono">
                        {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
