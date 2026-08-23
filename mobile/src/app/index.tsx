/**
 * Tactical Command Mobile Root Gate & Auth Dispatcher
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';

export default function RootIndex() {
  const { colors } = useTheme();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      await checkAuth();
      setIsReady(true);
    }
    init();
  }, [checkAuth]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user has active authenticated session, direct to Field Command, otherwise Login
  if (isAuthenticated) {
    return <Redirect href={'/(tabs)' as any} />;
  }

  return <Redirect href={'/(auth)/login' as any} />;
}
