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
  Copy,
  ExternalLink,
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
${proposal.custom_notes || 'Standard terms apply.'}

E-Signature Link: ${proposal.esign_url}
`;
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C10]/85 backdrop-blur-md font-mono">
      <div className="bg-[#1F2833] border border-[#3A4552] rounded-none w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#3A4552] bg-[#1F2833] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-[#0B0C10] text-[#FFB800] border border-[#3A4552]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <span>1-CLICK SMART PROPOSAL STUDIO</span>
                <Badge variant="purple" className="text-[9px] uppercase font-mono">
                  {deal.company}
                </Badge>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                OPPORTUNITY: {deal.title} • PIPELINE VALUE: ${deal.value?.toLocaleString()} USD
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
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0B0C10] p-3.5 rounded-none border border-[#3A4552]">
            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                TIER PACKAGING
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
              >
                <option value="starter">STARTER DECK</option>
                <option value="growth">GROWTH FLEET</option>
                <option value="enterprise">ENTERPRISE COMMAND</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                DISCOUNT (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                SLA GUARANTEE
              </label>
              <div className="flex items-center h-8">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300 uppercase text-[10px]">
                  <input
                    type="checkbox"
                    checked={includeSla}
                    onChange={(e) => setIncludeSla(e.target.checked)}
                    className="rounded-none border-[#3A4552] bg-[#1F2833] text-[#FFB800] focus:ring-0"
                  />
                  <span>99.99% ENTERPRISE SLA</span>
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => generateMutation.mutate()}
                isLoading={generateMutation.isPending}
                className="w-full h-8 text-xs font-bold uppercase"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>GENERATE PROPOSAL</span>
              </Button>
            </div>
          </div>

          {/* Custom Terms Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
              SPECIAL COMMERCIAL TERMS &amp; CLAUSES
            </label>
            <textarea
              rows={2}
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none p-2.5 text-xs text-white focus:outline-none focus:border-[#FFB800] font-mono"
            />
          </div>

          {/* Generated Proposal Preview */}
          {proposal && (
            <div className="space-y-4 animate-in fade-in border-t border-[#3A4552] pt-4 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0C10] p-4 rounded-none border border-[#3A4552]">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">FINAL PRICING</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#FFB800] font-mono">
                      ${proposal.pricing.final_arr.toLocaleString()} USD
                    </span>
                    <span className="text-xs text-slate-400 font-mono line-through">
                      ${proposal.pricing.base_arr.toLocaleString()}
                    </span>
                    <Badge variant="success" className="text-[9px] uppercase font-mono">
                      {proposal.pricing.discount_pct}% SAVINGS
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyProposal}
                    className="text-xs h-7 uppercase"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-[#FFB800]" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>COPY PROPOSAL</span>
                      </>
                    )}
                  </Button>
                  <a
                    href={proposal.esign_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-[#1F2833] hover:bg-[#26313F] text-slate-200 border border-[#3A4552] hover:border-[#FFB800] uppercase transition-none h-7"
                  >
                    <span>E-SIGN LINK</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Proposal Document Body */}
              <div className="p-4 rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    EXECUTIVE SUMMARY
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed uppercase">
                    {proposal.executive_summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    INCLUDED AI AGENT MODULES
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {proposal.modules_included.map((mod, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-none bg-[#1F2833] border border-[#3A4552] flex items-center gap-2 text-xs text-slate-200 font-bold uppercase"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-none bg-[#1F2833] border border-[#3A4552] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      SLA &amp; UPTIME TERMS
                    </span>
                    <p className="text-[11px] text-slate-300 uppercase leading-relaxed">{proposal.sla_terms}</p>
                  </div>

                  <div className="p-3 rounded-none bg-[#1F2833] border border-[#3A4552] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      COMMERCIAL TERMS
                    </span>
                    <p className="text-[11px] text-slate-300 uppercase leading-relaxed">{proposal.custom_notes || 'Standard agreement.'}</p>
                  </div>
                </div>
              </div>

              {/* Direct SMTP Email Dispatch Studio */}
              <div className="p-4 rounded-none bg-[#1F2833] border border-[#3A4552] space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FFB800]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      DISPATCH PROPOSAL VIA SECURE TASK QUEUE
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    SMTP ENVELOPE DELIVERY
                  </span>
                </div>

                {emailSuccessMsg && (
                  <div className="p-2.5 bg-[#0B0C10] border border-[#FFB800] text-[#FFB800] text-xs flex items-center gap-2 uppercase">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{emailSuccessMsg}</span>
                  </div>
                )}

                {emailErrorMsg && (
                  <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs flex items-center gap-2 uppercase">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{emailErrorMsg}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@company.com"
                    className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => sendEmailMutation.mutate()}
                    isLoading={sendEmailMutation.isPending}
                    className="w-full sm:w-auto shrink-0 text-xs uppercase h-8"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>SEND PROPOSAL EMAIL</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
