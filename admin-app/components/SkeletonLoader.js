// components/SkeletonLoader.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SkeletonLoader = ({ 
  type = 'card', 
  width = '100%', 
  height = 100, 
  borderRadius = 12,
  style 
}) => {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const getStyles = () => {
    switch (type) {
      case 'card':
        return {
          width,
          height,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.md,
        };
      case 'list':
        return {
          width,
          height,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.sm,
        };
      case 'chart':
        return {
          width,
          height,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.lg,
        };
      case 'text':
        return {
          width,
          height: 16,
          borderRadius: theme.borderRadius.sm,
          marginBottom: theme.spacing.xs,
        };
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  const styles = getStyles();

  return (
    <View style={[styles, { overflow: 'hidden', backgroundColor: theme.colors.borderLight }, style]}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          transform: [{ translateX }],
          opacity,
        }}
      />
    </View>
  );
};

export const SkeletonCard = ({ style }) => (
  <SkeletonLoader type="card" height={120} style={style} />
);

export const SkeletonList = ({ count = 5, style }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonLoader 
        key={index} 
        type="list" 
        height={60} 
        style={[{ marginBottom: 8 }, style]} 
      />
    ))}
  </>
);

export const SkeletonChart = ({ style }) => (
  <SkeletonLoader type="chart" height={240} style={style} />
);

export const SkeletonText = ({ lines = 3, style }) => (
  <>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader 
        key={index} 
        type="text" 
        width={index === lines - 1 ? '80%' : '100%'}
        style={[{ marginBottom: 8 }, style]} 
      />
    ))}
  </>
);

export default SkeletonLoader;

