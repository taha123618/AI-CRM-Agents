import { useState } from 'react';
import { Bot, Play, Zap, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAgentStore } from '@/stores/use-agent-store';
import {
  useTriggerLeadQualification,
  useTriggerEmailIntelligence,
  useTriggerSalesPipeline,
  useTriggerCustomerSuccess,
  useTriggerMeetingScheduler,
  useTriggerAnalyticsAgent,
} from '@/hooks/use-agents';

import { useDeals } from '@/hooks/use-deals';
import { useCustomers } from '@/hooks/use-customers';

export function AgentsPage() {
  const { agentStatuses, events, clearEvents } = useAgentStore();
  const agentsList = Object.values(agentStatuses);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  const { data: deals } = useDeals();
  const { data: customers } = useCustomers();

  const triggerLead = useTriggerLeadQualification();
  const triggerEmail = useTriggerEmailIntelligence();
  const triggerDeal = useTriggerSalesPipeline();
  const triggerCustomer = useTriggerCustomerSuccess();
  const triggerMeeting = useTriggerMeetingScheduler();
  const triggerAnalytics = useTriggerAnalyticsAgent();

  const handleRunAgent = async (name: string) => {
    setRunningAgent(name);
    try {
      if (name === 'LeadQualificationAgent') {
        await triggerLead.mutateAsync({
          email: 'sample.prospect@techcorp.io',
          first_name: 'Tech',
          last_name: 'Prospect',
          job_title: 'CTO',
          company_name: 'TechCorp',
        });
      } else if (name === 'EmailIntelligenceAgent') {
        await triggerEmail.mutateAsync({
          sender: 'lead@enterprise.com',
          subject: 'SLA and SOC2 compliance inquiry',
          body: 'We need enterprise SLA guarantees and custom data residency.',
        });
      } else if (name === 'SalesPipelineAgent') {
        const dealId = deals && deals.length > 0 ? deals[0].id : '';
        if (dealId) {
          await triggerDeal.mutateAsync(dealId);
        } else {
          alert('No deals found in the database. Please create a deal opportunity first.');
        }
      } else if (name === 'CustomerSuccessAgent') {
        const customerId = customers && customers.length > 0 ? customers[0].id : '';
        if (customerId) {
          await triggerCustomer.mutateAsync(customerId);
        } else {
          alert('No customer records found in the database. Please onboard a customer first.');
        }
      } else if (name === 'MeetingSchedulerAgent') {
        await triggerMeeting.mutateAsync({
          title: 'Executive Architecture Demo',
          meeting_type: 'Executive Demo',
          attendee_email: 'buyer@acme.org',
        });
      } else if (name === 'AnalyticsAgent') {
        await triggerAnalytics.mutateAsync('all');
      }
    } finally {
      setRunningAgent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-brand-400" />
            Autonomous Agent Fleet Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, trigger, and inspect multi-agent AI execution logs and event bus telemetry
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={clearEvents}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Event Logs</span>
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsList.map((agent) => (
          <Card key={agent.name} className="p-5 space-y-4 hover:border-brand-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
                  {agent.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{agent.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">LLM: {agent.model}</span>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous execution loop subscribing to Redis pub/sub event bus and FastAPI BackgroundTasks.
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for tasks
              </span>
              <Button
                size="sm"
                variant="secondary"
                isLoading={runningAgent === agent.name}
                onClick={() => handleRunAgent(agent.name)}
              >
                <Play className="w-3.5 h-3.5 text-brand-400" />
                <span>Trigger Run</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Event Stream Terminal Console */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-400" />
            Live Event Bus & Telemetry Console
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{events.length} Telemetry Events</span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <p className="text-slate-600 text-center py-6">No event stream logs recorded yet.</p>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-brand-400 font-bold">[{evt.agent}]</span>
                    <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-amber-400 uppercase text-[10px] font-bold mr-2">
                      {evt.type}
                    </span>
                    {JSON.stringify(evt.data)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
