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
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
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

  // Email Proposal State
  const [recipientEmail, setRecipientEmail] = useState<string>(
    `buying-committee@${deal.company?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise'}.com`
  );
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

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
      setEmailSuccessMsg(null);
      setEmailErrorMsg(null);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!proposal) return;
      return warRoomApi.sendProposalEmail(deal.id, {
        recipient_email: recipientEmail,
        proposal_id: proposal.proposal_id,
        tier: proposal.tier,
        final_arr: proposal.pricing.final_arr,
        esign_url: proposal.esign_url,
        custom_note: customTerms,
      });
    },
    onSuccess: (res) => {
      setEmailSuccessMsg(res?.message || `Proposal sent to ${recipientEmail} via SMTP queue.`);
      setTimeout(() => setEmailSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setEmailErrorMsg(err.response?.data?.detail || err.message || 'Failed to dispatch proposal email.');
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Pricing Tier Strategy
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['starter', 'growth', 'enterprise'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                      tier === t
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Discretionary Discount
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">{discountPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-800 w-full hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSla}
                  onChange={(e) => setIncludeSla(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                />
                <span className="font-medium">99.95% Emergency SLA</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Custom Commercial Clauses & Onboarding Terms
            </label>
            <textarea
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Add tailored implementation scopes or legal addendums..."
            />
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              Deal Value Baseline:{' '}
              <strong className="text-slate-300 font-mono">${(deal.value || 60000).toLocaleString()}</strong>
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              isLoading={generateMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 shadow-lg shadow-emerald-600/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>{proposal ? 'Re-Generate Pitch Deck' : 'Auto-Generate AI Proposal'}</span>
            </Button>
          </div>

          {/* Render Generated Proposal */}
          {proposal && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Proposal Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" className="font-mono text-xs">
                      {proposal.proposal_id}
                    </Badge>
                    <Badge variant="success">{proposal.tier} Tier</Badge>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1.5">{proposal.company} Commercial Agreement</h3>
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

              {/* Email Dispatch Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Dispatch Proposal & E-Signature URL to Buying Committee
                  </h4>
                </div>

                {emailErrorMsg && (
                  <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{emailErrorMsg}</span>
                  </div>
                )}

                {emailSuccessMsg && (
                  <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{emailSuccessMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="prospect-cfo@enterprise.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    onClick={() => sendEmailMutation.mutate()}
                    isLoading={sendEmailMutation.isPending}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shrink-0 text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Email Proposal</span>
                  </Button>
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

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleCopyProposal}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 mr-1.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      <span>Copy Proposal Text</span>
                    </>
                  )}
                </Button>

                <a
                  href={proposal.esign_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Open E-Signature Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
