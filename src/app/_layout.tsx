import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingProvider } from '@/hooks/use-onboarding';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <OnboardingProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/goal" />
          <Stack.Screen name="onboarding/details" />
          <Stack.Screen name="onboarding/activity" />
          <Stack.Screen name="onboarding/experience" />
          <Stack.Screen name="onboarding/target" />
          <Stack.Screen name="onboarding/summary" />
        </Stack>
      </OnboardingProvider>
    </ThemeProvider>
  );
}