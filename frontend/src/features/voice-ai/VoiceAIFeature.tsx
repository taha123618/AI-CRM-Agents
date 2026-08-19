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
    <Card className={`p-3.5 bg-[#121212] border border-[#3A4552] rounded-none hover:border-[#FFB800] transition-none flex items-start gap-3 group font-mono ${glowClass}`}>
      <div className="p-2 rounded-none bg-[#0B0C10] text-[#FFB800] border border-[#3A4552] transition-none shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
          {label}
        </span>
        <div className={`text-xl font-black font-mono tracking-tight mt-0.5 ${color}`}>{value}</div>
        {sub && <span className="text-[9px] text-slate-500 block mt-0.5 truncate uppercase">{sub}</span>}
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
      audioContextRef.current.close().catch(() => { });
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
    <div className="space-y-4 font-mono pb-12">
      {/* ── Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-none bg-[#121212] border border-[#3A4552] shadow-2xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5 z-10">
          <div className="p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] text-[#FFB800] shadow-md shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                <span>VOICE AI INTELLIGENCE STUDIO</span>
                <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold bg-[#0B0C10] text-[#FFB800] border border-[#FFB800]/50 uppercase">
                  V2.4 LIVE ENGINE
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 uppercase">
              REAL-TIME WEB AUDIO RECOGNITION, DYNAMIC OBJECTION BATTLE-CARDS, AND SYNCHRONIZED CRM AUDIO PLAYBACK.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="text-xs h-8 px-3 uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>REFRESH</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGatewayModalOpen(true)}
            className="text-xs h-8 px-3 uppercase border-[#00E5FF]/40 text-[#00E5FF] hover:border-[#00E5FF]"
          >
            <Radio className="w-3.5 h-3.5 mr-1" />
            <span>TWILIO / WEBRTC GATEWAY</span>
          </Button>

          {!isLiveCallActive ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartCall}
              className="text-xs h-8 px-3.5 uppercase font-bold"
            >
              <Mic className="w-4 h-4 mr-1 text-[#0B0C10]" />
              <span>LAUNCH LIVE CALL</span>
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndCall}
              className="text-xs h-8 px-3.5 uppercase font-bold"
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              <span>END CALL ({fmtDuration(callDuration)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── KPI Stats Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="TOTAL RECORDED CALLS"
          value={stats?.total_calls ?? 0}
          sub={`${stats?.calls_this_week ?? 0} RECORDED THIS WEEK`}
          color="text-white"
          icon={<PhoneCall className="w-4 h-4 text-[#FFB800]" />}
        />
        <StatCard
          label="AVG BUYER INTENT"
          value={`${stats?.avg_buyer_intent_score ?? 0}%`}
          sub="PREDICTIVE CLOSING PROBABILITY"
          color="text-[#FFB800]"
          icon={<TrendingUp className="w-4 h-4 text-[#FFB800]" />}
        />
        <StatCard
          label="POSITIVE SENTIMENT"
          value={
            stats?.sentiment_distribution
              ? `${Math.round(
                (stats.sentiment_distribution.positive /
                  Math.max(stats.total_calls, 1)) *
                100
              )}%`
              : '—'
          }
          sub={`${stats?.sentiment_distribution.positive ?? 0} QUALIFIED CALLS`}
          color="text-[#00E5FF]"
          icon={<BarChart2 className="w-4 h-4 text-[#00E5FF]" />}
        />
        <StatCard
          label="AVG CALL DURATION"
          value={fmtDuration(stats?.avg_duration_seconds ?? 0)}
          sub={`${stats?.direction_split.outbound ?? 0} OUTBOUND • ${stats?.direction_split.inbound ?? 0} INBOUND`}
          color="text-[#FFB800]"
          icon={<Clock className="w-4 h-4 text-[#FFB800]" />}
        />
      </div>

      {/* ── Modern Live Call Studio with Web Audio Frequency Visualizer ── */}
      {isLiveCallActive && (
        <Card className="p-4 sm:p-5 bg-[#121212] border border-[#FFB800] shadow-2xl space-y-4 rounded-none">
          {/* Top In-Call Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#3A4552] pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-none bg-[#FFB800] shadow-md" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white uppercase">
                    LIVE CALL: {contactName}
                  </h3>
                  <Badge variant="success" className="text-[9px] uppercase font-mono">
                    LIVE AUDIO CONNECTED
                  </Badge>
                  {isMicListening ? (
                    <Badge variant="default" className="text-[9px] uppercase font-mono flex items-center gap-1">
                      <Radio className="w-3 h-3 text-[#FFB800]" />
                      MIC LIVE
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[9px] uppercase font-mono">
                      MIC PAUSED
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2 uppercase">
                  <span>{phoneNumber}</span>
                  <span>•</span>
                  <span>DURATION: <strong className="text-[#FFB800]">{fmtDuration(callDuration)}</strong></span>
                </div>
              </div>
            </div>

            {/* Real Web Audio Amplitude Visualizer */}
            <div className="flex items-center gap-3 bg-[#0B0C10] p-2 rounded-none border border-[#3A4552]">
              <div className="flex items-center gap-1 h-7 px-2">
                {audioFrequencies.map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-none bg-[#FFB800] transition-none"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="border-l border-[#3A4552] pl-3 pr-1 text-right">
                <span className="text-[8px] font-bold uppercase text-slate-500 block">BUYER INTENT</span>
                <span className="text-sm font-black font-mono text-[#FFB800]">{liveIntentScore}%</span>
              </div>
            </div>
          </div>

          {/* Mic warning banner if denied */}
          {micPermissionDenied && (
            <div className="p-2.5 rounded-none bg-[#0B0C10] border border-[#FFB800]/50 text-[#FFB800] text-xs flex items-center justify-between uppercase">
              <div className="flex items-center gap-2">
                <MicOff className="w-4 h-4 shrink-0" />
                <span>MICROPHONE ACCESS WAS DENIED. USE SPEECH BUTTONS OR TYPE TURNS BELOW.</span>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 uppercase" onClick={startAudioRecording}>
                RETRY MIC
              </Button>
            </div>
          )}

          {/* Real-time speech recognition feedback */}
          {speechRecognizedText && (
            <div className="p-2.5 rounded-none bg-[#0B0C10] border border-[#FFB800]/50 text-[#FFB800] text-xs flex items-center gap-2 uppercase">
              <Mic className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span className="font-bold uppercase text-[9px]">LISTENING:</span>
              <span className="font-mono">"{speechRecognizedText}"</span>
            </div>
          )}

          {/* Live Studio Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Live Dialogue Stream */}
            <div className="lg:col-span-2 space-y-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {liveTranscript.map((t, idx) => {
                const isRep = t.speaker === 'rep';
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-none border text-xs space-y-1.5 transition-none uppercase ${isRep
                        ? 'bg-[#0B0C10] border-[#3A4552] text-slate-200'
                        : 'bg-[#0B0C10] border-[#FFB800]/50 text-white'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${isRep ? 'text-[#00E5FF]' : 'text-[#FFB800]'}`}>
                        {isRep ? <User className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Mic className="w-3.5 h-3.5 text-[#FFB800]" />}
                        {isRep ? 'SALES REP (YOU)' : `${contactName} (PROSPECT)`}
                      </span>
                      <span className="font-mono text-slate-500">{t.timestamp}</span>
                    </div>

                    <p className="leading-relaxed font-mono">{t.text}</p>

                    {/* AI Battle-Card Prompt */}
                    {t.coaching_tip && (
                      <div className="p-2 rounded-none bg-[#121212] border border-[#FFB800]/40 text-[#FFB800] text-[10px] flex items-start gap-1.5 uppercase font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFB800] shrink-0 mt-0.5" />
                        <span className="leading-snug font-medium">{t.coaching_tip}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dynamic AI Battle-Card & Speech Injection Deck */}
            <div className="p-3.5 rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>SPEAKER CHANNEL</span>
                  </span>
                  <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-none border border-[#3A4552] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveSpeaker('rep')}
                      className={`px-2 py-0.5 rounded-none font-bold uppercase transition-none ${activeSpeaker === 'rep'
                          ? 'bg-[#FFB800] text-[#0B0C10]'
                          : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      REP
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSpeaker('prospect')}
                      className={`px-2 py-0.5 rounded-none font-bold uppercase transition-none ${activeSpeaker === 'prospect'
                          ? 'bg-[#FFB800] text-[#0B0C10]'
                          : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      PROSPECT
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`SPEAK OR TYPE AS ${activeSpeaker === 'rep' ? 'SALES REP' : contactName}...`}
                  className="w-full bg-[#121212] border border-[#3A4552] rounded-none p-2 text-xs text-white focus:outline-none focus:border-[#FFB800] resize-none uppercase font-mono"
                />

                {/* 1-Click Objection Triggers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    TRIGGER OBJECTION BATTLE-CARD:
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
                      className="p-2 text-left rounded-none bg-[#121212] hover:border-[#FFB800] border border-[#3A4552] text-[10px] text-slate-300 transition-none group uppercase font-mono"
                    >
                      <span className="flex items-center gap-1 font-bold text-white group-hover:text-[#FFB800]">
                        <DollarSign className="w-3 h-3 text-[#FFB800]" />
                        PRICING
                      </span>
                      <span className="text-[8px] text-slate-500 block truncate">SALESFORCE VS ROI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'prospect',
                          'We require SOC2 Type II compliance and custom enterprise SLAs before approval.'
                        )
                      }
                      className="p-2 text-left rounded-none bg-[#121212] hover:border-[#FFB800] border border-[#3A4552] text-[10px] text-slate-300 transition-none group uppercase font-mono"
                    >
                      <span className="flex items-center gap-1 font-bold text-white group-hover:text-[#FFB800]">
                        <Shield className="w-3 h-3 text-[#00E5FF]" />
                        SECURITY
                      </span>
                      <span className="text-[8px] text-slate-500 block truncate">SOC2 &amp; ENTERPRISE SLA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'prospect',
                          'Our VP of Sales is evaluating Gong. How does your multi-agent architecture compare?'
                        )
                      }
                      className="p-2 text-left rounded-none bg-[#121212] hover:border-[#FFB800] border border-[#3A4552] text-[10px] text-slate-300 transition-none group uppercase font-mono"
                    >
                      <span className="flex items-center gap-1 font-bold text-white group-hover:text-[#FFB800]">
                        <Zap className="w-3 h-3 text-purple-400" />
                        GONG STACK
                      </span>
                      <span className="text-[8px] text-slate-500 block truncate">MULTI-AGENT FLEET</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendSpeechTurn(
                          'rep',
                          'We deliver 3.4x faster qualification times with autonomous multi-agent fleet routing.'
                        )
                      }
                      className="p-2 text-left rounded-none bg-[#121212] hover:border-[#FFB800] border border-[#3A4552] text-[10px] text-slate-300 transition-none group uppercase font-mono"
                    >
                      <span className="flex items-center gap-1 font-bold text-[#FFB800]">
                        <Sparkles className="w-3 h-3 text-[#FFB800]" />
                        VALUE PITCH
                      </span>
                      <span className="text-[8px] text-slate-500 block truncate">ROI &amp; VELOCITY</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#3A4552]">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7 uppercase"
                  onClick={() => handleSendSpeechTurn('rep')}
                >
                  SEND REP TURN
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs h-7 uppercase font-bold"
                  onClick={() => handleSendSpeechTurn('prospect')}
                >
                  SEND PROSPECT TURN
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3A4552] pb-2">
        <div className="flex items-center gap-1.5">
          {(['overview', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase rounded-none transition-none ${activeTab === tab
                  ? 'bg-[#FFB800] text-[#0B0C10] border border-[#FFB800]'
                  : 'bg-[#121212] text-slate-300 border border-[#3A4552] hover:border-[#FFB800] hover:text-white'
                }`}
            >
              {tab === 'overview' ? 'CALL RECORDS & AUDIO' : 'INTELLIGENCE ANALYTICS'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH CONTACTS, PHONES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121212] border border-[#3A4552] rounded-none pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-[#FFB800] w-56 uppercase font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="bg-[#121212] border border-[#3A4552] rounded-none px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
            >
              <option value="">ALL SENTIMENTS</option>
              <option value="positive">POSITIVE</option>
              <option value="neutral">NEUTRAL</option>
              <option value="negative">NEGATIVE</option>
            </select>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="bg-[#121212] border border-[#3A4552] rounded-none px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
            >
              <option value="">ALL DIRECTIONS</option>
              <option value="outbound">OUTBOUND</option>
              <option value="inbound">INBOUND</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TAB: OVERVIEW (Records & Audio Player) ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Call Records List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>RECORDED CALLS ({calls?.length ?? 0})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">SORTED BY DATE</span>
            </h3>

            {isLoading ? (
              <div className="py-16 text-center text-slate-500 text-xs uppercase font-mono">LOADING RECORDED CALLS...</div>
            ) : !calls?.length ? (
              <div className="py-16 text-center text-slate-500 text-xs rounded-none bg-[#121212] border border-[#3A4552] p-6 uppercase font-mono">
                NO CALLS MATCH YOUR QUERY OR FILTERS.
              </div>
            ) : (
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
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
                      className={`p-3.5 rounded-none border cursor-pointer transition-none space-y-2 ${isSelected
                          ? 'bg-[#121212] border-[#FFB800] text-white shadow-xl'
                          : 'bg-[#121212] border-[#3A4552] hover:border-[#FFB800] text-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded-none ${c.direction === 'outbound' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-[#FFB800]/10 text-[#FFB800]'}`}>
                            {c.direction === 'outbound' ? (
                              <PhoneOutgoing className="w-3.5 h-3.5" />
                            ) : (
                              <PhoneIncoming className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white uppercase">{c.contact_name}</span>
                          {hasCustomAudio && (
                            <span className="px-1.5 py-0.2 rounded-none bg-[#0B0C10] text-[#FFB800] text-[8px] font-mono font-bold border border-[#3A4552]">
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
                          className="text-[9px] uppercase font-mono"
                        >
                          {c.sentiment}
                        </Badge>
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed uppercase">{c.summary}</p>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-[#3A4552] uppercase">
                        <span>{fmtDuration(c.duration_seconds)} DURATION</span>
                        <span className="text-[#FFB800] font-bold">INTENT: {c.buyer_intent_score}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call Intelligence & Audio Player Panel */}
          <div className="lg:col-span-2 space-y-3.5">
            {activeCallRecord ? (
              <Card className="p-4 sm:p-5 bg-[#121212] border border-[#3A4552] rounded-none shadow-2xl space-y-4">
                {/* Call Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#3A4552] pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-white uppercase">{activeCallRecord.contact_name}</h2>
                      <Badge variant="default" className="text-[9px] uppercase font-mono">
                        {activeCallRecord.direction}
                      </Badge>
                      <Badge
                        variant={
                          activeCallRecord.sentiment === 'positive'
                            ? 'success'
                            : activeCallRecord.sentiment === 'negative'
                              ? 'danger'
                              : 'default'
                        }
                        className="text-[9px] uppercase font-mono"
                      >
                        {activeCallRecord.sentiment}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono uppercase">
                      {activeCallRecord.phone_number} • TOTAL DURATION: {fmtDuration(activeCallRecord.duration_seconds)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-wider">
                        BUYER INTENT SCORE
                      </span>
                      <span className="text-base font-mono font-black text-[#FFB800]">
                        {activeCallRecord.buyer_intent_score} / 100
                      </span>
                    </div>

                    <button
                      type="button"
                      title="Delete Call Record"
                      onClick={() => deleteMutation.mutate(activeCallRecord.id)}
                      className="p-1.5 rounded-none text-slate-500 hover:text-[#FF2A54] hover:bg-[#FF2A54]/10 transition-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'INTENT PROBABILITY', value: activeCallRecord.buyer_intent_score, color: 'bg-[#FFB800]' },
                    {
                      label: 'OBJECTIONS HANDLED',
                      value: Math.min(activeCallRecord.objections_handled.length * 30, 100),
                      color: 'bg-[#FFB800]',
                    },
                    {
                      label: 'CALL HEALTH',
                      value:
                        activeCallRecord.sentiment === 'positive'
                          ? 92
                          : activeCallRecord.sentiment === 'neutral'
                            ? 60
                            : 28,
                      color:
                        activeCallRecord.sentiment === 'positive'
                          ? 'bg-[#FFB800]'
                          : activeCallRecord.sentiment === 'negative'
                            ? 'bg-[#FF2A54]'
                            : 'bg-slate-500',
                    },
                  ].map((item) => (
                    <div key={item.label} className="p-2.5 rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">{item.label}</span>
                        <span className="text-white font-mono font-bold">{item.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-none bg-[#121212] overflow-hidden">
                        <div
                          className={`h-full rounded-none ${item.color} transition-none`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Modern Interactive Audio Player ── */}
                <div className="p-4 rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-3 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTogglePlayAudio}
                        className="p-2.5 rounded-none bg-[#FFB800] text-[#0B0C10] font-bold shadow-lg transition-none flex items-center justify-center"
                        title={isPlayingAudio ? 'Pause Playback' : 'Play Audio Recording'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div>
                        <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                          <span>SPEECH INTELLIGENCE AUDIO PLAYER</span>
                          {isPlayingAudio && (
                            <span className="w-2 h-2 rounded-none bg-[#FFB800]" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">
                          {isPlayingAudio
                            ? `PLAYING: ${fmtDuration(playbackCurrentTime)} / ${fmtDuration(playbackDuration || activeCallRecord.duration_seconds)}`
                            : `DURATION: ${fmtDuration(activeCallRecord.duration_seconds)} • 44.1 KHZ RAW STREAM`}
                        </div>
                      </div>
                    </div>

                    {/* Speed & Volume Controls */}
                    <div className="flex items-center gap-2.5">
                      {/* Playback speed selector */}
                      <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-none border border-[#3A4552] text-[9px] font-mono font-bold">
                        {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setPlaybackRate(rate);
                              if (audioElementRef.current) audioElementRef.current.playbackRate = rate;
                            }}
                            className={`px-1.5 py-0.5 rounded-none transition-none ${playbackRate === rate ? 'bg-[#FFB800] text-[#0B0C10]' : 'text-slate-400 hover:text-slate-200'
                              }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>

                      {/* Mute & Volume Slider */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleToggleMute}
                          className="p-1 rounded-none text-slate-400 hover:text-white transition-none"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#FF2A54]" /> : <Volume2 className="w-3.5 h-3.5" />}
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
                          className="w-12 h-1 bg-[#121212] accent-[#FFB800] rounded-none cursor-pointer"
                          title={`Volume: ${Math.round(audioVolume * 100)}%`}
                        />
                      </div>

                      {/* Download button */}
                      {(callAudioMap[activeCallRecord.id] || activeCallRecord.recording_url) && (
                        <a
                          href={callAudioMap[activeCallRecord.id] || activeCallRecord.recording_url || '#'}
                          download={`call-${activeCallRecord.contact_name.replace(/\s+/g, '-').toLowerCase()}.webm`}
                          className="p-1.5 rounded-none text-[#FFB800] bg-[#0B0C10] hover:bg-[#FFB800] hover:text-[#0B0C10] border border-[#3A4552] transition-none"
                          title="Download Audio Recording"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Audio Progress Scrubber */}
                  <div className="space-y-1.5 cursor-pointer pt-0.5" onClick={handleSeekAudio}>
                    <div className="w-full h-2 bg-[#121212] rounded-none overflow-hidden border border-[#3A4552] relative">
                      <div
                        className="h-full bg-[#FFB800] transition-none"
                        style={{ width: `${playbackProgress}%` }}
                      />
                    </div>

                    {/* Dynamic Waveform Bars */}
                    <div className="flex items-center justify-between gap-1 h-5 pt-0.5">
                      {[30, 60, 95, 40, 75, 100, 55, 85, 45, 95, 65, 30, 80, 95, 50, 75, 45, 90, 60, 35, 75, 90, 40, 65].map(
                        (h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-none transition-none ${isPlayingAudio ? 'bg-[#FFB800]' : 'bg-[#3A4552]'
                              }`}
                            style={{
                              height: `${h}%`,
                              opacity: playbackProgress > (i / 24) * 100 ? 1 : 0.3,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Box with Quick Copy & Email Generator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>EXECUTIVE CALL SYNTHESIS</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="text-[10px] text-slate-400 hover:text-[#FFB800] flex items-center gap-1 uppercase transition-none"
                      >
                        {isCopiedSummary ? <Check className="w-3 h-3 text-[#FFB800]" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopiedSummary ? 'COPIED!' : 'COPY SUMMARY'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailDraftModal(true)}
                        className="text-[10px] text-[#00E5FF] hover:text-[#FFB800] flex items-center gap-1 uppercase transition-none"
                      >
                        <Mail className="w-3 h-3" />
                        <span>DRAFT FOLLOW-UP EMAIL</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 bg-[#0B0C10] p-3 rounded-none border border-[#3A4552] leading-relaxed uppercase">
                    {activeCallRecord.summary}
                  </p>
                </div>

                {/* Objections Handled Badges */}
                {activeCallRecord.objections_handled.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      OBJECTIONS HANDLED ({activeCallRecord.objections_handled.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCallRecord.objections_handled.map((obj) => (
                        <Badge
                          key={obj}
                          variant="warning"
                          className="text-[10px] px-2 py-0.5 uppercase font-mono"
                        >
                          🛡️ {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items List */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>NEXT ACTION ITEMS ({activeCallRecord.action_items?.length ?? 0})</span>
                  </span>
                  <div className="space-y-1.5">
                    {(activeCallRecord.action_items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-slate-200 flex items-center gap-2 hover:border-[#FFB800] transition-none uppercase"
                      >
                        <span className="w-2 h-2 rounded-none bg-[#FFB800] shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Full Transcript Modal Trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 uppercase"
                  onClick={() => setTranscriptModalCall(activeCallRecord)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span>INSPECT FULL DIALOGUE TRANSCRIPT</span>
                </Button>
              </Card>
            ) : (
              <div className="py-28 text-center rounded-none bg-[#121212] border border-[#3A4552] text-slate-500 text-xs p-6 uppercase font-mono">
                SELECT A CALL RECORD TO INSPECT AUDIO INTELLIGENCE AND ACTION ITEMS.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Objections Breakdown */}
          <Card className="p-4 bg-[#121212] border-[#3A4552] rounded-none space-y-3 font-mono">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FFB800]" />
                <span>TOP OBJECTION TYPES</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                FREQUENCY OF OBJECTION BATTLE-CARDS TRIGGERED ACROSS ALL VOICE CALLS
              </p>
            </div>
            <div className="h-60">
              {objectionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={objectionChartData} layout="vertical" margin={{ left: 15, right: 15 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      width={100}
                      fontFamily="monospace"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B0C10',
                        borderColor: '#3A4552',
                        borderRadius: '0px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#F1F5F9',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 0, 0, 0]} fill="#FFB800" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono uppercase">
                  NO OBJECTION DATA RECORDED YET.
                </div>
              )}
            </div>
          </Card>

          {/* Sentiment Distribution */}
          <Card className="p-4 bg-[#121212] border-[#3A4552] rounded-none space-y-3 font-mono">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FFB800]" />
                <span>SENTIMENT CLASSIFICATION</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                CALL OUTCOME DISTRIBUTION ACROSS POSITIVE, NEUTRAL, AND NEGATIVE SENTIMENT
              </p>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} fontFamily="monospace" />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0C10',
                      borderColor: '#3A4552',
                      borderRadius: '0px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#F1F5F9',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-lg bg-[#121212] border border-[#3A4552] rounded-none p-5 space-y-3.5 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-none bg-[#0B0C10] text-[#FFB800] border border-[#3A4552]">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase">
                  AUTO-GENERATED FOLLOW-UP EMAIL
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

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">TO:</label>
                <div className="p-2 rounded-none bg-[#0B0C10] border border-[#3A4552] text-white font-mono uppercase">
                  {activeCallRecord.contact_name} &lt;{activeCallRecord.contact_name.toLowerCase().replace(/\s+/g, '.')}@enterprise.com&gt;
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">SUBJECT:</label>
                <div className="p-2 rounded-none bg-[#0B0C10] border border-[#3A4552] text-white font-bold uppercase">
                  FOLLOW-UP: NEXT STEPS FOR AI CRM AUTOMATION &amp; PRICING REVIEW
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold uppercase block mb-1">EMAIL BODY:</label>
                <div className="p-2.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-slate-300 leading-relaxed max-h-48 overflow-y-auto font-mono uppercase text-[11px]">
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3A4552]">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 uppercase"
                onClick={() => setShowEmailDraftModal(false)}
              >
                CLOSE
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-7 uppercase font-bold"
                onClick={() => {
                  navigator.clipboard.writeText(`Hi ${activeCallRecord.contact_name.split(' ')[0]},\n\nGreat speaking with you today! As discussed, here are the next steps:\n${(activeCallRecord.action_items || []).map((a) => `• ${a}`).join('\n')}\n\nBest regards,\nSales Team`);
                  setShowEmailDraftModal(false);
                }}
              >
                COPY &amp; SEND TO EMAIL CLIENT
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

