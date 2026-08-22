import { useState } from 'react';
import { Bot, Play, Zap, Terminal, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
import { useTranslation } from '@/features/multi-language';

export function AgentsFeature() {
  const { t } = useTranslation();
  const { agentStatuses, events, clearEvents } = useAgentStore();
  const agentsList = Object.values(agentStatuses);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [lastRunOutput, setLastRunOutput] = useState<{ agent: string; result: any } | null>(null);

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
      let res: any = null;

      if (name === 'LeadQualificationAgent') {
        res = await triggerLead.mutateAsync({
          email: 'sample.prospect@techcorp.io',
          first_name: 'Tech',
          last_name: 'Prospect',
          job_title: 'CTO',
          company_name: 'TechCorp',
        });
      } else if (name === 'EmailIntelligenceAgent') {
        res = await triggerEmail.mutateAsync({
          sender: 'lead@enterprise.com',
          subject: 'SLA and SOC2 compliance inquiry',
          body: 'We need enterprise SLA guarantees and custom data residency.',
        });
      } else if (name === 'SalesPipelineAgent') {
        const dealId = deals && deals.length > 0 ? deals[0].id : 'sample-deal-id';
        res = await triggerDeal.mutateAsync(dealId);
      } else if (name === 'CustomerSuccessAgent') {
        const customerId = customers && customers.length > 0 ? customers[0].id : 'sample-customer-id';
        res = await triggerCustomer.mutateAsync(customerId);
      } else if (name === 'MeetingSchedulerAgent') {
        res = await triggerMeeting.mutateAsync({
          title: 'Executive Architecture Demo',
          meeting_type: 'Executive Demo',
          attendee_email: 'buyer@acme.org',
        });
      } else if (name === 'AnalyticsAgent') {
        res = await triggerAnalytics.mutateAsync('all');
      }

      if (res) {
        setLastRunOutput({ agent: name, result: res });
      }
    } catch (err: any) {
      setLastRunOutput({ agent: name, result: { status: 'error', error: err?.message || 'Agent execution failed' } });
    } finally {
      setRunningAgent(null);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="text-base font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>{t('agents.title', 'AUTONOMOUS AGENT FLEET CONTROL')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase">
            {t('agents.subtitle', 'MANAGE, TRIGGER, AND INSPECT MULTI-AGENT EXECUTION LOGS AND EVENT BUS TELEMETRY')}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={clearEvents} className="text-xs h-7">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('agents.clear_events', 'CLEAR LOGS')}</span>
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
        {agentsList.map((agent) => (
          <Card key={agent.name} className="p-4 space-y-3 hover:border-primary transition-none">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none bg-background text-primary border border-primary/50 flex items-center justify-center font-bold text-xs font-mono">
                  {agent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-foreground uppercase">{agent.name}</h3>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">LLM: {agent.model}</span>
                </div>
              </div>
              <Badge variant="success" className="text-[8px]">ONLINE</Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-mono uppercase">
              SUBSCRIBING TO REDIS PUB/SUB EVENT BUS AND FASTAPI ASYNC QUEUES.
            </p>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[9px] text-primary font-bold flex items-center gap-1 uppercase">
                <CheckCircle2 className="w-3 h-3" /> {t('agents.ready', 'READY FOR TASKS')}
              </span>
              <Button
                size="sm"
                variant="primary"
                isLoading={runningAgent === agent.name}
                onClick={() => handleRunAgent(agent.name)}
                className="text-xs h-7 px-2.5"
              >
                <Play className="w-3 h-3 text-primary-foreground" />
                <span>{t('agents.trigger_run', 'DISPATCH')}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Event Stream Terminal Console */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>LIVE EVENT BUS &amp; TELEMETRY CONSOLE</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span>{events.length} EVENTS RECORDED</span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="bg-background p-3 rounded-none border border-border font-mono text-xs max-h-96 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 uppercase font-mono">NO EVENT STREAM LOGS RECORDED YET.</p>
            ) : (
              events.map((evt) => (
                <div key={evt.id} className="p-2 bg-card border border-border space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-primary font-bold">[{evt.agent}]</span>
                    <span className="text-muted-foreground font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-foreground text-xs font-mono">
                    <span className="text-cyan-400 uppercase text-[9px] font-bold mr-2">
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

      {/* Agent Execution Result Modal */}
      {lastRunOutput && (
        <Modal
          isOpen={Boolean(lastRunOutput)}
          onClose={() => setLastRunOutput(null)}
          title={`AGENT EXECUTION RESULT — ${lastRunOutput.agent}`}
          description={`OUTPUT RETURNED BY ${lastRunOutput.agent} BACKGROUND EXECUTION.`}
          className="font-mono"
        >
          <div className="space-y-3">
            <div className="p-3 bg-background border border-border space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXECUTION RESPONSE PAYLOAD</span>
              </div>
              <pre className="p-2.5 bg-card border border-border text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(lastRunOutput.result, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-1 border-t border-border">
              <Button variant="outline" onClick={() => setLastRunOutput(null)} className="text-xs">
                CLOSE
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
