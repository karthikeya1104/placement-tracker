// app/navigation/BottomTabs.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import RegisteredScreen from '../screens/RegisteredScreen';
import AllDrivesScreen from '../screens/AllDrivesScreen';
import DriveDetailScreen from '../screens/DriveDetailScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AddMessageScreen from '../screens/AddMessageScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SetupApiKeyScreen from '../screens/SetupApiKeyScreen';

import { useThemeContext } from '../context/ThemeContext';

// Stack param list for drives
type DriveStackParamList = {
  List: undefined;
  DriveDetail: { drive: any };
  Settings: undefined;
  SetupApiKey: undefined;
};

// Helper: Generic stack for drives
function createDriveStack(initialScreen: React.ComponentType<any>, title: string) {
  const Stack = createNativeStackNavigator<DriveStackParamList>();

  return function DriveStack() {
    const { mode } = useThemeContext();

    return (
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTransparent: false,
          headerStyle: {
            backgroundColor: mode === 'dark' ? '#1C1C1E' : '#F9F9F9',
            borderBottomWidth: 0,
            shadowColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 4,
          },
          headerTintColor: mode === 'dark' ? '#FFFFFF' : '#000000',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: mode === 'dark' ? '#FFFFFF' : '#000000',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 15 }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={mode === 'dark' ? '#FFFFFF' : '#007AFF'}
              />
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen name="List" component={initialScreen} options={{ title }} />
        <Stack.Screen name="DriveDetail" component={DriveDetailScreen} options={{ title: 'Drive Details' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen
          name="SetupApiKey"
          component={SetupApiKeyScreen}
          options={{ title: 'API Key', presentation: 'modal' }}
        />
      </Stack.Navigator>
    );
  };
}

// Helper: Single screen stack
function createSingleScreenStack(Screen: React.ComponentType<any>, title: string) {
  const Stack = createNativeStackNavigator();

  return function SingleScreenStack() {
    const { mode } = useThemeContext();

    return (
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTransparent: false,
          headerStyle: {
            backgroundColor: mode === 'dark' ? '#1C1C1E' : '#F9F9F9',
            borderBottomWidth: 0,
            shadowColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 4,
          },
          headerTintColor: mode === 'dark' ? '#FFFFFF' : '#000000',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: mode === 'dark' ? '#FFFFFF' : '#000000',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{ marginRight: 15 }}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={mode === 'dark' ? '#FFFFFF' : '#007AFF'}
              />
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen name={title} component={Screen} options={{ title }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen
          name="SetupApiKey"
          component={SetupApiKeyScreen}
          options={{ title: 'API Key', presentation: 'modal' }}
        />
      </Stack.Navigator>
    );
  };
}

// Bottom Tabs
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { mode } = useThemeContext();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'RegisteredTab':
              iconName = 'checkmark-circle';
              break;
            case 'AllDrives':
              iconName = 'list';
              break;
            case 'AnalyticsTab':
              iconName = 'bar-chart';
              break;
            case 'AddMessageTab':
              iconName = 'add-circle';
              size += 6; // slightly larger for FAB effect
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: mode === 'dark' ? '#A0A0A0' : '#8E8E93',
        tabBarStyle: {
          backgroundColor: mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
          borderTopWidth: 0,
        },
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
