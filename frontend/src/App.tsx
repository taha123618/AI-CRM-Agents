import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ThemeToggle } from '@/components/theme-toggle';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <ThemeToggle />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;

