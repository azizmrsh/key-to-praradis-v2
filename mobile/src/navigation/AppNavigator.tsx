import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';

import {RootStackParamList} from '../types/navigation';
import DashboardScreen from '../screens/DashboardScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import AssessmentChoiceScreen from '../screens/AssessmentChoiceScreen';
import ContentScreen from '../screens/ContentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SOSScreen from '../screens/SOSScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ManualSelectionScreen from '../screens/ManualSelectionScreen';
import GoalsChallengesScreen from '../screens/GoalsChallengesScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import PrayerSettingsScreen from '../screens/PrayerSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const {t} = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Assessment':
              iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
              break;
            case 'Content':
              iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            case 'SOS':
              iconName = focused ? 'shield-alert' : 'shield-alert-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      })}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{title: t('navigation.dashboard')}}
      />
      <Tab.Screen 
        name="Assessment" 
        component={AssessmentScreen}
        options={{title: t('navigation.assessment')}}
      />
      <Tab.Screen 
        name="Content" 
        component={ContentScreen}
        options={{title: t('navigation.content')}}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{title: t('navigation.profile')}}
      />
      <Tab.Screen 
        name="SOS" 
        component={SOSScreen}
        options={{title: 'SOS'}}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  // Start with splash screen first
  return (
    <Stack.Navigator 
      screenOptions={{headerShown: false}}
      initialRouteName="Splash"
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ManualSelection" component={ManualSelectionScreen} />
      <Stack.Screen name="AssessmentChoice" component={AssessmentChoiceScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Challenges" component={GoalsChallengesScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="PrayerSettings" component={PrayerSettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;