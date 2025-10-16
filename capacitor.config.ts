import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rutab.keystoparadise',
  appName: 'Keys To Paradise',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  plugins: {
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF'
    }
  }
};

export default config;
