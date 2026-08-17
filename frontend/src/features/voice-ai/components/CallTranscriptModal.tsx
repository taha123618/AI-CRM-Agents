import { VoiceCall, VoiceCallTranscript } from '../types/voiceAi.types';
import { X, Mic, User, Sparkles, Clock } from 'lucide-react';

interface CallTranscriptModalProps {
  call: VoiceCall;
  onClose: () => void;
}

const MOCK_TRANSCRIPTS: VoiceCallTranscript[] = [
  {
    id: '1',
    speaker: 'rep',
    text: "Hi Marcus! Thanks for hopping on the line today. How are your SDR lead qualification metrics tracking this quarter?",
    timestamp_seconds: 2,
    sentiment: 'neutral',
  },
  {
    id: '2',
    speaker: 'prospect',
    text: "Hey! Honestly, it's been a grind. We're using Salesforce but the automation coverage is weak. We're manually qualifying about 60% of inbound leads.",
    timestamp_seconds: 15,
    sentiment: 'negative',
    coaching_tip: '💡 Pain detected — pivot to automation ROI and our multi-agent qualification fleet.',
  },
  {
    id: '3',
    speaker: 'rep',
    text: "That's exactly the problem we solve. Our lead qualification agent autonomously scores, enriches, and routes 100% of inbound leads in under 30 seconds.",
    timestamp_seconds: 38,
    sentiment: 'positive',
  },
  {
    id: '4',
    speaker: 'prospect',
    text: "Sounds good but it seems expensive compared to what we pay for Salesforce.",
    timestamp_seconds: 62,
    sentiment: 'negative',
    coaching_tip: '💡 Competitor + Pricing objection — highlight 3.4x ROI and our annual billing flex. Reference Gong vs native AI battlecard.',
  },
  {
    id: '5',
    speaker: 'rep',
    text: "Great question on ROI. Our enterprise customers see 3.4x pipeline growth in the first 90 days. We also offer flexible annual billing that typically costs 40% less than your current Salesforce + Gong stack combined.",
    timestamp_seconds: 80,
    sentiment: 'positive',
  },
  {
    id: '6',
    speaker: 'prospect',
    text: "That's interesting. I'd need to bring my VP of Sales in to review this. Can you send over a proposal?",
    timestamp_seconds: 112,
    sentiment: 'positive',
    coaching_tip: '💡 Authority objection — offer an executive 1-pager and champion enablement deck for their VP review.',
  },
];

export function CallTranscriptModal({ call, onClose }: CallTranscriptModalProps) {
  const transcripts = call.transcripts?.length ? call.transcripts : MOCK_TRANSCRIPTS;

  const sentimentColor = (s?: string) => {
    if (s === 'positive') return 'text-emerald-400';
    if (s === 'negative') return 'text-red-400';
    return 'text-slate-400';
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-purple-500/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Mic className="w-3.5 h-3.5" />
              </div>
              Call Transcript — {call.contact_name}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {call.phone_number} • {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s •{' '}
              <span className={sentimentColor(call.sentiment)}>{call.sentiment} sentiment</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {transcripts.map((t, idx) => {
            const isRep = t.speaker === 'rep';
            return (
              <div key={idx} className={`flex gap-3 ${isRep ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border ${
                    isRep
                      ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {isRep ? <Mic className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={`flex-1 space-y-1.5 ${isRep ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`font-bold uppercase tracking-wider ${isRep ? 'text-brand-400' : 'text-slate-400'}`}>
                      {isRep ? 'Sales Rep' : call.contact_name}
                    </span>
                    <span className="text-slate-600 flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(t.timestamp_seconds)}
                    </span>
                    <span className={`text-[9px] font-semibold ${sentimentColor(t.sentiment)}`}>
                      {t.sentiment}
                    </span>
                  </div>
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isRep
                        ? 'bg-brand-600/20 border border-brand-500/30 text-slate-200 rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                    }`}
                  >
                    {t.text}
                  </div>
                  {t.coaching_tip && (
                    <div className="max-w-[90%] p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                      <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{t.coaching_tip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            {transcripts.length} turns • AI battle-cards highlighted in amber
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
