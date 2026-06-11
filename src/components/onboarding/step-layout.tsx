import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressIndicator, TOTAL_ONBOARDING_STEPS } from './progress-indicator';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface StepLayoutProps {
  currentStep: number;
  children: React.ReactNode;
  showProgress?: boolean;
  scrollable?: boolean;
}

export function StepLayout({
  currentStep,
  children,
  showProgress = true,
  scrollable = true,
}: StepLayoutProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const stepNumber = currentStep;

  const content = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showProgress && (
        <View style={[styles.progressContainer, { paddingTop: Math.max(insets.top, Spacing.three) + Spacing.three }]}>
          <ProgressIndicator currentStep={stepNumber} totalSteps={TOTAL_ONBOARDING_STEPS} />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (scrollable) {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  progressContainer: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  content: {
    flex: 1,
    gap: Spacing.three,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
});