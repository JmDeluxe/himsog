import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { FormField } from '@/components/onboarding/onboarding-form';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { isAuthAvailable } from '@/services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { markSynced } = useOnboarding();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthAvailable()) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText style={styles.emoji}>⚠️</ThemedText>
            <ThemedText type="subtitle" style={styles.title}>Auth not configured</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Set up Supabase to enable account creation. Check your .env file.
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <SecondaryButton label="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Don\'t Match', 'Please make sure both passwords match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      await markSynced();
      toast.show({ message: 'Account created & synced!', type: 'success' });
      Alert.alert(
        'Account Created',
        'Your account has been created and your progress has been synced to the cloud.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message ?? 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.keyboardAvoid}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ThemedText style={styles.emoji}>🚀</ThemedText>
              <ThemedText type="subtitle" style={styles.title}>Create your account</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Sync your fitness progress across all your devices.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
              />
              <FormField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                secureTextEntry
              />
              <FormField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
              />
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                label={loading ? 'Creating account...' : 'Create Account'}
                onPress={handleSignUp}
                disabled={loading}
              />
              <View style={{ height: Spacing.two }} />
              <SecondaryButton
                label="Already have an account? Sign In"
                onPress={() => router.back()}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  emoji: {
    fontSize: 48,
    lineHeight: 60,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
  form: {
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  actions: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
});