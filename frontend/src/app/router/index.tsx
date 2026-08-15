import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
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
import { LanguagesPage } from '@/pages/LanguagesPage';
import { useUIStore, ActivePage } from '@/stores/use-ui-store';

function RouteSync() {
  const location = useLocation();
  const { setActivePage } = useUIStore();

  useEffect(() => {
    const rawPath = location.pathname.replace('/', '') || 'dashboard';
    const validPages: ActivePage[] = [
      'dashboard',
      'leads',
      'deals',
      'customers',
      'emails',
      'meetings',
      'analytics',
      'reports',
      'agents',
      'languages',
    ];
    const path: ActivePage = validPages.includes(rawPath as ActivePage)
      ? (rawPath as ActivePage)
      : 'dashboard';
    setActivePage(path);
  }, [location.pathname, setActivePage]);

  return null;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white flex flex-col justify-between">
      <div>
        <Sidebar />
        <Header />
        <Container>{children}</Container>
      </div>

      <Footer />

      {/* Global Modals */}
      <LeadModal />
      <DealModal />
      <EmailAnalyzerModal />
      <MeetingSchedulerModal />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteSync />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/emails" element={<EmailsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/languages" element={<LanguagesPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
