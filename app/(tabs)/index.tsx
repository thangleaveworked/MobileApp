// index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import CameraScreen from './CameraScreen';
import ListPhotosScreen from './ListPhotosScreen';
const Stack = createStackNavigator();

const App = () => {
  return (
    // <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListPhotos" component={ListPhotosScreen} options={{ headerShown: false }} />

      {/* <Stack.Screen name="Settings" component={HomeScreen}/> */}
    </Stack.Navigator>
    // </NavigationContainer>
  );
};

export default App;
