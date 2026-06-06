import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface OptionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, description, icon, selected, onPress }: OptionCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <ThemedView
        style={[
          styles.card,
          {
            backgroundColor: selected ? theme.accentBg : theme.backgroundElement,
            borderColor: selected ? theme.accent : theme.backgroundSelected,
          },
        ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <ThemedText
            type="smallBold"
            style={{ color: selected ? theme.accent : theme.text }}>
            {label}
          </ThemedText>
          {description && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.description}>
              {description}
            </ThemedText>
          )}
        </View>
        <View
          style={[
            styles.radio,
            {
              borderColor: selected ? theme.accent : theme.backgroundSelected,
              backgroundColor: selected ? theme.accent : 'transparent',
            },
          ]}>
          {selected && <View style={[styles.radioInner, { backgroundColor: theme.background }]} />}
        </View>
      </ThemedView>
    </Pressable>
  );
}

import { View } from 'react-native';

const styles = StyleSheet.create({
  pressable: {
    borderRadius: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    gap: Spacing.three,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: Spacing.one,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});