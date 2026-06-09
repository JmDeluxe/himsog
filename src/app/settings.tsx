import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { useOnboarding } from '@/hooks/use-onboarding';
import { UnitSystem } from '@/services/onboarding';

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

const UNIT_OPTIONS = [
  { value: 'metric' as const, label: 'Metric (kg, cm)' },
  { value: 'imperial' as const, label: 'Imperial (lbs, ft)' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, setMode } = useThemeMode();
  const { data, updateData } = useOnboarding();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.backgroundSelected, paddingTop: insets.top + Spacing.two }]}>
        <Pressable onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.headerButton}>
          <ThemedText style={{ fontSize: 28, lineHeight: 32, color: theme.text }}>‹</ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={styles.headerTitle}>Settings</ThemedText>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>APPEARANCE</ThemedText>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setMode(opt.value)}
                  style={[styles.themePill, {
                    backgroundColor: active ? theme.accent : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  }]}>
                  <ThemedText type="smallBold" style={{ color: active ? theme.background : theme.text }}>
                    {opt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>UNITS</ThemedText>
          <View style={styles.themeRow}>
            {UNIT_OPTIONS.map((opt) => {
              const active = data.unitSystem === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => updateData({ unitSystem: opt.value })}
                  style={[styles.themePill, {
                    backgroundColor: active ? theme.accent : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  }]}>
                  <ThemedText type="smallBold" style={{ color: active ? theme.background : theme.text }}>
                    {opt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.five,
  },
  section: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themePill: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});