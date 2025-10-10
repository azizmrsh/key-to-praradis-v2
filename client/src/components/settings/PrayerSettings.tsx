import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coordinates } from 'adhan';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  getTimingName,
  getPrayerName,
  calculatePrayerTimes,
  formatPrayerTime,
  type PrayerSettings,
  type UserLocation,
  type NotificationPreference,
  type Prayer
} from '@/lib/prayerTimes';

import {
  checkNotificationPermission,
  requestNotificationPermission,
  scheduleAllPrayerNotifications
} from '@/lib/notificationService';

import { useToast } from '@/hooks/use-toast';

// Schema for the form
const formSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.string().min(1),
    city: z.string().optional(),
    country: z.string().optional(),
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
      fajr: z.number().optional(),
      sunrise: z.number().optional(),
      dhuhr: z.number().optional(),
      asr: z.number().optional(),
      maghrib: z.number().optional(),
      isha: z.number().optional(),
    }),
  }),
  notifications: z.array(
    z.object({
      prayer: z.enum([
        'fajr',
        'sunrise',
        'dhuhr',
        'asr',
        'maghrib',
        'isha',
        'midnight',
        'tahajjud'
      ]),
      enabled: z.boolean(),
      timing: z.enum(['at', 'before15', 'before30', 'after15', 'after30']),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface PrayerSettingsFormProps {
  initialLocation: UserLocation;
  initialSettings: PrayerSettings;
  initialNotifications: NotificationPreference[];
  onSave: (
    location: UserLocation,
    settings: PrayerSettings,
    notifications: NotificationPreference[]
  ) => void;
}

export function PrayerSettingsForm({
  initialLocation,
  initialSettings,
  initialNotifications,
  onSave,
}: PrayerSettingsFormProps) {
  const { toast } = useToast();
  const [previewTimes, setPreviewTimes] = useState<Record<Prayer, string> | null>(null);
  const [activeTab, setActiveTab] = useState('location');
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);
  
  // Check notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const result = await checkNotificationPermission();
      setHasNotificationPermission(result);
    };
    
    checkPermission();
  }, []);

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialLocation,
      settings: initialSettings,
      notifications: initialNotifications,
    },
  });

  // Watch form values for preview
  const watchedLocation = form.watch('location');
  const watchedSettings = form.watch('settings');

  // Generate preview prayer times when form values change
  React.useEffect(() => {
    try {
      const coordinates = new Coordinates(
        watchedLocation.latitude,
        watchedLocation.longitude
      );

      // Ensure adjustments is an object and not undefined
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

      // Format the times for display
      const formattedTimes: Record<Prayer, string> = {} as Record<Prayer, string>;
      
      (Object.keys(prayerTimes) as Prayer[]).forEach(prayer => {
        formattedTimes[prayer] = formatPrayerTime(
          prayerTimes[prayer],
          'h:mm a',
          watchedLocation.timezone
        );
      });

      setPreviewTimes(formattedTimes);
    } catch (error) {
      console.error('Error generating prayer time preview:', error);
    }
  }, [watchedLocation, watchedSettings]);

  // Submit handler
  const onSubmit = (data: FormValues) => {
    onSave(data.location, data.settings, data.notifications);
    toast({
      title: 'Settings saved',
      description: 'Your prayer time settings have been saved.',
    });
  };

  // Request notification permission
  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setHasNotificationPermission(true);
      toast({
        title: 'Notification Permission Granted',
        description: 'You will now receive prayer time notifications.',
      });
    } else {
      toast({
        title: 'Notification Permission Denied',
        description: 'You will not receive prayer time notifications.',
        variant: 'destructive',
      });
    }
  };
  
  // Location detection
  const detectLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: 'Detecting location',
        description: 'Please allow location access if prompted.',
      });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get timezone from browser
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          // Attempt to get city/country via reverse geocoding API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const country = data.address?.country || '';
            
            form.setValue('location', {
              latitude,
              longitude,
              timezone,
              city,
              country
            });
            
            toast({
              title: 'Location detected',
              description: `${city}, ${country}`,
            });
          } catch (error) {
            // If geocoding fails, just set coordinates and timezone
            form.setValue('location', {
              latitude,
              longitude,
              timezone
            });
            
            toast({
              title: 'Location detected',
              description: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location detection failed',
            description: 'Please enter your location manually.',
            variant: 'destructive',
          });
        }
      );
    } else {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support location detection.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="method">Calculation Method</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={detectLocation}
                    className="mb-4"
                  >
                    <span className="material-icons mr-2 text-sm">my_location</span>
                    Detect Location
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.0001"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            value={field.value}
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
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.0001"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            value={field.value}
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
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            'Asia/Riyadh',
                            'Europe/London',
                            'America/New_York',
                            'America/Chicago',
                            'America/Denver',
                            'America/Los_Angeles',
                            'Asia/Tokyo',
                            'Asia/Dubai',
                            'Australia/Sydney',
                            'Pacific/Auckland'
                          ].map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Country (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Calculation Method Tab */}
          <TabsContent value="method" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Calculation Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="settings.method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select calculation method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="muslim-world-league">Muslim World League</SelectItem>
                          <SelectItem value="egyptian">Egyptian General Authority</SelectItem>
                          <SelectItem value="karachi">University of Islamic Sciences, Karachi</SelectItem>
                          <SelectItem value="umm-al-qura">Umm al-Qura University, Makkah</SelectItem>
                          <SelectItem value="dubai">Islamic Affairs & Charitable Activities, Dubai</SelectItem>
                          <SelectItem value="north-america">Islamic Society of North America</SelectItem>
                          <SelectItem value="kuwait">Kuwait</SelectItem>
                          <SelectItem value="qatar">Qatar</SelectItem>
                          <SelectItem value="singapore">Singapore</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="settings.madhab"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Madhab (Asr calculation)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select madhab" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="shafi">Shafi'i, Maliki, Hanbali</SelectItem>
                            <SelectItem value="hanafi">Hanafi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="settings.highLatitudeRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>High Latitude Rule</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select high latitude rule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="middle-of-the-night">Middle of the Night</SelectItem>
                            <SelectItem value="seventh-of-the-night">Seventh of the Night</SelectItem>
                            <SelectItem value="twilight-angle">Twilight Angle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-base font-medium mb-2">Minute Adjustments</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fine-tune prayer times by adding or subtracting minutes.
                  </p>
                  
                  <div className="space-y-4">
                    {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((prayer) => (
                      <FormField
                        key={prayer}
                        control={form.control}
                        name={`settings.adjustments.${prayer}`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>{getPrayerName(prayer as Prayer)}</FormLabel>
                              <span className="text-sm font-medium">
                                {field.value || 0} min
                              </span>
                            </div>
                            <FormControl>
                              <Slider
                                defaultValue={[field.value || 0]}
                                min={-30}
                                max={30}
                                step={1}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Prayer Times Preview */}
            {previewTimes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Prayer Times Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {Object.entries(previewTimes).map(([prayer, time]) => (
                        <div 
                          key={prayer} 
                          className="flex justify-between items-center py-2 border-b border-neutral-200"
                        >
                          <span className="font-medium">{getPrayerName(prayer as Prayer)}</span>
                          <span>{time}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {!hasNotificationPermission && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Notification Permission Required</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      To receive prayer time notifications, you need to grant permission for this app to send notifications.
                    </p>
                    <Button 
                      type="button" 
                      onClick={handleRequestNotificationPermission}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <span className="material-icons text-sm">notifications</span>
                      <span>Enable Notifications</span>
                    </Button>
                  </div>
                )}
                
                <div className="space-y-6">
                  {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight', 'tahajjud'].map((prayer, index) => (
                    <div key={prayer} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`notifications.${index}.enabled`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>{getPrayerName(prayer as Prayer)}</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`notifications.${index}.timing`}
                        render={({ field }) => {
                          const notificationEnabled = form.watch(`notifications.${index}.enabled`);
                          return (
                            <FormItem className="ml-6 mt-2">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                  disabled={!notificationEnabled}
                                >
                                  {['at', 'before15', 'before30', 'after15', 'after30'].map((timing) => (
                                    <div key={timing} className="flex items-center space-x-2">
                                      <RadioGroupItem value={timing} id={`${prayer}-${timing}`} />
                                      <Label 
                                        htmlFor={`${prayer}-${timing}`}
                                        className={!notificationEnabled ? 'opacity-50' : ''}
                                      >
                                        {getTimingName(timing as any)}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white" style={{ backgroundColor: '#dc2626' }}>
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}