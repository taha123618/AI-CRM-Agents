import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { warRoomApi } from '../api/warRoomApi';
import { WarRoomDeal, GeneratedProposal } from '../types/warRoom.types';
import {
  FileText,
  X,
  Sparkles,
  Check,
  ShieldCheck,
  DollarSign,
  Copy,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface ProposalStudioModalProps {
  deal: WarRoomDeal;
  onClose: () => void;
}

export function ProposalStudioModal({ deal, onClose }: ProposalStudioModalProps) {
  const [tier, setTier] = useState<'starter' | 'growth' | 'enterprise'>('enterprise');
  const [discountPct, setDiscountPct] = useState<number>(10);
  const [includeSla, setIncludeSla] = useState<boolean>(true);
  const [customTerms, setCustomTerms] = useState<string>(
    'Includes dedicated enterprise onboarding sprint, SOC2 Type II compliance audit verification, and 24/7 VIP technical phone escalation.'
  );
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () =>
      warRoomApi.generateProposal({
        deal_id: deal.id,
        tier,
        custom_discount_pct: discountPct,
        include_sla_guarantee: includeSla,
        custom_terms: customTerms,
      }),
    onSuccess: (data) => {
      setProposal(data);
    },
  });

  const handleCopyProposal = () => {
    if (!proposal) return;
    const text = `
# ${proposal.tier} Enterprise Proposal: ${proposal.company}
Proposal ID: ${proposal.proposal_id}
Deal: ${proposal.deal_title}
Annual Contract Value: $${proposal.pricing.final_arr.toLocaleString()} (${proposal.pricing.billing_cadence})
Discount Applied: ${proposal.pricing.discount_pct}% ($${proposal.pricing.discount_amount.toLocaleString()})

## Executive Summary
${proposal.executive_summary}

## Modules Included
${proposal.modules_included.map((m) => `- ${m}`).join('\n')}

## SLA & Support Guarantee
${proposal.sla_terms}

## Special Commercial Terms
${proposal.custom_notes}

Sign electronically at: ${proposal.esign_url}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>AI Smart Proposal & Pitch Studio</span>
                <Badge variant="success" className="text-[10px] bg-emerald-500/20 text-emerald-300">
                  DocuSign Ready
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-generate customized executive proposal decks and e-signature contracts for{' '}
                <strong className="text-white">{deal.company}</strong>.
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {/* Tier Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Subscription Tier
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['starter', 'growth', 'enterprise'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      tier === t
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">
                  Tier Discount
                </span>
                <span className="font-mono font-bold text-emerald-400">{discountPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* SLA Checkbox */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSla}
                  onChange={(e) => setIncludeSla(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs font-bold text-slate-300">
                  Include 99.95% Enterprise SLA
                </span>
              </label>
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Commercial Terms & Rider Addendum
            </label>
            <textarea
              rows={2}
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between">
            <Button
              variant="primary"
              onClick={() => generateMutation.mutate()}
              isLoading={generateMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 font-bold px-6 py-2.5 shadow-lg shadow-emerald-600/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{proposal ? 'Regenerate Proposal' : 'Auto-Generate AI Proposal'}</span>
            </Button>

            {proposal && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyProposal}
                  className="border-slate-700 hover:bg-slate-800 text-slate-200"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      <span>Copied Markdown</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      <span>Copy Pitch Deck</span>
                    </>
                  )}
                </Button>
                <a
                  href={proposal.esign_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open E-Sign Link</span>
                </a>
              </div>
            )}
          </div>

          {/* Generated Proposal Document View */}
          {proposal && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 shadow-2xl animate-in fade-in duration-300">
              {/* Proposal Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    {proposal.proposal_id}
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {proposal.tier} Plan Pitch Deck — {proposal.company}
                  </h3>
                  <p className="text-xs text-slate-400">Target Deal: {proposal.deal_title}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Annual Contract Value (ARR)
                  </span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ${proposal.pricing.final_arr.toLocaleString()}
                  </div>
                  {proposal.pricing.discount_pct > 0 && (
                    <span className="text-[10px] text-rose-400 font-mono">
                      Includes {proposal.pricing.discount_pct}% discount (-$
                      {proposal.pricing.discount_amount.toLocaleString()})
                    </span>
                  )}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Executive Strategic Summary</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                  {proposal.executive_summary}
                </p>
              </div>

              {/* Modules Included */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Architectural Capabilities & Multi-Agent Modules</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {proposal.modules_included.map((mod, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-200"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SLA & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    SLA Guarantee
                  </span>
                  <p className="text-xs text-slate-300">{proposal.sla_terms}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    Billing & Addendum
                  </span>
                  <p className="text-xs text-slate-300">
                    {proposal.pricing.billing_cadence}. {proposal.custom_notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
