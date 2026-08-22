import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sequenceApi, ExecuteStepResponse } from './api/sequenceApi';
import { SDRSequence, SequenceStep } from './types/sequence.types';
import { CreateSequenceModal } from './components/CreateSequenceModal';
import { EnrollLeadsModal } from './components/EnrollLeadsModal';
import { VisualWorkflowCanvas } from './components/VisualWorkflowCanvas';
import {
  Send,
  Plus,
  Sparkles,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Users,
  Trash2,
  CheckCircle2,
  Copy,
  Bot,
  Play,
  Pause,
  Zap,
  Workflow,
  Layers,
} from 'lucide-react';

export function SequencesFeature() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'cadence' | 'workflow_canvas'>('cadence');
  const [selectedSequence, setSelectedSequence] = useState<SDRSequence | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [testPainPoint, setTestPainPoint] = useState(
    'Inbound lead qualification latency and CRM data entry overhead'
  );
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [stepExecResult, setStepExecResult] = useState<ExecuteStepResponse | null>(null);

  const {
    data: sequences,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['sdr-sequences'],
    queryFn: () => sequenceApi.getSequences(),
  });

  const activeSeq = selectedSequence || (sequences && sequences.length > 0 ? sequences[0] : null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sequenceApi.deleteSequence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sdr-sequences'] });
      setSelectedSequence(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => sequenceApi.toggleSequence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sdr-sequences'] });
    },
  });

  const generateCopyMutation = useMutation({
    mutationFn: (step: SequenceStep) => {
      if (!activeSeq) throw new Error('No sequence selected');
      return sequenceApi.generateStepCopy(activeSeq.id, {
        step_number: step.step_number,
        channel: step.channel,
        prospect_pain_point: testPainPoint,
      });
    },
    onSuccess: (data) => {
      setGeneratedCopy(data.ai_generated_copy);
    },
  });

  const executeStepMutation = useMutation({
    mutationFn: (step: SequenceStep) => {
      if (!activeSeq) throw new Error('No sequence selected');
      return sequenceApi.executeStep(activeSeq.id, {
        step_number: step.step_number,
        channel: step.channel,
        custom_note: `Live execution from Sequences Studio targeting persona '${activeSeq.target_persona}'.`,
      });
    },
    onSuccess: (data) => {
      setStepExecResult(data);
    },
  });

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-primary" />;
      case 'voice':
        return <Phone className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4 font-mono pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-none bg-card border border-border shadow-2xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5 z-10">
          <div className="p-3 rounded-none bg-background border border-border text-primary shadow-md shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground uppercase">
                AI SDR OUTREACH CADENCE STUDIO
              </h1>
              <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold bg-background text-primary border border-primary/50 uppercase tracking-wider">
                AUTONOMOUS SDR CADENCES
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl uppercase">
              BUILD OMNICHANNEL OUTREACH SEQUENCES ACROSS EMAIL, WHATSAPP, AND VOICE BRIEFINGS WITH DYNAMIC AI PROMPT INJECTION.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="text-xs h-8 px-3 uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            <span>REFRESH</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs h-8 px-3.5 uppercase font-bold"
          >
            <Plus className="w-4 h-4 mr-1 text-primary-foreground" />
            <span>NEW AI CADENCE</span>
          </Button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('cadence')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-bold uppercase transition-none ${activeTab === 'cadence'
              ? 'bg-primary text-primary-foreground border border-primary'
              : 'bg-card text-foreground border border-border hover:border-primary hover:text-foreground'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>CADENCE &amp; AI COPY STUDIO</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow_canvas')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-bold uppercase transition-none ${activeTab === 'workflow_canvas'
              ? 'bg-primary text-primary-foreground border border-primary'
              : 'bg-card text-foreground border border-border hover:border-primary hover:text-foreground'
            }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>VISUAL WORKFLOW CANVAS</span>
          <span className="text-[8px] px-1 py-0.2 rounded-none bg-background text-primary border border-border">
            PIPELINE
          </span>
        </button>
      </div>

      {activeTab === 'workflow_canvas' ? (
        <VisualWorkflowCanvas />
      ) : (
        /* Main Grid: Cadences List + Step Inspector & AI Copy Generator */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Sequences List */}
          <div className="lg:col-span-5 space-y-2.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              ACTIVE SDR CADENCES ({sequences?.length || 0})
            </span>

            <div className="space-y-2.5">
              {sequences?.map((seq) => {
                const isSelected = activeSeq?.id === seq.id;
                const isPaused = seq.status === 'paused';
                return (
                  <div
                    key={seq.id}
                    onClick={() => setSelectedSequence(seq)}
                    className={`p-4 rounded-none border cursor-pointer transition-none ${isSelected
                        ? 'bg-card border-primary text-foreground shadow-xl'
                        : 'bg-card border-border hover:border-primary text-foreground'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-foreground uppercase">{seq.name}</h3>
                          <Badge variant={isPaused ? 'warning' : 'success'} className="text-[9px] uppercase font-mono">
                            {seq.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 uppercase">TARGET: {seq.target_persona}</p>
                      </div>
                      <Badge variant="purple" className="text-[9px] uppercase font-mono shrink-0">
                        {seq.channel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-border text-center">
                      <div className="bg-background p-1.5 rounded-none border border-border">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold block">STEPS</span>
                        <span className="text-xs font-bold font-mono text-foreground">{seq.steps.length} STEPS</span>
                      </div>
                      <div className="bg-background p-1.5 rounded-none border border-border">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold block">ENROLLED</span>
                        <span className="text-xs font-bold font-mono text-primary">{seq.enrolled_count}</span>
                      </div>
                      <div className="bg-background p-1.5 rounded-none border border-border">
                        <span className="text-[8px] text-muted-foreground uppercase font-bold block">CONVERSION</span>
                        <span className="text-xs font-bold font-mono text-primary">{seq.conversion_rate_pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Cadence Steps Timeline & AI Copy Tester */}
          <div className="lg:col-span-7 space-y-4">
            {activeSeq ? (
              <div className="p-4 sm:p-5 rounded-none bg-card border border-border space-y-4 shadow-xl">
                {/* Cadence Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
                  <div>
                    <h2 className="text-base font-black text-foreground uppercase">{activeSeq.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={activeSeq.status === 'paused' ? 'warning' : 'success'} className="text-[9px] uppercase font-mono">
                        {activeSeq.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground uppercase">
                        {activeSeq.steps.length} TOUCHPOINTS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMutation.mutate(activeSeq.id)}
                      isLoading={toggleMutation.isPending}
                      className="text-xs h-7 uppercase"
                    >
                      {activeSeq.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3 mr-1 text-primary" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1 text-primary" />
                          <span>RESUME</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEnrollModalOpen(true)}
                      className="text-xs h-7 uppercase border-purple-500/40 text-purple-300 hover:border-purple-500"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      <span>ENROLL LEADS</span>
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteMutation.mutate(activeSeq.id)}
                      className="text-xs h-7 px-2 uppercase"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* AI Copy Customizer */}
                <div className="p-3.5 rounded-none bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>AI PROMPT &amp; COPY PERSONALIZATION INJECTION</span>
                    </span>
                    <span className="text-[9px] text-primary uppercase">LIVE AGENT INFERENCE</span>
                  </div>
                  <input
                    type="text"
                    value={testPainPoint}
                    onChange={(e) => setTestPainPoint(e.target.value)}
                    placeholder="ENTER PROSPECT PAIN POINT TO INJECT..."
                    className="w-full bg-card border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                  />
                </div>

                {/* Generated AI Copy Box */}
                {generatedCopy && (
                  <div className="p-3.5 rounded-none bg-background border border-primary/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                        <Bot className="w-4 h-4 text-primary" />
                        <span>AI SDR GENERATED OUTREACH COPY</span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyClipboard(generatedCopy)}
                        className="text-xs h-6 px-2 uppercase"
                      >
                        {copySuccess ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                        <span className="ml-1">{copySuccess ? 'COPIED!' : 'COPY'}</span>
                      </Button>
                    </div>
                    <div className="p-3 rounded-none bg-card border border-border text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono uppercase">
                      {generatedCopy}
                    </div>
                  </div>
                )}

                {/* Live Step Execution HUD */}
                {stepExecResult && (
                  <div className="p-3.5 rounded-none bg-background border border-primary space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>LIVE STEP EXECUTION: {stepExecResult.executed_by}</span>
                      </span>
                      <Badge variant="success" className="text-[9px] uppercase font-mono">
                        {stepExecResult.status}
                      </Badge>
                    </div>
                    <div className="p-2.5 rounded-none bg-card border border-border text-xs text-foreground font-mono uppercase">
                      {stepExecResult.result}
                    </div>
                  </div>
                )}

                {/* Steps List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    CADENCE STEP SEQUENCE
                  </span>

                  <div className="space-y-2.5">
                    {activeSeq.steps.map((step) => (
                      <div
                        key={step.step_number}
                        className="p-3.5 rounded-none bg-background border border-border space-y-2 hover:border-primary transition-none"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(step.channel)}
                            <span className="text-xs font-black text-foreground uppercase">
                              STEP #{step.step_number}: {step.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="default" className="text-[9px] uppercase font-mono">
                              {step.delay_days === 0 ? 'IMMEDIATE' : `+${step.delay_days} DAYS`}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateCopyMutation.mutate(step)}
                              isLoading={generateCopyMutation.isPending}
                              className="text-[10px] h-6 px-2 uppercase"
                            >
                              <Sparkles className="w-3 h-3 mr-1 text-primary" />
                              <span>PERSONALIZE</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => executeStepMutation.mutate(step)}
                              isLoading={executeStepMutation.isPending}
                              className="text-[10px] h-6 px-2 uppercase font-bold"
                            >
                              <Play className="w-3 h-3 mr-1 text-primary-foreground" />
                              <span>RUN STEP</span>
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap pl-5 uppercase">
                          {step.template}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground text-xs uppercase font-mono">
                NO CADENCE SELECTED. CREATE OR SELECT A CADENCE ON THE LEFT.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && <CreateSequenceModal onClose={() => setIsCreateModalOpen(false)} />}

      {/* Dynamic Enroll Prospects Modal */}
      {isEnrollModalOpen && activeSeq && (
        <EnrollLeadsModal sequence={activeSeq} onClose={() => setIsEnrollModalOpen(false)} />
      )}
    </div>
  );
}

