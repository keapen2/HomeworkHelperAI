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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  // This is the Tab Navigator from wireframes
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'HomeworkHelper AI',
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
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

