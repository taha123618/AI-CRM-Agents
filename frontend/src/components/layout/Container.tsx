import React from 'react';
import { useUIStore } from '@/stores/use-ui-store';
import { cn } from '@/lib/utils';

export function Container({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <main
      className={cn(
        'min-h-[calc(100vh-4rem)] p-6 transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-20'
      )}
    >
      <div className="max-w-7xl mx-auto space-y-6">{children}</div>
    </main>
  );
}
