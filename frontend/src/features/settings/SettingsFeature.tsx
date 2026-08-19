import { useState } from 'react';
import { Shield, Globe, Download, Cpu, History, Sliders, UserCheck, Building2, Activity, SlidersHorizontal } from 'lucide-react';
import { UserManagementTab } from './components/UserManagementTab';
import { OrganizationsTab } from './components/OrganizationsTab';
import { ObservabilityMetricsTab } from './components/ObservabilityMetricsTab';
import { CustomFieldsTab } from './components/CustomFieldsTab';
import { WebhooksStudioTab } from './components/WebhooksStudioTab';
import { ImportExportStudioTab } from './components/ImportExportStudioTab';
import { TaskQueueMonitorTab } from './components/TaskQueueMonitorTab';
import { AuditTrailTab } from './components/AuditTrailTab';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';

type SettingsTab = 'rbac' | 'organizations' | 'observability' | 'custom-fields' | 'webhooks' | 'import-export' | 'tasks' | 'audits';

export function SettingsFeature() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('rbac');
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const tabs = [
    { id: 'rbac' as const, label: 'ACCESS CONTROL & RBAC', icon: Shield, badge: 'AUTH' },
    { id: 'organizations' as const, label: 'WORKSPACES & TENANCY', icon: Building2, badge: 'NEW' },
    { id: 'observability' as const, label: 'METRICS & OBSERVABILITY', icon: Activity, badge: 'LIVE' },
    { id: 'custom-fields' as const, label: 'CUSTOM FIELDS & SCHEMA', icon: SlidersHorizontal, badge: 'ETL' },
    { id: 'webhooks' as const, label: 'WEBHOOKS & APIS', icon: Globe, badge: '' },
    { id: 'import-export' as const, label: 'BULK IMPORT / EXPORT', icon: Download },
    { id: 'tasks' as const, label: 'TASK QUEUE & WORKERS', icon: Cpu, badge: 'ASYNC' },
    { id: 'audits' as const, label: 'COMPLIANCE AUDIT TRAIL', icon: History },
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <span>PLATFORM GOVERNANCE, INTEGRATIONS &amp; SECURITY</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase">
            ENTERPRISE RBAC PERMISSIONS, OUTBOUND WEBHOOKS, BULK ETL, ASYNC WORKERS, AND FORENSIC AUDIT LOGS.
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-none bg-background border border-border text-xs shrink-0 self-start md:self-auto font-mono">
            <UserCheck className={`w-4 h-4 ${isAdmin ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <span className="text-muted-foreground/60 block text-[9px] uppercase">ACTIVE SESSION</span>
              <span className="font-mono text-foreground text-xs font-bold uppercase">{currentUser.email}</span>
            </div>
            <Badge variant={isAdmin ? 'purple' : 'info'} className="text-[8px] font-mono uppercase ml-1">
              {currentUser.role}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-background p-2 border border-border font-mono">
        {tabs?.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase transition-none ${isActive
                  ? 'bg-primary text-primary-foreground border border-primary'
                  : 'bg-card text-muted-foreground hover:text-white border border-border'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[8px] px-1 py-0.2 rounded-none font-mono ${isActive ? 'bg-background text-primary font-bold' : 'bg-background text-muted-foreground border border-border'
                    }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="font-mono">
        {activeTab === 'rbac' && <UserManagementTab />}
        {activeTab === 'organizations' && <OrganizationsTab />}
        {activeTab === 'observability' && <ObservabilityMetricsTab />}
        {activeTab === 'custom-fields' && <CustomFieldsTab />}
        {activeTab === 'webhooks' && <WebhooksStudioTab />}
        {activeTab === 'import-export' && <ImportExportStudioTab />}
        {activeTab === 'tasks' && <TaskQueueMonitorTab />}
        {activeTab === 'audits' && <AuditTrailTab />}
      </div>
    </div>
  );
}
