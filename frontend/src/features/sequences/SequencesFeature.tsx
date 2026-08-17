import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sequenceApi, ExecuteStepResponse } from './api/sequenceApi';
import { SDRSequence, SequenceStep } from './types/sequence.types';
import { CreateSequenceModal } from './components/CreateSequenceModal';
import { EnrollLeadsModal } from './components/EnrollLeadsModal';
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
} from 'lucide-react';

export function SequencesFeature() {
  const queryClient = useQueryClient();

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
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'voice':
        return <Phone className="w-4 h-4 text-purple-400" />;
      default:
        return <Mail className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/50 via-slate-900/80 to-blue-950/50 border border-purple-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 border border-purple-500/40 text-purple-400 shadow-xl shadow-purple-500/20 shrink-0">
            <Send className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                AI SDR Multi-Touch Outreach Cadences
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                Autonomous SDR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Build omnichannel outreach sequences across Email, WhatsApp, and Voice briefings with dynamic AI step personalization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs h-9 px-3.5 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs h-9 px-4 rounded-xl font-bold shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New AI Cadence</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Cadences List + Step Inspector & AI Copy Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sequences List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active SDR Cadences ({sequences?.length || 0})
          </span>

          <div className="space-y-3">
            {sequences?.map((seq) => {
              const isSelected = activeSeq?.id === seq.id;
              const isPaused = seq.status === 'paused';
              return (
                <div
                  key={seq.id}
                  onClick={() => setSelectedSequence(seq)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500 text-white shadow-xl shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{seq.name}</h3>
                        <Badge variant={isPaused ? 'warning' : 'success'} className="text-[9px] uppercase">
                          {seq.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Target: {seq.target_persona}</p>
                    </div>
                    <Badge variant="purple" className="text-[10px] uppercase font-mono shrink-0">
                      {seq.channel}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Steps</span>
                      <span className="text-xs font-bold font-mono text-white">{seq.steps.length} Steps</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Enrolled</span>
                      <span className="text-xs font-bold font-mono text-purple-400">{seq.enrolled_count}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/50">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Conversion</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">{seq.conversion_rate_pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Cadence Steps Timeline & AI Copy Tester */}
        <div className="lg:col-span-7 space-y-5">
          {activeSeq ? (
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 space-y-6 shadow-xl">
              {/* Cadence Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white">{activeSeq.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={activeSeq.status === 'paused' ? 'warning' : 'success'} className="text-[10px]">
                      {activeSeq.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {activeSeq.steps.length} Touchpoints
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMutation.mutate(activeSeq.id)}
                    isLoading={toggleMutation.isPending}
                    className="text-xs border-slate-700 bg-slate-900 text-slate-300"
                  >
                    {activeSeq.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        <span>Resume</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="text-xs border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span>Enroll Prospects</span>
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(activeSeq.id)}
                    className="text-xs px-2.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* AI Copy Customizer */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Copy Personalization Engine</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Live Agent Inference</span>
                </div>
                <input
                  type="text"
                  value={testPainPoint}
                  onChange={(e) => setTestPainPoint(e.target.value)}
                  placeholder="Enter prospect pain point to inject..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Generated AI Copy Box */}
              {generatedCopy && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>Live AI SDR Generated Outreach Copy</span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyClipboard(generatedCopy)}
                      className="text-xs h-7 px-2 border-slate-700 bg-slate-900 text-slate-300"
                    >
                      {copySuccess ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span className="ml-1">{copySuccess ? 'Copied!' : 'Copy'}</span>
                    </Button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {generatedCopy}
                  </div>
                </div>
              )}

              {/* Live Step Execution HUD */}
              {stepExecResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Live Step Execution: {stepExecResult.executed_by}</span>
                    </span>
                    <Badge variant="success" className="text-[9px]">
                      {stepExecResult.status}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-sans">
                    {stepExecResult.result}
                  </div>
                </div>
              )}

              {/* Steps List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Cadence Flow
                </span>

                <div className="space-y-3">
                  {activeSeq.steps.map((step) => (
                    <div
                      key={step.step_number}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(step.channel)}
                          <span className="text-xs font-black text-white">
                            Step #{step.step_number}: {step.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-[10px]">
                            {step.delay_days === 0 ? 'Immediately' : `+${step.delay_days} days`}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateCopyMutation.mutate(step)}
                            isLoading={generateCopyMutation.isPending}
                            className="text-[10px] h-7 px-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            <span>AI Personalize</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => executeStepMutation.mutate(step)}
                            isLoading={executeStepMutation.isPending}
                            className="text-[10px] h-7 px-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            <span>Run Step</span>
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 font-sans leading-relaxed whitespace-pre-wrap pl-6">
                        {step.template}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No cadence selected. Create or select a cadence on the left.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && <CreateSequenceModal onClose={() => setIsCreateModalOpen(false)} />}

      {/* Dynamic Enroll Prospects Modal */}
      {isEnrollModalOpen && activeSeq && (
        <EnrollLeadsModal sequence={activeSeq} onClose={() => setIsEnrollModalOpen(false)} />
      )}
    </div>
  );
}
