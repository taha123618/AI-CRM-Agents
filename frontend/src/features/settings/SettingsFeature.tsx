import { useState } from 'react';
import { Shield, Globe, Download, Cpu, History, Sliders, UserCheck } from 'lucide-react';
import { UserManagementTab } from './components/UserManagementTab';
import { WebhooksStudioTab } from './components/WebhooksStudioTab';
import { ImportExportStudioTab } from './components/ImportExportStudioTab';
import { TaskQueueMonitorTab } from './components/TaskQueueMonitorTab';
import { AuditTrailTab } from './components/AuditTrailTab';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';

type SettingsTab = 'rbac' | 'webhooks' | 'import-export' | 'tasks' | 'audits';

export function SettingsFeature() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('rbac');
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const tabs = [
    { id: 'rbac' as const, label: 'Access Control & RBAC', icon: Shield, badge: 'Auth' },
    { id: 'webhooks' as const, label: 'Webhooks & APIs', icon: Globe, badge: 'Live' },
    { id: 'import-export' as const, label: 'Bulk Import / Export', icon: Download },
    { id: 'tasks' as const, label: 'Task Queue & Workers', icon: Cpu, badge: 'Async' },
    { id: 'audits' as const, label: 'Compliance Audit Trail', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-brand-400" />
            Platform Governance, Integrations & Security
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise RBAC permissions, outbound webhooks, bulk ETL migration, async task workers, and forensic audit logs.
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shrink-0 self-start md:self-auto">
            <UserCheck className={`w-4 h-4 ${isAdmin ? 'text-brand-400' : 'text-slate-400'}`} />
            <div>
              <span className="text-slate-400 block text-[10px]">Active Session</span>
              <span className="font-mono text-slate-200 font-medium">{currentUser.email}</span>
            </div>
            <Badge variant={isAdmin ? 'purple' : 'info'} className="text-[10px] font-mono uppercase ml-1">
              {currentUser.role}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-2">
        {tabs?.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-brand-400'
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
      <div className="animate-in fade-in duration-200">
        {activeTab === 'rbac' && <UserManagementTab />}
        {activeTab === 'webhooks' && <WebhooksStudioTab />}
        {activeTab === 'import-export' && <ImportExportStudioTab />}
        {activeTab === 'tasks' && <TaskQueueMonitorTab />}
        {activeTab === 'audits' && <AuditTrailTab />}
      </div>
    </div>
  );
}
