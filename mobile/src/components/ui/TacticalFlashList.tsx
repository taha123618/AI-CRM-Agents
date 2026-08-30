/**
 * Tactical Command Reusable FlashList Component
 * High-performance list virtualization powered by @shopify/flash-list v2
 */

import React from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { View, Text, RefreshControl, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface TacticalFlashListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  data: readonly T[] | null | undefined;
  renderItem: FlashListProps<T>['renderItem'];
  isLoading?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyIcon?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function TacticalFlashList<T>({
  data,
  renderItem,
  isLoading = false,
  onRefresh,
  emptyTitle = 'No Items Found',
  emptySubtitle = 'Try adjusting your filters or search query.',
  emptyIcon,
  contentContainerStyle,
  ...props
}: TacticalFlashListProps<T>) {
  const { colors, fonts } = useTheme();

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 50, paddingHorizontal: 20 }}>
            {emptyIcon && <View style={{ marginBottom: 12 }}>{emptyIcon}</View>}
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' }}>
              {emptyTitle}
            </Text>
            {emptySubtitle ? (
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, fontFamily: fonts.mono, textAlign: 'center' }}>
                {emptySubtitle}
              </Text>
            ) : null}
          </View>
        ) : null
      }
      {...props}
    />
  );
}
