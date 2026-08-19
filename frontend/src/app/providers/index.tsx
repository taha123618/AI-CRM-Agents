import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';
import { ThemeProvider } from './theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export { QueryProvider } from './QueryProvider';
export { ToastProvider, useToast } from './ToastProvider';

export { ThemeProvider, useTheme } from './theme-provider';
