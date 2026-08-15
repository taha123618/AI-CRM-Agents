import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { voiceAiApi } from './api/voiceAiApi';
import { VoiceCall, VoiceTurnAnalysis } from './types/voiceAi.types';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  Sparkles,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';

export function VoiceAIFeature() {
  const queryClient = useQueryClient();
  const { data: calls, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['voice-calls'],
    queryFn: () => voiceAiApi.getCalls(),
  });

  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<VoiceTurnAnalysis[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Live timer during call
  useEffect(() => {
    let timer: any;
    if (isLiveCallActive) {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isLiveCallActive]);

  // Turn analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: (payload: { speaker: string; text: string }) => voiceAiApi.analyzeTurn(payload),
    onSuccess: (data) => {
      setLiveTranscript((prev) => [...prev, data]);
    },
  });

  const handleStartCall = () => {
    setIsLiveCallActive(true);
    setLiveTranscript([
      {
        speaker: 'rep',
        text: 'Hi Marcus! Thanks for hopping on the line. How are your SDR lead qualification metrics tracking this month?',
        sentiment: 'neutral',
        timestamp: '00:02',
      },
    ]);
  };

  const handleSendSpeechTurn = async (speaker: 'rep' | 'prospect') => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    await analyzeMutation.mutateAsync({ speaker, text });
  };

  const handleEndCall = async () => {
    setIsLiveCallActive(false);
    await voiceAiApi.createCall({
      contact_name: 'Marcus Vance',
      phone_number: '+1 (415) 890-2144',
      direction: 'outbound',
      status: 'completed',
      duration_seconds: callDuration || 180,
      sentiment: 'positive',
      buyer_intent_score: 86,
      summary: 'Live call completed. Client evaluated Gong vs AI CRM multi-agent architecture and requested SOC2 paperwork.',
      action_items: [
        'Send custom enterprise pricing matrix',
        'Book solutions engineer for follow-up demo',
      ],
      objections_handled: ['Budget Constraints', 'Competitor Comparison'],
    });
    queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
  };

  const activeCallRecord = selectedCall || (calls && calls.length > 0 ? calls[0] : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span>Voice AI Call Intelligence & Audio Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time speech analytics, autonomous sales objection battle-cards, and automated CRM call synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          {!isLiveCallActive ? (
            <Button variant="primary" size="sm" onClick={handleStartCall} className="bg-emerald-600 hover:bg-emerald-500">
              <Mic className="w-4 h-4 mr-1.5" />
              <span>Launch Live Call Simulator</span>
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={handleEndCall}>
              <PhoneOff className="w-4 h-4 mr-1.5" />
              <span>End Call ({Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Active Call Studio Banner */}
      {isLiveCallActive && (
        <Card className="p-5 bg-slate-900/90 border-emerald-500/40 shadow-xl shadow-emerald-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Live Call in Progress: Marcus Vance (+1 415-890-2144)</span>
                  <Badge variant="success" className="text-[10px]">Connected</Badge>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Duration: {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')} • Real-Time AI Battle-Card Active
                </span>
              </div>
            </div>

            {/* Audio Waveform simulation */}
            <div className="flex items-center gap-1 h-6">
              {[40, 70, 90, 30, 80, 100, 60, 85, 45, 95, 30, 75].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Real-time Dialogue & Coaching Battle Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {liveTranscript.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    t.speaker === 'rep'
                      ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                      : 'bg-brand-500/10 border-brand-500/30 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-brand-400">
                      {t.speaker === 'rep' ? 'Sales Rep (You)' : 'Prospect (Marcus Vance)'}
                    </span>
                    <span>{t.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{t.text}</p>

                  {/* Battle-Card coaching suggestion */}
                  {t.coaching_tip && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{t.coaching_tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Interactive Speech Input Simulator */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                  Inject Speech Turn
                </label>
                <p className="text-[10px] text-slate-400 mb-2">
                  Simulate live audio speech to trigger real-time AI objection handling.
                </p>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. It seems expensive compared to Salesforce..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleSendSpeechTurn('rep')}
                >
                  Speak as Rep
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-500"
                  onClick={() => handleSendSpeechTurn('prospect')}
                >
                  Speak as Prospect
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Historical Calls & Detailed Intelligence View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Call Records List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Recorded Call Logs ({calls?.length || 0})</span>
            </h3>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading call records...</div>
          ) : (
            <div className="space-y-2.5">
              {(calls || []).map((c) => {
                const isSelected = activeCallRecord?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCall(c)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.contact_name}</span>
                      <Badge variant={c.sentiment === 'positive' ? 'success' : 'default'} className="text-[10px]">
                        {c.sentiment}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">{c.summary}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{c.phone_number}</span>
                      <span className="text-purple-400 font-bold">Intent: {c.buyer_intent_score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Deep Call Analysis & Action Items */}
        <div className="lg:col-span-2 space-y-4">
          {activeCallRecord ? (
            <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{activeCallRecord.contact_name}</h2>
                    <Badge variant="default" className="text-[10px]">Outbound Call</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {activeCallRecord.phone_number} • {Math.floor(activeCallRecord.duration_seconds / 60)}m {activeCallRecord.duration_seconds % 60}s duration
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Buyer Intent</span>
                    <span className="text-sm font-mono font-black text-purple-400">
                      {activeCallRecord.buyer_intent_score} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Audio Playback simulator */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-400 transition-colors"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <div>
                    <div className="text-xs font-semibold text-white">Call Recording Playback</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {isPlayingAudio ? 'Playing 0:42 / 5:42' : 'Duration: 5:42 • 44.1 kHz WAV'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 h-5 opacity-75">
                  {[30, 60, 90, 40, 70, 100, 50, 80, 40, 90, 60, 30].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-brand-400 rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Executive Call Synthesis
                </span>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed font-sans">
                  {activeCallRecord.summary}
                </p>
              </div>

              {/* Structured Action Items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated Action Items ({activeCallRecord.action_items?.length || 0})</span>
                </span>
                <div className="space-y-1.5">
                  {(activeCallRecord.action_items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="py-24 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
              Select a call to inspect detailed audio intelligence and action items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
