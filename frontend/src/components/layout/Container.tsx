import React from 'react';
import { useUIStore } from '@/stores/use-ui-store';
import { cn } from '@/lib/utils';

export function Container({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <main
      className={cn(
        'min-h-[calc(100vh-4rem)] p-3 sm:p-4 md:p-6 transition-none',
        sidebarOpen ? 'md:ml-64' : 'md:ml-16',
        'ml-0'
      )}
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
    </main>
  );
}
