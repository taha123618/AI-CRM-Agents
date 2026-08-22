import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sequenceApi } from '../api/sequenceApi';
import { SequenceStep } from '../types/sequence.types';
import {
  Send,
  X,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface CreateSequenceModalProps {
  onClose: () => void;
}

export function CreateSequenceModal({ onClose }: CreateSequenceModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [channel, setChannel] = useState('multichannel');
  const [targetPersona, setTargetPersona] = useState('VP of Sales / CRO');
  const [steps, setSteps] = useState<SequenceStep[]>([
    {
      step_number: 1,
      channel: 'email',
      delay_days: 0,
      subject: 'Quick question on {{company_name}} sales velocity',
      template: 'Hi {{first_name}},\n\nNoticed {{company_name}} is scaling operations. How is your team currently handling qualification latency?\n\nOpen to a 5-min look this week?',
    },
    {
      step_number: 2,
      channel: 'whatsapp',
      delay_days: 3,
      subject: 'WhatsApp Auto-Pilot Demo',
      template: 'Hi {{first_name}}, following up! Here is a 30-second live test of our WhatsApp AI lead qualifier. Let me know if you would like to test it!',
    },
  ]);

  const createMutation = useMutation({
    mutationFn: () =>
      sequenceApi.createSequence({
        name,
        channel,
        target_persona: targetPersona,
        steps,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sdr-sequences'] });
      onClose();
    },
  });

  const addStep = () => {
    const nextNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        step_number: nextNum,
        channel: 'email',
        delay_days: 4,
        subject: `Follow-up #${nextNum} for {{company_name}}`,
        template: 'Hi {{first_name}},\n\nFollowing up on my previous note to see if this is top of mind for your team?',
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, step_number: idx + 1 }));
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof SequenceStep, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md font-mono">
      <div className="bg-card border border-border rounded-none w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-background text-primary border border-border">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>CREATE AI SDR OUTREACH CADENCE</span>
                <Badge variant="purple" className="text-[9px] uppercase font-mono">
                  {channel}
                </Badge>
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
                DESIGN AUTOMATED MULTI-CHANNEL SEQUENCES EXECUTED BY AUTONOMOUS AI AGENTS.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-background transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-background p-3.5 rounded-none border border-border">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                CADENCE NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.G. ENTERPRISE REVOPS HIGH-CONVERSION SEQUENCE"
                className="w-full bg-card border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                CADENCE CHANNEL
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-card border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
              >
                <option value="multichannel">OMNICHANNEL FLEET</option>
                <option value="email">EMAIL INTELLIGENCE</option>
                <option value="whatsapp">WHATSAPP AUTO-PILOT</option>
                <option value="voice">VOICE AI STUDIO</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                TARGET PERSONA
              </label>
              <input
                type="text"
                required
                value={targetPersona}
                onChange={(e) => setTargetPersona(e.target.value)}
                placeholder="E.G. VP OF SALES / CRO"
                className="w-full bg-card border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
              />
            </div>
          </div>

          {/* Cadence Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                CADENCE STEPS ({steps.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="text-xs h-7 uppercase"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>ADD STEP</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-none bg-background border border-border space-y-2.5 font-mono"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      STEP #{step.step_number}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={step.channel}
                        onChange={(e) => updateStep(idx, 'channel', e.target.value)}
                        className="bg-card border border-border rounded-none px-2 py-1 text-xs text-foreground focus:outline-none uppercase"
                      >
                        <option value="email">EMAIL</option>
                        <option value="whatsapp">WHATSAPP</option>
                        <option value="voice">VOICE CALL</option>
                        <option value="linkedin">LINKEDIN</option>
                      </select>

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
                        <span>WAIT</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={step.delay_days}
                          onChange={(e) => updateStep(idx, 'delay_days', Number(e.target.value))}
                          className="w-12 bg-card border border-border rounded-none px-1.5 py-0.5 text-xs text-foreground text-center focus:outline-none"
                        />
                        <span>DAYS</span>
                      </div>

                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 font-mono">
                    <input
                      type="text"
                      required
                      value={step.subject}
                      onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                      placeholder="SUBJECT LINE"
                      className="w-full bg-card border border-border rounded-none px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary font-bold"
                    />
                    <textarea
                      rows={3}
                      required
                      value={step.template}
                      onChange={(e) => updateStep(idx, 'template', e.target.value)}
                      placeholder="Template copy with {{first_name}}, {{company_name}} tags..."
                      className="w-full bg-card border border-border rounded-none p-2.5 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              className="text-xs uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>LAUNCH SEQUENCE</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
