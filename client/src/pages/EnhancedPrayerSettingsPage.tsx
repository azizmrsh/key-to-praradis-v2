import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Clock,
  Settings,
  Globe,
  Save,
  Search
} from 'lucide-react';
import EnhancedPrayerService, { type LocationData } from '@/lib/enhancedPrayerService';
import { 
  calculatePrayerTimes,
  formatPrayerTime,
  type PrayerSettings,
  type Prayer 
} from '@/lib/prayerTimes';
import { Coordinates } from 'adhan';
import { CitySearchDialog } from '@/components/settings/CitySearchDialog';
import type { CityData } from '@/lib/citiesData';

// Enhanced form schema with validation
const enhancedFormSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
    timezone: z.string().min(1, 'Timezone is required'),
    city: z.string().optional(),
    country: z.string().optional(),
    accuracy: z.number().optional(),
  }),
  settings: z.object({
    method: z.enum([
      'muslim-world-league',
      'egyptian',
      'karachi',
      'umm-al-qura',
      'dubai',
      'north-america',
      'kuwait',
      'qatar',
      'singapore'
    ]),
    madhab: z.enum(['shafi', 'hanafi']),
    highLatitudeRule: z.enum([
      'middle-of-the-night',
      'seventh-of-the-night',
      'twilight-angle'
    ]),
    adjustments: z.object({
      fajr: z.number().min(-60).max(60).optional(),
      sunrise: z.number().min(-60).max(60).optional(),
      dhuhr: z.number().min(-60).max(60).optional(),
      asr: z.number().min(-60).max(60).optional(),
      maghrib: z.number().min(-60).max(60).optional(),
      isha: z.number().min(-60).max(60).optional(),
    }),
  }),
});

type EnhancedFormValues = z.infer<typeof enhancedFormSchema>;

// Default values
const defaultLocation: LocationData = {
  latitude: 24.7136,
  longitude: 46.6753,
  timezone: 'Asia/Riyadh',
  city: 'Riyadh',
  country: 'Saudi Arabia',
  lastUpdated: new Date()
};

const defaultSettings: PrayerSettings = {
  method: 'muslim-world-league',
  madhab: 'shafi',
  highLatitudeRule: 'middle-of-the-night',
  adjustments: {}
};

