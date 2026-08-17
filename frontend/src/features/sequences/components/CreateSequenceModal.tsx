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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Create AI SDR Outreach Cadence</span>
                <Badge variant="purple" className="text-[10px] bg-purple-500/20 text-purple-300">
                  {channel}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Design automated multi-channel sequences executed by autonomous AI agents.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Cadence Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise RevOps High-Conversion Sequence"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Cadence Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="multichannel">Omnichannel Fleet</option>
                <option value="email">Email Intelligence</option>
                <option value="whatsapp">WhatsApp Auto-Pilot</option>
                <option value="voice">Voice AI Studio</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Target Persona
              </label>
              <input
                type="text"
                required
                value={targetPersona}
                onChange={(e) => setTargetPersona(e.target.value)}
                placeholder="e.g. VP of Sales"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cadence Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cadence Steps ({steps.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Step</span>
              </Button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                      Step #{step.step_number}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={step.channel}
                        onChange={(e) => updateStep(idx, 'channel', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="voice">Voice Call</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span>Wait</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={step.delay_days}
                          onChange={(e) => updateStep(idx, 'delay_days', Number(e.target.value))}
                          className="w-12 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none"
                        />
                        <span>days</span>
                      </div>

                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={step.subject}
                      onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                      placeholder="Subject Line"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <textarea
                      rows={3}
                      required
                      value={step.template}
                      onChange={(e) => updateStep(idx, 'template', e.target.value)}
                      placeholder="Template copy with {{first_name}}, {{company_name}} tags..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Launch Sequence</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
