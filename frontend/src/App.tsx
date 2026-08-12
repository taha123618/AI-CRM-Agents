import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from '@/stores/use-ui-store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { LeadModal } from '@/components/forms/LeadModal';
import { DealModal } from '@/components/forms/DealModal';
import { EmailAnalyzerModal } from '@/components/forms/EmailAnalyzerModal';
import { MeetingSchedulerModal } from '@/components/forms/MeetingSchedulerModal';

import { DashboardPage } from '@/pages/DashboardPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { DealsPage } from '@/pages/DealsPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { EmailsPage } from '@/pages/EmailsPage';
import { MeetingsPage } from '@/pages/MeetingsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AgentsPage } from '@/pages/AgentsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10000,
    },
  },
});

export function App() {
  const { activePage } = useUIStore();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'leads':
        return <LeadsPage />;
      case 'deals':
        return <DealsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'emails':
        return <EmailsPage />;
      case 'meetings':
        return <MeetingsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'agents':
        return <AgentsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
        <Sidebar />
        <Header />
        <Container>{renderPage()}</Container>

        {/* Global Modals */}
        <LeadModal />
        <DealModal />
        <EmailAnalyzerModal />
        <MeetingSchedulerModal />
      </div>
    </QueryClientProvider>
  );
}

export default App;
