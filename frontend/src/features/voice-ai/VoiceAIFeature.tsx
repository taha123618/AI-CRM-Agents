import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { voiceAiApi } from './api/voiceAiApi';
import { VoiceCall, VoiceTurnAnalysis } from './types/voiceAi.types';
import { CallTranscriptModal } from './components/CallTranscriptModal';
import { LiveVoiceGatewayModal } from './components/LiveVoiceGatewayModal';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
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
  Volume2,
  VolumeX,
  Download,
  Radio,
  User,
  Copy,
  Check,
  Mail,
  Zap,
  Shield,
  DollarSign,
  Activity,
  Sliders,
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

// ─── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color = 'text-white',
  icon,
  glowClass = '',
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
  glowClass?: string;
}) {
  return (
    <Card className={`p-4 bg-slate-900/60 backdrop-blur-xl border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex items-start gap-3.5 group ${glowClass}`}>
      <div className="p-2.5 rounded-2xl bg-slate-800/90 text-slate-300 border border-slate-700/50 group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
          {label}
        </span>
        <div className={`text-2xl font-black font-mono tracking-tight mt-0.5 ${color}`}>{value}</div>
        {sub && <span className="text-[10px] text-slate-500 block mt-0.5 truncate">{sub}</span>}
      </div>
    </Card>
  );
}

// ─── Speech Recognition Types ──────────────────────────────────────────────────
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => IWindowSpeechRecognition;
    webkitSpeechRecognition?: new () => IWindowSpeechRecognition;
  }
}

