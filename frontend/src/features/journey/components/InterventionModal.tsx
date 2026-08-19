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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C10]/85 backdrop-blur-md font-mono">
      <div className="bg-[#1F2833] border border-[#3A4552] rounded-none w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#3A4552] bg-[#1F2833] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-[#0B0C10] text-[#FF2A54] border border-[#FF2A54]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span>AUTONOMOUS CHURN RESCUE INTERVENTION</span>
                <Badge variant="danger" className="text-[9px] uppercase font-mono">
                  TARGET: {customer.name}
                </Badge>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                DEPLOY PROACTIVE AI AGENT PLAYS TO PRESERVE ARR AND RESOLVE ACCOUNT VULNERABILITIES.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-slate-400 hover:text-white hover:bg-[#0B0C10] transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono">
          {/* Account Vital Badges */}
          <div className="grid grid-cols-3 gap-2.5 bg-[#0B0C10] p-3 rounded-none border border-[#3A4552]">
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">HEALTH SCORE</span>
              <span
                className={`text-sm font-bold font-mono ${customer.health_score >= 70 ? 'text-[#FFB800]' : 'text-[#FF2A54]'
                  }`}
              >
                {customer.health_score}%
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">ANNUAL CONTRACT (ARR)</span>
              <span className="text-sm font-bold font-mono text-white">
                ${customer.arr.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-bold block">CHURN PROBABILITY</span>
              <span className="text-sm font-bold font-mono text-[#FFB800]">
                {customer.churn_risk_pct}%
              </span>
            </div>
          </div>

          {resultPlaybook ? (
            <div className="p-4 rounded-none bg-[#0B0C10] border border-[#FFB800] space-y-3 animate-in fade-in font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  AI RETENTION PLAYBOOK DISPATCHED
                </h3>
              </div>
              <div className="p-3 rounded-none bg-[#1F2833] border border-[#3A4552] font-mono text-xs text-[#FFB800] whitespace-pre-wrap leading-relaxed">
                {resultPlaybook}
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={onClose} className="text-xs uppercase">
                  DISMISS
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerMutation.mutate();
              }}
              className="space-y-3 font-mono"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  INTERVENTION PLAY TYPE
                </label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                >
                  <option value="executive_check_in">EXECUTIVE SPONSOR HEALTH CHECK-IN</option>
                  <option value="technical_audit">TECHNICAL AUDIT &amp; OPTIMIZATION DECK</option>
                  <option value="discount_incentive">ANNUAL RENEWAL DISCOUNT INCENTIVE</option>
                  <option value="success_roadmap">SUCCESS ACCELERATION WORKSHOP</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  PLAYBOOK CUSTOM CONTEXT &amp; MANDATE
                </label>
                <textarea
                  rows={4}
                  required
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none p-2.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3A4552]">
                <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={triggerMutation.isPending}
                  className="text-xs uppercase"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>EXECUTE RETENTION PLAYBOOK</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
