import React, { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export interface CollapsibleProps extends PropsWithChildren {
  title: string;
  defaultOpen?: boolean;
}

export function Collapsible({ children, title, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors, fonts } = useTheme();

  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Pressable
        style={({ pressed }) => [
          styles.heading,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: 2,
          },
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => setIsOpen((value) => !value)}
      >
        <View
          style={[
            styles.button,
            {
              transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
            },
          ]}
        >
          <ChevronRight size={16} color={colors.primary} />
        </View>

        <ThemedText
          type="smallBold"
          style={{
            flex: 1,
            color: colors.text,
            fontFamily: fonts.mono,
            fontSize: 12,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </ThemedText>
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(150)}
          style={[
            styles.content,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderTopWidth: 0,
            },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  button: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
    borderRadius: 2,
  },
});
