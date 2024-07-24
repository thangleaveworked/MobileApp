// index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//Code cũ trước 5/7/2024

// import HomeScreen from './HomeScreen';
// import CameraScreen from './CameraScreen';
// import ListPhotosScreen from './ListPhotosScreen';
// import ResponseScreen from './responseScreen';


// ==================Code mới sau 5/7/2024==================
import AuthScreen from './AuthScreen';

import ScreenOverView from './ScreenOverview';
import ScreenAddTransaction from './ScreenAddTransaction';
import CameraScreen from './CameraScreen';
import ListPhotosScreen from './ListPhotosScreen';
import ExpenseCategoriesScreen from './ExpenseCategoriesScreen';
import NewGroupScreen from './NewGroupScreen';
import IconSelectionScreen from './IconSelectionScreen';

import DetailTransaction from './DetailTransaction';
import EditDetailTransaction from './EditDetailTransaction';
import AddNoteScreen from './AddNoteScreen';
import AddDescription from './AddDescription';
import NotificationScreen from './NotificationScreen';
import ScreenAccountManagement from './ScreenAccountManagement';
import ForgotPasswordScreen from './ForgotPasswordScreen';

import xacthucvantay from './xacthucvantay';



const Stack = createStackNavigator();

// ==================Code mới sau 5/7/2024==================
const App = () => {
  return (
    // <NavigationContainer>
    <Stack.Navigator>
      {/* <Stack.Screen name="xacthucvantay" component={xacthucvantay} options={{ headerShown: false }} /> */}

      <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScreenOverView" component={ScreenOverView} options={{ headerShown: false}} />
      <Stack.Screen name="ScreenAddTransaction" component={ScreenAddTransaction} options={{ headerShown: false }} />
      <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListPhotosScreen" component={ListPhotosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailTransaction" component={DetailTransaction} options={{ headerShown: false }} />
      <Stack.Screen name="EditDetailTransaction" component={EditDetailTransaction} options={{ headerShown: false }} />
      <Stack.Screen name="ExpenseCategoriesScreen" component={ExpenseCategoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NewGroupScreen" component={NewGroupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IconSelectionScreen" component={IconSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddNoteScreen" component={AddNoteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddDescription" component={AddDescription} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScreenAccountManagement" component={ScreenAccountManagement} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      
      {/* <Stack.Screen name="Settings" component={HomeScreen}/> */}
    </Stack.Navigator>
    // </NavigationContainer>
  );
};

export default App;
