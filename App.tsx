import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './tabs/home';
import SettingsScreen from './tabs/settings';
import plan from './tabs/plan';
import WorkScreen from './tabs/work';
import { initializeLockInFolder } from './utils/fileSystem';

const Colors = {
  light: {
    background: '#ffffff',
    text: '#000000',
    button: '#007AFF',
    buttonText: '#ffffff',
    tabBar: '#f8f8f8',
    tabBarActive: '#007AFF',
    tabBarInactive: '#8E8E93',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    button: '#0A84FF',
    buttonText: '#ffffff',
    tabBar: '#1c1c1e',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#8E8E93',
  },
};

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    initializeLockInFolder().catch((error) => {
      console.error('Failed to initialize LockIn folder:', error);
    });
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'home';
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
          },
          headerStyle: {
            backgroundColor: theme.tabBar,
          },
          headerTintColor: theme.text,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen 
          name="Work" 
          component={WorkScreen}
          options={{
            tabBarLabel: 'Work',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={plan}
          options={{
            tabBarLabel: 'Plan',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}