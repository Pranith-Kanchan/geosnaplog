import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { PhotoProvider } from './context/PhotoContext';


const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <PhotoProvider>
          <AppNavigator />
        </PhotoProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;