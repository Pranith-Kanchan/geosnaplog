import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { PhotoProvider } from './context/PhotoContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <PhotoProvider>
        <AppNavigator />
      </PhotoProvider>
    </SafeAreaProvider>
  );
};

export default App;