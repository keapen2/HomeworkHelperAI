// navigation/UserNavigator.js
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { triggerHaptic } from '../utils/haptics';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import AskAIScreen from '../screens/user/AskAIScreen';
import HistoryScreen from '../screens/user/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function UserNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

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
      screenOptions={{
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
      }}
    >
      <Tab.Screen 
        name="Ask AI" 
        component={AskAIScreen}
        options={{
          tabBarLabel: 'Ask AI',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📚</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

