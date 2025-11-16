// navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import AdminLoginScreen from '../screens/AdminLoginScreen';
import LoginScreen from '../screens/LoginScreen';
import UsageTrendsScreen from '../screens/UsageTrendsScreen';
import SystemDashboardScreen from '../screens/SystemDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UserNavigator from './UserNavigator';
import { signOut } from 'firebase/auth';
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { triggerHaptic } from '../utils/haptics';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  
  // This is the Tab Navigator from wireframes
  const handleLogout = async () => {
    try {
      triggerHaptic('medium');
      await signOut(auth);
      toast.showSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      triggerHaptic('error');
      toast.showError('Failed to logout');
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
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          paddingTop: theme.spacing.md,
          paddingBottom: Math.max(insets.bottom, theme.spacing.md),
          height: 65 + Math.max(insets.bottom - theme.spacing.sm, 0),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
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
  const [userRole, setUserRole] = useState(null); // 'admin' or 'student'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const subscriber = onAuthStateChanged(
        auth,
        async (user) => {
          setUser(user);
          
          // Check user role from token claims or email
          if (user) {
            try {
              const token = await user.getIdTokenResult(true); // Force refresh to get latest claims
              const isAdmin = token.claims.admin === true;
              const roleFromClaim = token.claims.role;
              
              // Email-based role determination (fallback if claims not set)
              const adminEmails = ['kiraneapen2006@gmail.com'];
              const userEmails = ['nateandbros@gmail.com'];
              const userEmail = user.email?.toLowerCase();
              
              let role;
              if (roleFromClaim) {
                role = roleFromClaim;
              } else if (isAdmin) {
                role = 'admin';
              } else if (adminEmails.includes(userEmail)) {
                role = 'admin';
              } else if (userEmails.includes(userEmail)) {
                role = 'student';
              } else {
                // Default to student if can't determine
                role = 'student';
              }
              
              console.log('AppNavigator - User email:', userEmail, 'Role:', role);
              setUserRole(role);
            } catch (error) {
              console.error('Error getting user role:', error);
              // Fallback to email check
              const adminEmails = ['kiraneapen2006@gmail.com'];
              const userEmail = user.email?.toLowerCase();
              setUserRole(adminEmails.includes(userEmail) ? 'admin' : 'student');
            }
          } else {
            setUserRole(null);
          }
          
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
          // Route based on user role
          userRole === 'admin' ? (
            <Stack.Screen name="AdminDashboard" component={DashboardTabs} />
          ) : (
            <Stack.Screen name="UserDashboard" component={UserNavigator} />
          )
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

