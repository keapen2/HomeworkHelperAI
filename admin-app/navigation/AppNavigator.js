// navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import AdminLoginScreen from '../screens/AdminLoginScreen';
import UsageTrendsScreen from '../screens/UsageTrendsScreen';
import SystemDashboardScreen from '../screens/SystemDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { signOut } from 'firebase/auth';
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  const theme = useTheme();
  
  // This is the Tab Navigator from wireframes
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: 'HomeworkHelper AI',
        headerStyle: {
          backgroundColor: theme.colors.header,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          color: '#fff',
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: -0.3,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginRight: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.2 }}>
              Logout
            </Text>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Usage Trends" 
        component={UsageTrendsScreen}
        options={{
          tabBarLabel: 'Usage Trends',
        }}
      />
      <Tab.Screen 
        name="System Dashboard" 
        component={SystemDashboardScreen}
        options={{
          tabBarLabel: 'System Dashboard',
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
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const subscriber = onAuthStateChanged(
        auth,
        (user) => {
          setUser(user);
          setLoading(false);
        },
        (error) => {
          console.error('Auth state error:', error);
          setLoading(false);
        }
      );

      return subscriber; // unsubscribe on unmount
    } catch (error) {
      console.error('Navigation setup error:', error);
      setLoading(false);
    }
  }, []);

  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Dashboard" component={DashboardTabs} />
        ) : (
          <Stack.Screen name="Login" component={AdminLoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

