import React from 'react';
import { View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: Spacing.one, alignItems: 'center' }}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        let backgroundColor: string;
        if (isCompleted || isCurrent) {
          backgroundColor = theme.accent;
        } else {
          backgroundColor = theme.backgroundSelected;
        }

        return (
          <View
            key={i}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 2,
              backgroundColor,
              opacity: isCurrent ? 1 : isCompleted ? 0.7 : 0.4,
            }}
          />
        );
      })}
    </View>
  );
}

export const TOTAL_ONBOARDING_STEPS = 7;