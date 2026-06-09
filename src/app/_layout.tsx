import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingProvider, useOnboarding } from '@/hooks/use-onboarding';
import { AuthProvider } from '@/hooks/use-auth';
import { FoodLogProvider } from '@/hooks/use-food-log';
import { ToastProvider } from '@/hooks/use-toast';
import { ThemeModeProvider, useThemeMode } from '@/hooks/use-theme-mode';
import { useTheme } from '@/hooks/use-theme';

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background, gap: 16 }}>
      <ThemedText type="title" style={{ fontSize: 32, lineHeight: 38 }}>Himsog</ThemedText>
      <ThemedText themeColor="textSecondary" style={{ fontSize: 14 }}>Smart Fitness</ThemedText>
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
            <Stack.Screen name="food-log" />
            <Stack.Screen name="settings" />
    </Stack>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolved } = useThemeMode();
  return (
    <ThemeProvider value={resolved === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeModeProvider>
        <ThemeWrapper>
          <AnimatedSplashOverlay />
          <AuthProvider>
            <OnboardingProvider>
              <FoodLogProvider>
                <ToastProvider>
                  <AppNavigator />
                </ToastProvider>
              </FoodLogProvider>
            </OnboardingProvider>
          </AuthProvider>
        </ThemeWrapper>
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}