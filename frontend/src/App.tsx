import { useEffect } from 'react';
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useUIStore } from '@/stores/use-ui-store';

export function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
