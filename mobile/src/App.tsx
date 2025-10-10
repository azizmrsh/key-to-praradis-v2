import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar} from 'react-native';

import {UserProvider} from './contexts/UserContext';
import {SelfAssessmentProvider} from './contexts/SelfAssessmentContext';
import {LanguageProvider} from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';
import {theme} from './theme/theme';
import './i18n';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <LanguageProvider>
            <UserProvider>
              <SelfAssessmentProvider>
                <NavigationContainer>
                  <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                  <AppNavigator />
                </NavigationContainer>
              </SelfAssessmentProvider>
            </UserProvider>
          </LanguageProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;