import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingProvider, useOnboarding } from '@/hooks/use-onboarding';
import { AuthProvider } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.accent} />
    </View>
  );
}

function AppNavigator() {
  const { loading } = useOnboarding();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
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
            <Stack.Screen name="onboarding/preferences" />
            <Stack.Screen name="onboarding/target" />
      <Stack.Screen name="onboarding/summary" />
            <Stack.Screen name="auth/login" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="auth/register" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="auth/resolve" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="profile/goal" />
            <Stack.Screen name="profile/details" />
            <Stack.Screen name="profile/activity" />
            <Stack.Screen name="profile/experience" />
            <Stack.Screen name="profile/preferences" />
            <Stack.Screen name="profile/target" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <OnboardingProvider>
          <AppNavigator />
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}