import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProfileSyncBannerProps {
  onSignIn?: () => void;
  onDismiss?: () => void;
}

export function ProfileSyncBanner({ onSignIn, onDismiss }: ProfileSyncBannerProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconCircle}>
        <ThemedText style={{ fontSize: 20 }}>☁️</ThemedText>
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="smallBold">Sync your progress</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          Create an account to sync your progress across devices.
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onSignIn}
          style={[styles.signInButton, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: theme.background, fontSize: 13 }}>
            Sign In
          </ThemedText>
        </Pressable>
        <Pressable onPress={onDismiss} style={styles.dismissButton}>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    borderRadius: Spacing.three,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  actions: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  signInButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  dismissButton: {
    paddingVertical: Spacing.one,
  },
});