// ─── Main Voice AI Feature Component ───────────────────────────────────────────
export function VoiceAIFeature() {
  const queryClient = useQueryClient();

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  // Live Call State
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<VoiceTurnAnalysis[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<'rep' | 'prospect'>('rep');
  const [contactName, setContactName] = useState('Marcus Vance');
  const [phoneNumber, setPhoneNumber] = useState('+1 (415) 890-2144');
  const [callDirection, setCallDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [liveIntentScore, setLiveIntentScore] = useState(78);
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);
  const [showEmailDraftModal, setShowEmailDraftModal] = useState(false);

  // Selection & Modals
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);
  const [transcriptModalCall, setTranscriptModalCall] = useState<VoiceCall | null>(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  // Audio Recording & Web Audio Analyser
  const [isMicListening, setIsMicListening] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [speechRecognizedText, setSpeechRecognizedText] = useState('');
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(16).fill(15));
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [callAudioMap, setCallAudioMap] = useState<Record<string, string>>({});

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<IWindowSpeechRecognition | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Queries & Mutations ─────────────────────────────────────────────────────
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

  // Call duration interval
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
      // Dynamically adjust intent score
      if (data.sentiment === 'positive') {
        setLiveIntentScore((prev) => Math.min(prev + 6, 98));
      } else if (data.sentiment === 'negative') {
        setLiveIntentScore((prev) => Math.max(prev - 8, 25));
      }
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

  // ─── Live Web Audio Analyser Frequency Processing ────────────────────────────
  const setupAudioAnalyser = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateFrequencies = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Sample 16 frequency bands
        const sampled: number[] = [];
        const step = Math.floor(dataArray.length / 16) || 1;
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          sampled.push(Math.max(Math.round((val / 255) * 100), 12));
        }
        setAudioFrequencies(sampled);
        animationFrameRef.current = requestAnimationFrame(updateFrequencies);
      };

      updateFrequencies();
    } catch (e) {
      console.warn('Web Audio Analyser setup skipped:', e);
    }
  }, []);

  const cleanupAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioFrequencies(new Array(16).fill(15));
  }, []);

  // ─── Audio Recording & Speech Recognition ────────────────────────────────────
  const startAudioRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        audioChunksRef.current = [];

        setupAudioAnalyser(stream);

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(stream, options);

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
        setIsMicListening(true);
        setMicPermissionDenied(false);
      }
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      setMicPermissionDenied(true);
      setIsMicListening(false);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (interimTranscript) {
            setSpeechRecognizedText(interimTranscript);
          }

          if (finalTranscript.trim()) {
            const spokenText = finalTranscript.trim();
            setSpeechRecognizedText('');
            analyzeMutation.mutate({ speaker: activeSpeaker, text: spokenText });
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
        };

        recognition.onend = () => {
          if (isLiveCallActive) {
            try {
              recognition.start();
            } catch {
              // already running
            }
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const stopAudioRecordingAndRecognition = (): Promise<Blob | null> => {
    cleanupAudioAnalyser();

    return new Promise((resolve) => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
        speechRecognitionRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((t) => t.stop());
            audioStreamRef.current = null;
          }
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
      } else {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }
        resolve(null);
      }
      setIsMicListening(false);
    });
  };

  // ─── Call Lifecycle ──────────────────────────────────────────────────────────
  const handleStartCall = async () => {
    setIsLiveCallActive(true);
    setLiveIntentScore(78);
    setLiveTranscript([
      {
        speaker: 'rep',
        text: `Hi ${contactName.split(' ')[0]}! Thanks for hopping on the line. How are your SDR lead qualification metrics tracking this month?`,
        sentiment: 'neutral',
        timestamp: '00:02',
      },
    ]);
    await startAudioRecording();
    startSpeechRecognition();
  };

  const handleSendSpeechTurn = async (speaker: 'rep' | 'prospect', customText?: string) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend) return;
    if (!customText) setInputText('');
    await analyzeMutation.mutateAsync({ speaker, text: textToSend });
  };

  const handleEndCall = async () => {
    setIsLiveCallActive(false);
    const audioBlob = await stopAudioRecordingAndRecognition();

    let audioUrl = '';
    if (audioBlob && audioBlob.size > 0) {
      audioUrl = URL.createObjectURL(audioBlob);
      setRecordedAudioUrl(audioUrl);
    }

    const objections = Array.from(
      new Set(liveTranscript.map((t) => t.objection_detected).filter(Boolean) as string[])
    );
    const negativeCount = liveTranscript.filter((t) => t.sentiment === 'negative').length;
    const finalSentiment =
      negativeCount > 2 ? 'negative' : liveTranscript.length > 2 ? 'positive' : 'neutral';

    const res = await voiceAiApi.createCall({
      contact_name: contactName,
      phone_number: phoneNumber,
      direction: callDirection,
      status: 'completed',
      duration_seconds: callDuration || 180,
      sentiment: finalSentiment as 'positive' | 'neutral' | 'negative',
      buyer_intent_score: liveIntentScore,
      summary: `Live speech call with ${contactName}. Prospect evaluated CRM multi-agent qualification speed, addressed objections, and requested follow-up action items.`,
      action_items: [
        `Send enterprise pricing proposal to ${contactName}`,
        'Schedule technical architecture demo with solutions engineer',
        'Share SOC2 compliance whitepaper & security packet',
      ],
      objections_handled:
        objections.length > 0 ? objections : ['Budget Constraints', 'Competitor Comparison'],
      recording_url: audioUrl || undefined,
    });

    if (res?.id && audioUrl) {
      setCallAudioMap((prev) => ({ ...prev, [res.id]: audioUrl }));
    }

    queryClient.invalidateQueries({ queryKey: ['voice-calls'] });
    queryClient.invalidateQueries({ queryKey: ['voice-call-stats'] });
  };

  // ─── Audio Playback System ───────────────────────────────────────────────────
  const activeCallRecord = selectedCall || (calls && calls.length > 0 ? calls[0] : null);

  const stopAllAudioPlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlayingAudio(false);
    setPlaybackProgress(0);
    setPlaybackCurrentTime(0);
  }, []);

  const playSyntheticSpeech = useCallback((call: VoiceCall, rate: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      simulatePlaybackTimer(call.duration_seconds || 30);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText =
      call.summary ||
      `Voice call recording with ${call.contact_name}. Buyer intent score is ${call.buyer_intent_score} percent. ${call.objections_handled.length} objections were handled during the conversation.`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = isMuted ? 0 : audioVolume;

    const estDuration = Math.max(
      Math.round((narrationText.split(' ').length * 0.4) / rate),
      8
    );
    setPlaybackDuration(estDuration);

    utterance.onend = () => stopAllAudioPlayback();
    utterance.onerror = () => stopAllAudioPlayback();

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    let elapsed = 0;
    playbackTimerRef.current = setInterval(() => {
      elapsed += 0.5;
      setPlaybackCurrentTime(elapsed);
      setPlaybackProgress(Math.min((elapsed / estDuration) * 100, 100));
      if (elapsed >= estDuration) {
        stopAllAudioPlayback();
      }
    }, 500);
  }, [audioVolume, isMuted, stopAllAudioPlayback]);

  const simulatePlaybackTimer = (duration: number) => {
    let elapsed = 0;
    playbackTimerRef.current = setInterval(() => {
      elapsed += 1;
      setPlaybackCurrentTime(elapsed);
      setPlaybackProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        stopAllAudioPlayback();
      }
    }, 1000);
  };

  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      stopAllAudioPlayback();
      return;
    }

    if (!activeCallRecord) return;

    const callAudioSource =
      callAudioMap[activeCallRecord.id] ||
      activeCallRecord.recording_url ||
      recordedAudioUrl;

    setIsPlayingAudio(true);
    const targetDuration = activeCallRecord.duration_seconds || 45;
    setPlaybackDuration(targetDuration);

    if (callAudioSource) {
      const audio = new Audio(callAudioSource);
      audio.playbackRate = playbackRate;
      audio.volume = isMuted ? 0 : audioVolume;
      audioElementRef.current = audio;

      audio.ontimeupdate = () => {
        setPlaybackCurrentTime(audio.currentTime);
        setPlaybackProgress(
          (audio.currentTime / (audio.duration || targetDuration)) * 100
        );
      };

      audio.onended = () => stopAllAudioPlayback();

      audio.play().catch((err) => {
        console.warn('Direct audio play failed, falling back to speech synthesis:', err);
        playSyntheticSpeech(activeCallRecord, playbackRate);
      });
    } else {
      playSyntheticSpeech(activeCallRecord, playbackRate);
    }
  };

  const handleSeekAudio = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeCallRecord) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setPlaybackProgress(newProgress);

    const targetSec = (newProgress / 100) * (playbackDuration || activeCallRecord.duration_seconds || 45);
    setPlaybackCurrentTime(targetSec);

    if (audioElementRef.current) {
      audioElementRef.current.currentTime = targetSec;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioElementRef.current) {
      audioElementRef.current.muted = nextMuted;
    }
    if (speechUtteranceRef.current && window.speechSynthesis) {
      speechUtteranceRef.current.volume = nextMuted ? 0 : audioVolume;
    }
  };

  const handleCopySummary = () => {
    if (!activeCallRecord) return;
    const textToCopy = `CALL SUMMARY - ${activeCallRecord.contact_name} (${activeCallRecord.phone_number})\n` +
      `Duration: ${fmtDuration(activeCallRecord.duration_seconds)} | Intent: ${activeCallRecord.buyer_intent_score}%\n\n` +
      `Summary: ${activeCallRecord.summary}\n\n` +
      `Action Items:\n${(activeCallRecord.action_items || []).map((a) => `• ${a}`).join('\n')}\n\n` +
      `Objections Handled: ${(activeCallRecord.objections_handled || []).join(', ')}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2500);
  };

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
    `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-indigo-950/40 border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>Voice AI Intelligence Studio</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v2.4 Live Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time Web Audio recognition, dynamic objection battle-cards, and synchronized CRM audio playback.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGatewayModalOpen(true)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
          >
            <Radio className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            <span>Twilio / WebRTC Gateway</span>
          </Button>

          {!isLiveCallActive ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartCall}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/25 px-4"
            >
              <Mic className="w-4 h-4 mr-2" />
              <span>Launch Live Call</span>
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndCall}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold shadow-lg shadow-rose-600/25 animate-pulse px-4"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              <span>End & Save Call ({fmtDuration(callDuration)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── KPI Stats Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Recorded Calls"
          value={stats?.total_calls ?? 0}
          sub={`${stats?.calls_this_week ?? 0} recorded this week`}
          color="text-white"
          icon={<PhoneCall className="w-4 h-4 text-purple-400" />}
          glowClass="hover:border-purple-500/40"
        />
        <StatCard
          label="Avg Buyer Intent"
          value={`${stats?.avg_buyer_intent_score ?? 0}%`}
          sub="Predictive closing probability"
          color="text-purple-400"
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          glowClass="hover:border-emerald-500/40"
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
          sub={`${stats?.sentiment_distribution.positive ?? 0} qualified calls`}
          color="text-emerald-400"
          icon={<BarChart2 className="w-4 h-4 text-blue-400" />}
          glowClass="hover:border-blue-500/40"
        />
        <StatCard
          label="Avg Call Duration"
          value={fmtDuration(stats?.avg_duration_seconds ?? 0)}
          sub={`${stats?.direction_split.outbound ?? 0} outbound • ${stats?.direction_split.inbound ?? 0} inbound`}
          color="text-amber-400"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          glowClass="hover:border-amber-500/40"
        />
      </div>

      {/* ── Modern Live Call Studio with Web Audio Frequency Visualizer ── */}
      {isLiveCallActive && (
        <Card className="p-6 bg-slate-950/90 border-purple-500/40 shadow-2xl shadow-purple-500/10 space-y-5 rounded-3xl backdrop-blur-2xl animate-in fade-in duration-300">
          {/* Top In-Call Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-md shadow-emerald-500/50" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    Live Call: {contactName}
                  </h3>
                  <Badge variant="success" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Live Audio Connected
                  </Badge>
                  {isMicListening ? (
                    <Badge variant="default" className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                      Mic Live
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px]">
                      Mic Paused
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>{phoneNumber}</span>
                  <span>•</span>
                  <span>Duration: <strong className="text-white">{fmtDuration(callDuration)}</strong></span>
                </div>
              </div>
            </div>

            {/* Real Web Audio Amplitude Visualizer */}
            <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1 h-7 px-2">
                {audioFrequencies.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-indigo-400 transition-all duration-75"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="border-l border-slate-800 pl-3 pr-1 text-right">
                <span className="text-[9px] font-bold uppercase text-slate-500 block">Buyer Intent</span>
                <span className="text-sm font-black font-mono text-emerald-400">{liveIntentScore}%</span>
              </div>
            </div>
          </div>

          {/* Mic warning banner if denied */}
          {micPermissionDenied && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MicOff className="w-4 h-4 shrink-0" />
                <span>Microphone access was denied. You can still use speech buttons or type dialogue turns below.</span>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={startAudioRecording}>
                Retry Mic
              </Button>
            </div>
          )}

          {/* Real-time speech recognition feedback */}
          {speechRecognizedText && (
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2.5 animate-pulse">
              <Mic className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">Listening:</span>
              <span className="italic font-medium">"{speechRecognizedText}"</span>
            </div>
          )}

          {/* Live Studio Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Live Dialogue Stream */}
            <div className="lg:col-span-2 space-y-3 max-h-96 overflow-y-auto pr-1.5 scrollbar-thin">
              {liveTranscript.map((t, idx) => {
                const isRep = t.speaker === 'rep';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                      isRep
                        ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                        : 'bg-purple-950/40 border-purple-500/30 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${isRep ? 'text-blue-400' : 'text-purple-400'}`}>
                        {isRep ? <User className="w-3.5 h-3.5 text-blue-400" /> : <Mic className="w-3.5 h-3.5 text-purple-400" />}
                        {isRep ? 'Sales Rep (You)' : `${contactName} (Prospect)`}
                      </span>
                      <span className="font-mono text-slate-500">{t.timestamp}</span>
                    </div>

                    <p className="leading-relaxed">{t.text}</p>

                    {/* AI Battle-Card Prompt */}
                    {t.coaching_tip && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug font-medium">{t.coaching_tip}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dynamic AI Battle-Card & Speech Injection Deck */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span>Speaker Channel</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveSpeaker('rep')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activeSpeaker === 'rep'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Rep (You)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSpeaker('prospect')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activeSpeaker === 'prospect'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Prospect
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Speak via mic or type as ${activeSpeaker === 'rep' ? 'Sales Rep' : contactName}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none transition-colors"
                />

                {/* 1-Click Objection Triggers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Trigger Objection Battle-Card:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'prospect',
                          'Your pricing seems 30% higher than Salesforce. Can you justify the ROI?'
                        )
                      }
                      className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-[10px] text-slate-300 transition-all group"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-white group-hover:text-purple-300">
                        <DollarSign className="w-3 h-3 text-amber-400" />
                        Pricing
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">Salesforce comparison</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'prospect',
                          'We require SOC2 Type II compliance and custom enterprise SLAs before approval.'
                        )
                      }
                      className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-[10px] text-slate-300 transition-all group"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-white group-hover:text-purple-300">
                        <Shield className="w-3 h-3 text-blue-400" />
                        Security
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">SOC2 & Enterprise SLA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'prospect',
                          'Our VP of Sales is evaluating Gong. How does your multi-agent architecture compare?'
                        )
                      }
                      className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-[10px] text-slate-300 transition-all group"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-white group-hover:text-purple-300">
                        <Zap className="w-3 h-3 text-purple-400" />
                        Gong Stack
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">Multi-agent fleet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'rep',
                          'We deliver 3.4x faster qualification times with autonomous multi-agent fleet routing.'
                        )
                      }
                      className="p-2 text-left rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-slate-300 transition-all group"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Value Pitch
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">ROI & Velocity</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-slate-800 bg-slate-950 hover:bg-slate-800"
                  onClick={() => handleSendSpeechTurn('rep')}
                >
                  Send Rep Turn
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20"
                  onClick={() => handleSendSpeechTurn('prospect')}
                >
                  Send Prospect Turn
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1">
          {(['overview', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab === 'overview' ? 'Call Records & Audio' : 'Intelligence Analytics'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search contacts, phones, summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-56 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Directions</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TAB: OVERVIEW (Records & Audio Player) ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Records List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Recorded Calls ({calls?.length ?? 0})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Sorted by date</span>
            </h3>

            {isLoading ? (
              <div className="py-16 text-center text-slate-500 text-xs">Loading recorded calls...</div>
            ) : !calls?.length ? (
              <div className="py-16 text-center text-slate-500 text-xs rounded-3xl bg-slate-900/30 border border-slate-800 p-6">
                No calls match your query or filters.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
                {calls.map((c) => {
                  const isSelected = activeCallRecord?.id === c.id;
                  const hasCustomAudio = !!(callAudioMap[c.id] || c.recording_url);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        stopAllAudioPlayback();
                        setSelectedCall(c);
                        setContactName(c.contact_name);
                        setPhoneNumber(c.phone_number);
                        setCallDirection(c.direction);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2.5 ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500/60 text-white shadow-xl shadow-purple-500/10'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${c.direction === 'outbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {c.direction === 'outbound' ? (
                              <PhoneOutgoing className="w-3.5 h-3.5" />
                            ) : (
                              <PhoneIncoming className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white">{c.contact_name}</span>
                          {hasCustomAudio && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                              AUDIO
                            </span>
                          )}
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

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{c.summary}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/50">
                        <span>{fmtDuration(c.duration_seconds)} duration</span>
                        <span className="text-purple-400 font-bold">Intent: {c.buyer_intent_score}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call Intelligence & Audio Player Panel */}
          <div className="lg:col-span-2 space-y-4">
            {activeCallRecord ? (
              <Card className="p-6 bg-slate-900/80 border-slate-800/80 rounded-3xl backdrop-blur-xl shadow-2xl space-y-5">
                {/* Call Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-black text-white">{activeCallRecord.contact_name}</h2>
                      <Badge variant="default" className="text-[10px]">
                        {activeCallRecord.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                      </Badge>
                      <Badge
                        variant={
                          activeCallRecord.sentiment === 'positive'
                            ? 'success'
                            : activeCallRecord.sentiment === 'negative'
                            ? 'danger'
                            : 'default'
                        }
                        className="text-[10px]"
                      >
                        {activeCallRecord.sentiment}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {activeCallRecord.phone_number} • Total Duration: {fmtDuration(activeCallRecord.duration_seconds)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">
                        Buyer Intent Score
                      </span>
                      <span className="text-lg font-mono font-black text-purple-400">
                        {activeCallRecord.buyer_intent_score} / 100
                      </span>
                    </div>

                    <button
                      type="button"
                      title="Delete Call Record"
                      onClick={() => deleteMutation.mutate(activeCallRecord.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Intent Probability', value: activeCallRecord.buyer_intent_score, color: 'bg-purple-500' },
                    {
                      label: 'Objections Handled',
                      value: Math.min(activeCallRecord.objections_handled.length * 30, 100),
                      color: 'bg-amber-500',
                    },
                    {
                      label: 'Call Health',
                      value:
                        activeCallRecord.sentiment === 'positive'
                          ? 92
                          : activeCallRecord.sentiment === 'neutral'
                          ? 60
                          : 28,
                      color:
                        activeCallRecord.sentiment === 'positive'
                          ? 'bg-emerald-500'
                          : activeCallRecord.sentiment === 'negative'
                          ? 'bg-rose-500'
                          : 'bg-slate-500',
                    },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">{item.label}</span>
                        <span className="text-white font-mono font-bold">{item.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Modern Interactive Audio Player ── */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950 border border-purple-500/30 space-y-4 shadow-xl shadow-purple-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={handleTogglePlayAudio}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                        title={isPlayingAudio ? 'Pause Playback' : 'Play Audio Recording'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Speech Intelligence Audio Player</span>
                          {isPlayingAudio && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {isPlayingAudio
                            ? `Playing: ${fmtDuration(playbackCurrentTime)} / ${fmtDuration(playbackDuration || activeCallRecord.duration_seconds)}`
                            : `Duration: ${fmtDuration(activeCallRecord.duration_seconds)} • 44.1 kHz Crystal Stream`}
                        </div>
                      </div>
                    </div>

                    {/* Speed & Volume Controls */}
                    <div className="flex items-center gap-3">
                      {/* Playback speed selector */}
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-mono font-bold">
                        {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setPlaybackRate(rate);
                              if (audioElementRef.current) audioElementRef.current.playbackRate = rate;
                            }}
                            className={`px-1.5 py-0.5 rounded-lg transition-colors ${
                              playbackRate === rate ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      {/* Mute & Volume Slider */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleToggleMute}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : audioVolume}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setAudioVolume(val);
                            if (isMuted && val > 0) setIsMuted(false);
                            if (audioElementRef.current) audioElementRef.current.volume = val;
                            if (speechUtteranceRef.current) speechUtteranceRef.current.volume = val;
                          }}
                          className="w-14 h-1 bg-slate-800 accent-purple-500 rounded-lg cursor-pointer"
                          title={`Volume: ${Math.round(audioVolume * 100)}%`}
                        />
                      </div>

                      {/* Download button */}
                      {(callAudioMap[activeCallRecord.id] || activeCallRecord.recording_url) && (
                        <a
                          href={callAudioMap[activeCallRecord.id] || activeCallRecord.recording_url || '#'}
                          download={`call-${activeCallRecord.contact_name.replace(/\s+/g, '-').toLowerCase()}.webm`}
                          className="p-2 rounded-xl text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                          title="Download Audio Recording"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Audio Progress Scrubber */}
                  <div className="space-y-2 cursor-pointer pt-1" onClick={handleSeekAudio}>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 relative">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-400 transition-all duration-150"
                        style={{ width: `${playbackProgress}%` }}
                      />
                    </div>

                    {/* Dynamic Waveform Bars */}
                    <div className="flex items-center justify-between gap-1 h-6 pt-1">
                      {[30, 60, 95, 40, 75, 100, 55, 85, 45, 95, 65, 30, 80, 95, 50, 75, 45, 90, 60, 35, 75, 90, 40, 65].map(
                        (h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              isPlayingAudio ? 'bg-purple-400 animate-pulse' : 'bg-slate-800'
                            }`}
                            style={{
                              height: `${h}%`,
                              animationDelay: `${i * 40}ms`,
                              opacity: playbackProgress > (i / 24) * 100 ? 1 : 0.35,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Box with Quick Copy & Email Generator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Executive Call Synthesis</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        {isCopiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailDraftModal(true)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Draft Follow-up Email</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed font-sans">
                    {activeCallRecord.summary}
                  </p>
                </div>

                {/* Objections Handled Badges */}
                {activeCallRecord.objections_handled.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Objections Handled ({activeCallRecord.objections_handled.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeCallRecord.objections_handled.map((obj) => (
                        <Badge
                          key={obj}
                          variant="warning"
                          className="text-[11px] bg-amber-500/10 text-amber-300 border-amber-500/30 px-2.5 py-1"
                        >
                          🛡️ {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Next Action Items ({activeCallRecord.action_items?.length ?? 0})</span>
                  </span>
                  <div className="space-y-2">
                    {(activeCallRecord.action_items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 flex items-center gap-2.5 hover:bg-emerald-500/10 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Full Transcript Modal Trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-300 py-2.5 rounded-xl"
                  onClick={() => setTranscriptModalCall(activeCallRecord)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Inspect Full Dialogue Transcript & Timestamped Moments</span>
                </Button>
              </Card>
            ) : (
              <div className="py-28 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs p-6">
                Select a call record to inspect audio intelligence, battle-cards, and action items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objections Breakdown */}
          <Card className="p-6 bg-slate-900/80 border-slate-800/80 rounded-3xl backdrop-blur-xl space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Top Objection Types</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Frequency of objection battle-cards triggered across all voice calls
              </p>
            </div>
            <div className="h-60">
              {objectionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={objectionChartData} layout="vertical" margin={{ left: 15, right: 15 }}>
                    <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  No objection data recorded yet.
                </div>
              )}
            </div>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="p-6 bg-slate-900/80 border-slate-800/80 rounded-3xl backdrop-blur-xl space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Sentiment Classification</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Call outcome distribution across positive, neutral, and negative sentiment
              </p>
            </div>
            <div className="h-60">
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
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* ── Follow-up Email Draft Modal ── */}
      {showEmailDraftModal && activeCallRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  Auto-Generated Follow-up Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailDraftModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">To:</label>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono">
                  {activeCallRecord.contact_name} &lt;{activeCallRecord.contact_name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com&gt;
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Subject:</label>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold">
                  Follow-up: Next steps for AI CRM automation & pricing review
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email Body:</label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                  Hi {activeCallRecord.contact_name.split(' ')[0]},<br /><br />
                  Great speaking with you today! As discussed, here is a summary of our conversation and key next steps:<br /><br />
                  <strong>Action Items:</strong><br />
                  {(activeCallRecord.action_items || []).map((a) => `• ${a}`).join('<br />')}
                  <br /><br />
                  Please let me know if you have any questions before our follow-up call.
                  <br /><br />
                  Best regards,<br />
                  AI CRM Sales Team
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailDraftModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-500"
                onClick={() => {
                  navigator.clipboard.writeText(`Hi ${activeCallRecord.contact_name.split(' ')[0]},\n\nGreat speaking with you today! As discussed, here are the next steps:\n${(activeCallRecord.action_items || []).map((a) => `• ${a}`).join('\n')}\n\nBest regards,\nSales Team`);
                  setShowEmailDraftModal(false);
                }}
              >
                Copy & Send to Email Client
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Transcript Modal ── */}
      {transcriptModalCall && (
        <CallTranscriptModal
          call={transcriptModalCall}
          onClose={() => setTranscriptModalCall(null)}
        />
      )}

      {/* ── Twilio / WebRTC Live Voice Gateway Modal ── */}
      <LiveVoiceGatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        contactName={contactName}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}
