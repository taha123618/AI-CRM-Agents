import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  );
}

export { QueryProvider } from './QueryProvider';
export { ToastProvider, useToast } from './ToastProvider';