export function EnhancedPrayerSettingsPage() {
  console.log('Enhanced Prayer Settings Page loaded');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // State management
  const [activeTab, setActiveTab] = useState('location');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [previewTimes, setPreviewTimes] = useState<Record<Prayer, string> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form setup
  const form = useForm<EnhancedFormValues>({
    resolver: zodResolver(enhancedFormSchema),
    defaultValues: {
      location: defaultLocation,
      settings: defaultSettings,
    },
  });

  // Watch form values for preview
  const watchedLocation = form.watch('location');
  const watchedSettings = form.watch('settings');

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Generate preview when location or settings change
  useEffect(() => {
    generatePreviewTimes();
  }, [watchedLocation, watchedSettings]);

  const loadSavedData = () => {
    // Load location
    const savedLocation = EnhancedPrayerService.getLocationData();
    console.log('Loading saved location data:', savedLocation);
    if (savedLocation) {
      form.setValue('location', savedLocation);
    } else {
      console.log('No saved location found, using defaults');
    }

    // Load settings
    const savedSettings = localStorage.getItem('prayer_settings_data');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        form.setValue('settings', settings);
      } catch (error) {
        console.error('Error loading prayer settings:', error);
      }
    }

    // Load last saved time
    const lastSavedTime = localStorage.getItem('prayer_settings_last_saved');
    if (lastSavedTime) {
      setLastSaved(new Date(lastSavedTime));
    }
  };

  const generatePreviewTimes = () => {
    try {
      if (!watchedLocation.latitude || !watchedLocation.longitude || !watchedLocation.timezone) {
        return;
      }

      const coordinates = new Coordinates(watchedLocation.latitude, watchedLocation.longitude);
      const settings: PrayerSettings = {
        ...watchedSettings,
        adjustments: watchedSettings.adjustments || {}
      };

      const prayerTimes = calculatePrayerTimes(
        new Date(),
        coordinates,
        settings,
        watchedLocation.timezone
      );

      const formattedTimes: Record<Prayer, string> = {} as Record<Prayer, string>;
      
      (['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight', 'tahajjud'] as Prayer[]).forEach(prayer => {
        if (prayerTimes[prayer]) {
          formattedTimes[prayer] = formatPrayerTime(
            prayerTimes[prayer],
            'h:mm a',
            watchedLocation.timezone
          );
        }
      });

      setPreviewTimes(formattedTimes);
    } catch (error) {
      console.error('Error generating prayer time preview:', error);
      setPreviewTimes(null);
    }
  };

  const handleCitySelect = (city: CityData) => {
    form.setValue('location', {
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      city: city.name,
      country: city.country,
      lastUpdated: new Date()
    });
    
    setShowCitySearch(false);
    
    toast({
      title: t('prayers.locationUpdated'),
      description: `${t('prayers.locationDetected')}: ${city.name}, ${city.country}`,
    });
  };

  const onSubmit = async (data: EnhancedFormValues) => {
    setIsSaving(true);
    
    try {
      console.log('Attempting to save location data:', data.location);
      
      // Save location with enhanced validation
      const locationSaved = EnhancedPrayerService.saveLocationData({
        ...data.location,
        lastUpdated: new Date()
      });
      
      console.log('Location save result:', locationSaved);
      
      if (!locationSaved) {
        throw new Error('Failed to save location data');
      }

      // Save settings
      localStorage.setItem('prayer_settings_data', JSON.stringify(data.settings));
      
      // Save timestamp
      const now = new Date();
      localStorage.setItem('prayer_settings_last_saved', now.toISOString());
      setLastSaved(now);

      toast({
        title: t('prayers.settingsSaved'),
        description: t('prayers.settingsSavedSuccess'),
      });
      
      // Navigate back after a brief delay
      setTimeout(() => {
        navigate('/prayers');
      }, 1000);
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t('prayers.saveFailed'),
        description: error instanceof Error ? error.message : t('prayers.couldNotSaveSettings'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('prayers.prayerSettings')}</h1>
        <p className="text-muted-foreground">
          {t('prayers.configurePrayer')}
        </p>
        {lastSaved && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              {t('prayers.lastSaved')}: {lastSaved.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <CitySearchDialog
        open={showCitySearch}
        onOpenChange={setShowCitySearch}
        onCitySelect={handleCitySelect}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="location">
                <MapPin className="h-4 w-4 mr-2" />
                {t('prayers.location')}
              </TabsTrigger>
              <TabsTrigger value="method">
                <Settings className="h-4 w-4 mr-2" />
                {t('prayers.method')}
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Clock className="h-4 w-4 mr-2" />
                {t('prayers.preview')}
              </TabsTrigger>
            </TabsList>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('prayers.yourLocation')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('prayers.accurateLocationRequired')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCitySearch(true)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t('prayers.searchForCity', 'Search for City')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('prayers.latitude')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="24.7136"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location.longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('prayers.longitude')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="46.6753"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location.timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('prayers.timezone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Asia/Riyadh" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('prayers.timezoneDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('prayers.cityOptional')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Riyadh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('prayers.countryOptional')}</FormLabel>
                          <FormControl>
                            <Input placeholder="Saudi Arabia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Method Tab */}
            <TabsContent value="method" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('prayers.calculationMethod')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('prayers.calculationMethodDescription')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="settings.method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('prayers.calculationMethod')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('prayers.selectCalculationMethod')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="muslim-world-league">{t('prayers.muslimWorldLeague')}</SelectItem>
                            <SelectItem value="egyptian">{t('prayers.egyptianAuthority')}</SelectItem>
                            <SelectItem value="karachi">{t('prayers.universityKarachi')}</SelectItem>
                            <SelectItem value="umm-al-qura">{t('prayers.ummAlQura')}</SelectItem>
                            <SelectItem value="dubai">{t('prayers.dubai')}</SelectItem>
                            <SelectItem value="north-america">{t('prayers.northAmerica')}</SelectItem>
                            <SelectItem value="kuwait">{t('prayers.kuwait')}</SelectItem>
                            <SelectItem value="qatar">{t('prayers.qatar')}</SelectItem>
                            <SelectItem value="singapore">{t('prayers.singapore')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="settings.madhab"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('prayers.madhab')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('prayers.selectMadhab')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="shafi">{t('prayers.shafi')}</SelectItem>
                            <SelectItem value="hanafi">{t('prayers.hanafi')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('prayers.affectsAsrTime')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="settings.highLatitudeRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('prayers.highLatitudeRule')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('prayers.selectHighLatitudeRule')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="middle-of-the-night">{t('prayers.middleOfNight')}</SelectItem>
                            <SelectItem value="seventh-of-the-night">{t('prayers.seventhOfNight')}</SelectItem>
                            <SelectItem value="twilight-angle">{t('prayers.twilightAngle')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('prayers.highLatitudeDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Time Adjustments */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('prayers.prayerAdjustments')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('prayers.adjustmentsDescription')}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((prayer) => (
                    <FormField
                      key={prayer}
                      control={form.control}
                      name={`settings.adjustments.${prayer}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{t(`prayers.${prayer}`)}</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                min={-60}
                                max={60}
                                step={1}
                                value={[field.value || 0]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>-60 min</span>
                                <span>{field.value || 0} min</span>
                                <span>+60 min</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('prayers.prayerTimePreview')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('prayers.previewDescription')}
                  </p>
                </CardHeader>
                <CardContent>
                  {previewTimes ? (
                    <div className="grid gap-3">
                      {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight', 'tahajjud'] as Prayer[]).map((prayer) => (
                        previewTimes[prayer] && (
                          <div key={prayer} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="font-medium capitalize">{t(`prayers.${prayer}`)}</div>
                            <div className="text-lg font-mono">{previewTimes[prayer]}</div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>{t('prayers.loadingPrayerTimes')}</p>
                      <p className="text-sm">{t('prayers.configurePrayer')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/prayers')}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white"
              style={{ backgroundColor: '#dc2626' }}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('prayers.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('prayers.saveSettings')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default EnhancedPrayerSettingsPage;