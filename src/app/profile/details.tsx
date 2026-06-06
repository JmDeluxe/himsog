import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditScreenLayout } from '@/components/edit-screen-layout';
import { FormField, UnitToggle, HeightInput, WeightInput } from '@/components/onboarding/onboarding-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { UnitSystem, Gender, GENDER_LABELS } from '@/services/onboarding';

const GENDERS: Gender[] = ['male', 'female', 'other'];

export default function ProfileDetailsScreen() {
  const theme = useTheme();
  const { data, updateData } = useOnboarding();

  return (
    <EditScreenLayout title="Personal Details">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>UNITS</ThemedText>
          <UnitToggle
            unitSystem={data.unitSystem}
            onToggle={(s: UnitSystem) => updateData({ unitSystem: s })}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>BASIC INFO</ThemedText>
          <FormField
            label="Username"
            value={data.username}
            onChangeText={(v) => updateData({ username: v })}
            placeholder="What should we call you?"
          />
          <FormField
            label="Age"
            value={data.age}
            onChangeText={(v) => updateData({ age: v })}
            placeholder="25"
            keyboardType="number-pad"
            suffix="years"
          />
          <View style={styles.genderSection}>
            <ThemedText type="smallBold" style={styles.fieldLabel}>Gender</ThemedText>
            <View style={styles.genderRow}>
              {GENDERS.map((g) => {
                const active = data.gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => updateData({ gender: g })}
                    style={[
                      styles.pillButton,
                      {
                        backgroundColor: active ? theme.accentBg : theme.backgroundElement,
                        borderColor: active ? theme.accent : theme.backgroundSelected,
                      },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: active ? theme.accent : theme.text, fontSize: 13 }}>
                      {GENDER_LABELS[g]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>MEASUREMENTS</ThemedText>
          <HeightInput
            unitSystem={data.unitSystem}
            valueCm={data.heightCm}
            onChangeCm={(v) => updateData({ heightCm: v })}
          />
          <WeightInput
            unitSystem={data.unitSystem}
            valueKg={data.weightKg}
            onChangeKg={(v) => updateData({ weightKg: v })}
            label="Current Weight"
          />
        </View>
      </ScrollView>
    </EditScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  fieldLabel: {
    fontSize: 13,
  },
  genderSection: {
    gap: Spacing.one,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pillButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});