import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton, SecondaryButton } from '@/components/onboarding/onboarding-buttons';
import { FormField } from '@/components/onboarding/onboarding-form';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useToast } from '@/hooks/use-toast';
import { isAuthAvailable, loadProfileFromCloud, cloudProfileToLocal, mergeCloudToLocal } from '@/services/auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { data: localData, refreshData, markSynced } = useOnboarding();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthAvailable()) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText style={styles.emoji}>⚠️</ThemedText>
            <ThemedText type="subtitle" style={styles.title}>Auth not configured</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Set up Supabase to enable sign in. Check your .env file.
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <SecondaryButton label="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const hasCloud = await signIn(email.trim(), password);
      if (hasCloud) {
        if (localData.isSynced) {
          await mergeCloudToLocal();
          await refreshData();
          await markSynced();
          toast.show({ message: 'Signed in & synced!', type: 'success' });
          router.replace('/');
        } else {
          const profile = await loadProfileFromCloud();
          if (profile) {
            const cloudConverted = cloudProfileToLocal(profile);
            const isSame = Object.keys(cloudConverted).every((key) => {
              const k = key as keyof typeof cloudConverted;
              const localVal = JSON.stringify((localData as any)[k]);
              const cloudVal = JSON.stringify(cloudConverted[k]);
              return localVal === cloudVal;
            });
            if (isSame) {
              await mergeCloudToLocal();
              await refreshData();
              await markSynced();
              toast.show({ message: 'Signed in & synced!', type: 'success' });
              router.replace('/');
            } else {
              router.replace('/auth/resolve');
            }
          } else {
            router.replace('/');
          }
        }
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message ?? 'Invalid email or password.');
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
              <ThemedText style={styles.emoji}>👋</ThemedText>
              <ThemedText type="subtitle" style={styles.title}>Welcome back</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Sign in to sync your progress across devices.
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
                placeholder="Your password"
                secureTextEntry
              />
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                label={loading ? 'Signing in...' : 'Sign In'}
                onPress={handleSignIn}
                disabled={loading}
              />
              <View style={{ height: Spacing.two }} />
              <SecondaryButton
                label="Create an Account"
                onPress={() => router.push('/auth/register')}
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