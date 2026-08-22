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
    if (s === 'positive') return 'text-primary';
    if (s === 'negative') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm font-mono">
      <div className="w-full max-w-2xl bg-card border border-border rounded-none shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
          <div>
            <h2 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1 rounded-none bg-background border border-border text-primary">
                <Mic className="w-3.5 h-3.5" />
              </div>
              CALL TRANSCRIPT — {call.contact_name}
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase">
              {call.phone_number} • {Math.floor(call.duration_seconds / 60)}M {call.duration_seconds % 60}S •{' '}
              <span className={sentimentColor(call.sentiment)}>{call.sentiment} SENTIMENT</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-muted-foreground hover:bg-background hover:text-foreground transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 font-mono">
          {transcripts.map((t, idx) => {
            const isRep = t.speaker === 'rep';
            return (
              <div key={idx} className={`flex gap-2.5 ${isRep ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`shrink-0 w-6 h-6 rounded-none flex items-center justify-center border ${isRep
                      ? 'bg-background border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground'
                    }`}
                >
                  {isRep ? <Mic className="w-3 h-3" /> : <User className="w-3 h-3" />}
                </div>
                <div className={`flex-1 space-y-1 ${isRep ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 text-[9px] uppercase font-mono">
                    <span className={`font-bold ${isRep ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isRep ? 'SALES REP' : call.contact_name}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(t.timestamp_seconds)}
                    </span>
                    <span className={`font-bold ${sentimentColor(t.sentiment)}`}>
                      {t.sentiment}
                    </span>
                  </div>
                  <div
                    className={`max-w-[90%] p-2.5 rounded-none text-xs leading-relaxed font-mono ${isRep
                        ? 'bg-background border border-primary text-foreground'
                        : 'bg-background border border-border text-foreground'
                      }`}
                  >
                    {t.text}
                  </div>
                  {t.coaching_tip && (
                    <div className="max-w-[90%] p-2 rounded-none bg-background border border-amber-500/40 text-amber-300 text-[10px] flex items-start gap-1.5 uppercase">
                      <Sparkles className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
                      <span>{t.coaching_tip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between font-mono">
          <span className="text-[9px] text-muted-foreground font-mono uppercase">
            {transcripts.length} TURNS • BATTLE-CARDS HIGHLIGHTED IN AMBER
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-none text-xs font-bold uppercase bg-background text-foreground hover:bg-card border border-border transition-none"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
