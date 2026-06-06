import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { isAuthAvailable, syncOnboardingToCloud } from '@/services/auth';
import { useOnboarding } from '@/hooks/use-onboarding';

interface EditScreenLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function EditScreenLayout({ title, children }: EditScreenLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { markSynced } = useOnboarding();

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (user && isAuthAvailable()) {
      try {
        await syncOnboardingToCloud();
        await markSynced();
      } catch (e: any) {
        Alert.alert('Sync Failed', e.message ?? 'Could not sync to cloud.');
        return;
      }
    }
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.backgroundSelected }]}>
        <Pressable onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.headerButton}>
          <ThemedText style={{ fontSize: 28, lineHeight: 32, color: theme.text }}>‹</ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={styles.headerTitle}>{title}</ThemedText>
        <Pressable onPress={handleSave} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.headerButton}>
          <ThemedText type="smallBold" style={{ color: theme.accent, fontSize: 16 }}>Save</ThemedText>
        </Pressable>
      </View>
      {children}
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
    paddingTop: 30 + Spacing.two,
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
});