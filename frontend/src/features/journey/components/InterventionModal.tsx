import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { journeyApi } from '../api/journeyApi';
import { JourneyCustomer } from '../types/journey.types';
import {
  ShieldAlert,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface InterventionModalProps {
  customer: JourneyCustomer;
  onClose: () => void;
}

export function InterventionModal({ customer, onClose }: InterventionModalProps) {
  const queryClient = useQueryClient();

  const [interventionType, setInterventionType] = useState('executive_check_in');
  const [customNotes, setCustomNotes] = useState(
    `Proactive retention play triggered for ${customer.name} (Health: ${customer.health_score}%, Churn Risk: ${customer.churn_risk_pct}%). Deliver automated health diagnosis deck and lock in annual renewal.`
  );
  const [resultPlaybook, setResultPlaybook] = useState<string | null>(null);

  const triggerMutation = useMutation({
    mutationFn: () =>
      journeyApi.triggerIntervention({
        customer_id: customer.id,
        intervention_type: interventionType,
        custom_notes: customNotes,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journey-stages'] });
      queryClient.invalidateQueries({ queryKey: ['customer-journey', customer.id] });
      setResultPlaybook(data.ai_full_playbook);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Autonomous Churn Rescue Intervention</span>
                <Badge variant="danger" className="text-[10px] bg-rose-500/20 text-rose-300">
                  Target: {customer.name}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deploy proactive AI agent plays to preserve ARR and resolve account vulnerabilities.
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          {/* Account Vital Badges */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Health Score</span>
              <span
                className={`text-base font-black font-mono ${
                  customer.health_score >= 70 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {customer.health_score}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Annual Contract (ARR)</span>
              <span className="text-base font-black font-mono text-white">
                ${customer.arr.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Churn Probability</span>
              <span className="text-base font-black font-mono text-amber-400">
                {customer.churn_risk_pct}%
              </span>
            </div>
          </div>

          {resultPlaybook ? (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Autonomous Intervention Dispatched Successfully</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {resultPlaybook}
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={onClose}>
                  Done & Return to Journey
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Intervention Protocol
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'executive_check_in',
                      title: 'Executive Sponsor Check-in',
                      desc: 'Auto-schedule QBR review and deliver adoption diagnostics.',
                    },
                    {
                      id: 'feature_adoption_nudge',
                      title: 'Feature Adoption Coaching',
                      desc: 'Trigger WhatsApp interactive video guides and tips.',
                    },
                    {
                      id: 'nps_feedback_outreach',
                      title: 'Proactive NPS Sentiment Survey',
                      desc: 'Capture unblocker requirements from key champions.',
                    },
                    {
                      id: 'contract_rescue_incentive',
                      title: 'Renewal Lock-in Incentive',
                      desc: 'Auto-draft multi-year pricing discount proposal.',
                    },
                  ].map((p) => {
                    const isSelected = interventionType === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setInterventionType(p.id)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{p.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-snug">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Custom Strategy Notes / Context
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => triggerMutation.mutate()}
                  isLoading={triggerMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>Launch AI Rescue Play</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
