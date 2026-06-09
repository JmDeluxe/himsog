import { useThemeMode } from '@/hooks/use-theme-mode';
import { Colors } from '@/constants/theme';

export function useTheme() {
  const { resolved } = useThemeMode();
  return Colors[resolved];
}