import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { UnitSystem, cmToImperial, imperialToCm, kgToLbs, lbsToKg } from '@/services/onboarding';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'number-pad' | 'email-address';
  suffix?: string;
  error?: string;
  secureTextEntry?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  suffix,
  error,
  secureTextEntry,
}: FormFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.error : theme.backgroundSelected,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
        {suffix && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.suffix}>
            {suffix}
          </ThemedText>
        )}
      </View>
      {error && (
        <ThemedText type="small" style={{ color: theme.error, fontSize: 12 }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

interface UnitToggleProps {
  unitSystem: UnitSystem;
  onToggle: (system: UnitSystem) => void;
}

export function UnitToggle({ unitSystem, onToggle }: UnitToggleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundElement }]}>
      {(['metric', 'imperial'] as UnitSystem[]).map((system) => {
        const active = system === unitSystem;
        return (
          <Pressable
            key={system}
            onPress={() => onToggle(system)}
            style={[
              styles.toggleOption,
              {
                backgroundColor: active ? theme.accent : 'transparent',
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={{
                color: active ? theme.background : theme.textSecondary,
                fontSize: 13,
              }}>
              {system === 'metric' ? 'Metric' : 'Imperial'}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HeightInput({
  unitSystem,
  valueCm,
  onChangeCm,
}: {
  unitSystem: UnitSystem;
  valueCm: string;
  onChangeCm: (cm: string) => void;
}) {
  const theme = useTheme();

  if (unitSystem === 'imperial') {
    const { feet, inches } = valueCm
      ? cmToImperial(parseFloat(valueCm))
      : { feet: 0, inches: 0 };

    return (
      <View style={styles.field}>
        <ThemedText type="smallBold" style={styles.label}>Height</ThemedText>
        <View style={styles.feetRow}>
          <View
            style={[
              styles.inputContainer,
              styles.feetInput,
              { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
            ]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={feet ? String(feet) : ''}
              onChangeText={(v) => {
                const ft = parseFloat(v) || 0;
                onChangeCm(v === '' ? '' : String(imperialToCm(ft, inches)));
              }}
              placeholder="5"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.suffix}>ft</ThemedText>
          </View>
          <View
            style={[
              styles.inputContainer,
              styles.feetInput,
              { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
            ]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={inches ? String(Math.round(inches)) : ''}
              onChangeText={(v) => {
                const ins = parseFloat(v) || 0;
                onChangeCm(v === '' && feet === 0 ? '' : String(imperialToCm(feet, ins)));
              }}
              placeholder="9"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.suffix}>in</ThemedText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <FormField
      label="Height"
      value={valueCm}
      onChangeText={onChangeCm}
      placeholder="0"
      keyboardType="number-pad"
      suffix="cm"
    />
  );
}

export function WeightInput({
  unitSystem,
  valueKg,
  onChangeKg,
  label = 'Current Weight',
}: {
  unitSystem: UnitSystem;
  valueKg: string;
  onChangeKg: (kg: string) => void;
  label?: string;
}) {
  if (unitSystem === 'imperial') {
    const lbs = valueKg ? String(kgToLbs(parseFloat(valueKg))) : '';
    return (
      <FormField
        label={label}
        value={lbs}
        onChangeText={(v) => {
          const parsed = parseFloat(v);
          if (!isNaN(parsed) || v === '') {
            onChangeKg(v === '' ? '' : String(lbsToKg(parsed)));
          }
        }}
        placeholder="0"
        keyboardType="number-pad"
        suffix="lbs"
      />
    );
  }

  return (
    <FormField
      label={label}
      value={valueKg}
      onChangeText={onChangeKg}
      placeholder="0"
      keyboardType="number-pad"
      suffix="kg"
    />
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  suffix: {
    fontSize: 13,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feetRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  feetInput: {
    flex: 1,
  },
});