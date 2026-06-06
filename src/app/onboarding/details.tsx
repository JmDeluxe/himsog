import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { StepLayout } from '@/components/onboarding/step-layout';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { FormField, UnitToggle, HeightInput, WeightInput } from '@/components/onboarding/onboarding-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { UnitSystem, GENDER_LABELS, Gender } from '@/services/onboarding';
import { Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const GENDERS: Gender[] = ['male', 'female', 'other'];

export default function DetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData } = useOnboarding();

  const isValid =
    data.username.trim().length > 0 &&
    data.age && parseInt(data.age) > 0 &&
    data.gender &&
    data.heightCm && parseFloat(data.heightCm) > 0 &&
    data.weightKg && parseFloat(data.weightKg) > 0;

  const handleContinue = () => {
    if (isValid) {
      router.push('/onboarding/activity');
    }
  };

  return (
    <StepLayout currentStep={2}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Tell us about yourself
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          We'll use this to personalize your plan.
        </ThemedText>
      </View>

      <UnitToggle
        unitSystem={data.unitSystem}
        onToggle={(s: UnitSystem) => updateData({ unitSystem: s })}
      />

      <FormField
        label="Username"
        value={data.username}
        onChangeText={(v) => updateData({ username: v })}
        placeholder="What should we call you?"
        keyboardType="default"
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
        <ThemedText type="smallBold" style={{ fontSize: 13 }}>Gender</ThemedText>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const active = data.gender === g;
            return (
              <Pressable
                key={g}
                onPress={() => updateData({ gender: g })}
                style={[
                  styles.genderButton,
                  {
                    backgroundColor: active ? theme.accentBg : theme.backgroundElement,
                    borderColor: active ? theme.accent : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{
                    color: active ? theme.accent : theme.text,
                    fontSize: 13,
                  }}>
                  {GENDER_LABELS[g]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

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

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!isValid} />
        <View style={{ height: Spacing.two }} />
        <SecondaryButton label="Back" onPress={() => router.back()} />
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  genderSection: {
    gap: Spacing.one,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    marginTop: 'auto',
  },
});