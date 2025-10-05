import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import RegisteredScreen from '../screens/RegisteredScreen';
import AllDrivesScreen from '../screens/AllDrivesScreen';
import DriveDetailScreen from '../screens/DriveDetailScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AddMessageScreen from '../screens/AddMessageScreen';

// Stack param list for screens that navigate to DriveDetail
type DriveStackParamList = {
  List: undefined;
  DriveDetail: { drive: any };
};

// Generic stack for tabs that list drives
function createDriveStack(initialScreen: React.ComponentType<any>, title: string) {
  const Stack = createNativeStackNavigator<DriveStackParamList>();
  return function DriveStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="List" component={initialScreen} options={{ title }} />
        <Stack.Screen name="DriveDetail" component={DriveDetailScreen} options={{ title: 'Drive Details' }} />
      </Stack.Navigator>
    );
  };
}

// Simple stack wrapper for single screens
function createSingleScreenStack(Screen: React.ComponentType<any>, title: string) {
  const Stack = createNativeStackNavigator();
  return function SingleScreenStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name={title} component={Screen} options={{ title }} />
      </Stack.Navigator>
    );
  };
}

// Do NOT include NavigationContainer here
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'HomeTab': iconName = 'home'; break;
            case 'RegisteredTab': iconName = 'checkmark-circle'; break;
            case 'AllDrives': iconName = 'list'; break;
            case 'AnalyticsTab': iconName = 'bar-chart'; break;
            case 'AddMessageTab': iconName = 'add-circle'; break;
            default: iconName = 'ellipse';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="HomeTab" component={createDriveStack(HomeScreen, 'Home')} />
      <Tab.Screen name="RegisteredTab" component={createDriveStack(RegisteredScreen, 'Registered')} />
      <Tab.Screen name="AddMessageTab" component={createSingleScreenStack(AddMessageScreen, 'Add Message')} />
      <Tab.Screen name="AllDrives" component={createDriveStack(AllDrivesScreen, 'All Drives')} />
      <Tab.Screen name="AnalyticsTab" component={createSingleScreenStack(AnalyticsScreen, 'Analytics')} />
    </Tab.Navigator>
  );
}
