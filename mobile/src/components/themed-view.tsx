import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();
  const colorKey = (type ?? 'background') as keyof typeof colors;
  const bgColor = colors[colorKey] || colors.background;

  return <View style={[{ backgroundColor: bgColor }, style]} {...otherProps} />;
}
