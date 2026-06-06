import { Redirect } from 'expo-router';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export default function IndexScreen() {
  const { isOnboarded, loading } = useOnboarding();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}