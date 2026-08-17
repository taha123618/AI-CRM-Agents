import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { voiceAiApi } from './api/voiceAiApi';
import { VoiceCall, VoiceTurnAnalysis } from './types/voiceAi.types';
import { CallTranscriptModal } from './components/CallTranscriptModal';
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
  Search,
  Filter,
  Trash2,
  FileText,
  TrendingUp,
  PhoneIncoming,
  PhoneOutgoing,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = 'text-white',
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4 bg-slate-900/60 border-slate-800/80 flex items-start gap-3">
      <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400">{icon}</div>
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </span>
        <div className={`text-xl font-black font-mono mt-0.5 ${color}`}>{value}</div>
        {sub && <span className="text-[10px] text-slate-500 block mt-0.5">{sub}</span>}
      </div>
    </Card>
  );
}

// ─── Main Feature ───────────────────────────────────────────────────────────────
export function VoiceAIFeature() {
  const queryClient = useQueryClient();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterDirection, setFilterDirection] = useState('');

  // State
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<VoiceTurnAnalysis[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcriptModalCall, setTranscriptModalCall] = useState<VoiceCall | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // Data queries
  const {
    data: calls,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['voice-calls', filterSentiment, filterDirection, searchQuery],
    queryFn: () =>
      voiceAiApi.getCalls({
        limit: 50,
        sentiment: filterSentiment || undefined,
        direction: filterDirection || undefined,
        search: searchQuery || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['voice-call-stats'],
    queryFn: () => voiceAiApi.getCallStats(),
  });

  // Live timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isLiveCallActive) {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isLiveCallActive]);

  // Turn analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: (payload: { speaker: string; text: string }) =>
      voiceAiApi.analyzeTurn(payload),
    onSuccess: (data) => {
      setLiveTranscript((prev) => [...prev, data]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => voiceAiApi.deleteCall(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
      queryClient.invalidateQueries({ queryKey: ['voice-call-stats'] });
      setSelectedCall(null);
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
      summary:
        'Live call completed. Client evaluated Gong vs AI CRM multi-agent architecture and requested SOC2 paperwork.',
      action_items: [
        'Send custom enterprise pricing matrix',
        'Book solutions engineer for follow-up demo',
      ],
      objections_handled: ['Budget Constraints', 'Competitor Comparison'],
    });
    queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
    queryClient.invalidateQueries({ queryKey: ['voice-call-stats'] });
  };

  const activeCallRecord = selectedCall || (calls && calls.length > 0 ? calls[0] : null);

  // Objections chart data
  const objectionChartData = (stats?.top_objections || []).map((o) => ({
    name: o.objection.replace(' Objection', '').replace(' Comparison', ''),
    count: o.count,
  }));

  const sentimentData = stats
    ? [
        { name: 'Positive', value: stats.sentiment_distribution.positive, color: '#10b981' },
        { name: 'Neutral', value: stats.sentiment_distribution.neutral, color: '#64748b' },
        { name: 'Negative', value: stats.sentiment_distribution.negative, color: '#ef4444' },
      ]
    : [];

  const fmtDuration = (secs: number) =>
    `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span>Voice AI Call Intelligence Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time speech analytics, objection battle-cards, AI coaching, and automated CRM call synthesis.
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
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartCall}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Mic className="w-4 h-4 mr-1.5" />
              <span>Launch Live Call</span>
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={handleEndCall}>
              <PhoneOff className="w-4 h-4 mr-1.5" />
              <span>End Call ({fmtDuration(callDuration)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── KPI Stats Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Calls"
          value={stats?.total_calls ?? 0}
          sub={`${stats?.calls_this_week ?? 0} this week`}
          color="text-white"
          icon={<PhoneCall className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Buyer Intent"
          value={`${stats?.avg_buyer_intent_score ?? 0}%`}
          sub="Intent score across all calls"
          color="text-purple-400"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Positive Sentiment"
          value={
            stats?.sentiment_distribution
              ? `${Math.round(
                  (stats.sentiment_distribution.positive /
                    Math.max(stats.total_calls, 1)) *
                    100
                )}%`
              : '—'
          }
          sub={`${stats?.sentiment_distribution.positive ?? 0} positive calls`}
          color="text-emerald-400"
          icon={<BarChart2 className="w-4 h-4" />}
        />
        <StatCard
          label="Avg Call Duration"
          value={fmtDuration(stats?.avg_duration_seconds ?? 0)}
          sub={`${stats?.direction_split.outbound ?? 0} outbound / ${stats?.direction_split.inbound ?? 0} inbound`}
          color="text-amber-400"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* ── Live Active Call Studio ── */}
      {isLiveCallActive && (
        <Card className="p-5 bg-slate-900/90 border-emerald-500/40 shadow-xl shadow-emerald-500/5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Live Call: Marcus Vance (+1 415-890-2144)</span>
                  <Badge variant="success" className="text-[10px]">
                    Connected
                  </Badge>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Duration: {fmtDuration(callDuration)} • Real-Time AI Battle-Card Active
                </span>
              </div>
            </div>
            {/* Audio waveform */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Transcript stream */}
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
                  {t.coaching_tip && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{t.coaching_tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Speech input simulator */}
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

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        {(['overview', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'overview' ? 'Call Records' : 'Analytics'}
          </button>
        ))}

        {/* Search + Filters (always visible) */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-44"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Directions</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Records List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Recorded Calls ({calls?.length ?? 0})</span>
            </h3>

            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading call records...</div>
            ) : !calls?.length ? (
              <div className="py-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/30 border border-slate-800">
                No calls match your filters.
              </div>
            ) : (
              <div className="space-y-2">
                {calls.map((c) => {
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
                        <div className="flex items-center gap-1.5">
                          {c.direction === 'outbound' ? (
                            <PhoneOutgoing className="w-3 h-3 text-brand-400" />
                          ) : (
                            <PhoneIncoming className="w-3 h-3 text-emerald-400" />
                          )}
                          <span className="text-xs font-bold text-white">{c.contact_name}</span>
                        </div>
                        <Badge
                          variant={
                            c.sentiment === 'positive'
                              ? 'success'
                              : c.sentiment === 'negative'
                              ? 'danger'
                              : 'default'
                          }
                          className="text-[10px]"
                        >
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

          {/* Call Detail Panel */}
          <div className="lg:col-span-2 space-y-4">
            {activeCallRecord ? (
              <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
                {/* Call Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{activeCallRecord.contact_name}</h2>
                      <Badge variant="default" className="text-[10px]">
                        {activeCallRecord.direction === 'outbound' ? 'Outbound' : 'Inbound'} Call
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {activeCallRecord.phone_number} •{' '}
                      {fmtDuration(activeCallRecord.duration_seconds)} duration
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Buyer Intent</span>
                      <span className="text-sm font-mono font-black text-purple-400">
                        {activeCallRecord.buyer_intent_score} / 100
                      </span>
                    </div>
                    <button
                      type="button"
                      title="Delete call"
                      onClick={() => deleteMutation.mutate(activeCallRecord.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Intent Score', value: activeCallRecord.buyer_intent_score, color: 'bg-purple-500' },
                    {
                      label: 'Objections',
                      value: Math.min(activeCallRecord.objections_handled.length * 25, 100),
                      color: 'bg-amber-500',
                    },
                    {
                      label: 'Sentiment',
                      value:
                        activeCallRecord.sentiment === 'positive'
                          ? 90
                          : activeCallRecord.sentiment === 'neutral'
                          ? 55
                          : 20,
                      color:
                        activeCallRecord.sentiment === 'positive'
                          ? 'bg-emerald-500'
                          : activeCallRecord.sentiment === 'negative'
                          ? 'bg-red-500'
                          : 'bg-slate-500',
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">{item.label}</span>
                        <span className="text-white font-mono font-bold">{item.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800">
                        <div
                          className={`h-1.5 rounded-full ${item.color} transition-all`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audio Playback */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-400 transition-colors"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-white">Call Recording Playback</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {isPlayingAudio
                          ? 'Playing 0:42 / ' + fmtDuration(activeCallRecord.duration_seconds)
                          : 'Duration: ' + fmtDuration(activeCallRecord.duration_seconds) + ' • 44.1 kHz WAV'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 h-5 opacity-75">
                    {[30, 60, 90, 40, 70, 100, 50, 80, 40, 90, 60, 30].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isPlayingAudio ? 'bg-brand-400 animate-pulse' : 'bg-slate-700'
                        }`}
                        style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Executive Call Synthesis
                  </span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {activeCallRecord.summary}
                  </p>
                </div>

                {/* Objections Handled */}
                {activeCallRecord.objections_handled.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Objections Handled
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCallRecord.objections_handled.map((obj) => (
                        <Badge key={obj} variant="warning" className="text-[10px]">
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Action Items ({activeCallRecord.action_items?.length ?? 0})</span>
                  </span>
                  <div className="space-y-1.5">
                    {(activeCallRecord.action_items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Transcript Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-300"
                  onClick={() => setTranscriptModalCall(activeCallRecord)}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  View Full Transcript
                </Button>
              </Card>
            ) : (
              <div className="py-24 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
                Select a call to inspect detailed audio intelligence and action items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objections Breakdown */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Top Objections Handled
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frequency of objection types across all recorded calls
              </p>
            </div>
            <div className="h-52">
              {objectionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={objectionChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  No objection data yet — start recording calls.
                </div>
              )}
            </div>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Sentiment Distribution
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Call outcomes by sentiment classification</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Direction Split Card */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Call Direction Split
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Outbound',
                  value: stats?.direction_split.outbound ?? 0,
                  icon: <PhoneOutgoing className="w-4 h-4" />,
                  color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
                },
                {
                  label: 'Inbound',
                  value: stats?.direction_split.inbound ?? 0,
                  icon: <PhoneIncoming className="w-4 h-4" />,
                  color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-4 rounded-xl border ${item.color} flex flex-col items-center gap-2`}
                >
                  {item.icon}
                  <span className="text-3xl font-black font-mono">{item.value}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Agent Coaching Summary */}
          <Card className="p-5 bg-slate-900/70 border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Coaching Battle-Card Summary
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  tip: '💡 ROI Framing',
                  desc: 'Emphasise 3.4x pipeline growth & payback within 90 days whenever pricing objection is detected.',
                  count: 4,
                },
                {
                  tip: '💡 Competitor Battlecard',
                  desc: 'Deploy autonomous multi-agent fleet vs legacy static dashboard narrative against Salesforce/Gong.',
                  count: 3,
                },
                {
                  tip: '💡 Champion Enablement',
                  desc: 'Offer executive 1-pager and VP briefing deck when authority/decision-maker objection is raised.',
                  count: 2,
                },
                {
                  tip: '💡 Urgency Trigger',
                  desc: 'Quantify cost-of-delay by asking about current pipeline leak rate when timing objection surfaces.',
                  count: 1,
                },
              ].map((item) => (
                <div
                  key={item.tip}
                  className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-300">{item.tip}</span>
                      <span className="text-[10px] text-slate-500 font-mono">×{item.count} triggered</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Transcript Modal */}
      {transcriptModalCall && (
        <CallTranscriptModal
          call={transcriptModalCall}
          onClose={() => setTranscriptModalCall(null)}
        />
      )}
    </div>
  );
}
