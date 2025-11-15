// context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from storage
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Background colors
      background: isDarkMode ? '#0F172A' : '#F5F7FA',
      surface: isDarkMode ? '#1E293B' : '#FFFFFF',
      card: isDarkMode ? '#334155' : '#FFFFFF',
      
      // Text colors
      text: isDarkMode ? '#F1F5F9' : '#0F172A',
      textSecondary: isDarkMode ? '#CBD5E1' : '#64748B',
      textTertiary: isDarkMode ? '#94A3B8' : '#94A3B8',
      
      // Primary colors (purple)
      primary: '#6B46C1',
      primaryLight: isDarkMode ? '#8B5CF6' : '#7C3AED',
      primaryDark: '#5B21B6',
      
      // Border colors
      border: isDarkMode ? '#334155' : '#E2E8F0',
      borderLight: isDarkMode ? '#475569' : '#F1F5F9',
      
      // Status colors
      success: isDarkMode ? '#10B981' : '#059669',
      error: isDarkMode ? '#EF4444' : '#DC2626',
      warning: isDarkMode ? '#F59E0B' : '#D97706',
      info: isDarkMode ? '#3B82F6' : '#2563EB',
      
      // Shadow/Elevation
      shadow: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      
      // Input colors
      inputBackground: isDarkMode ? '#1E293B' : '#FFFFFF',
      inputBorder: isDarkMode ? '#475569' : '#E2E8F0',
      
      // Header colors
      header: isDarkMode ? '#1E293B' : '#6B46C1',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 40,
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      full: 9999,
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

