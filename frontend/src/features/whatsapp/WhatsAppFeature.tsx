import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { whatsappApi } from './api/whatsappApi';
import { WhatsAppConversation } from './types/whatsapp.types';
import { NewConversationModal } from './components/NewConversationModal';
import { BroadcastModal } from './components/BroadcastModal';
import { WhatsAppTemplatesModal } from './components/WhatsAppTemplatesModal';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  CheckCheck,
  RefreshCw,
  Plus,
  Megaphone,
  Search,
  Archive,
  Tag,
  Activity,
  MessageCircle,
  Clock,
  Zap,
  X,
  Phone,
  Sparkles,
  Mic,
  Paperclip,
  Smile,
  Play,
  Pause,
  Trash2,
  FileText,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Share2,
  Check,
} from 'lucide-react';

// ─── Stat Card Component ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  color = 'text-foreground',
  glowClass = '',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  glowClass?: string;
}) {
  return (
    <Card className={`p-4 bg-card/60 backdrop-blur-xl border-border/80 hover:border-border/80 transition-none  flex items-start gap-3.5 group ${glowClass}`}>
      <div className="p-2.5 rounded-none bg-muted/90 text-foreground/90 border border-border/50 group-hover:scale-105 transition-none ">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
          {label}
        </span>
        <div className={`text-2xl font-black font-mono tracking-tight mt-0.5 ${color}`}>{value}</div>
        {sub && <span className="text-[10px] text-muted-foreground/70 mt-0.5 block truncate">{sub}</span>}
      </div>
    </Card>
  );
}

// ─── Tags Editor ─────────────────────────────────────────────────────────────
function TagsEditor({
  conv,
  onClose,
}: {
  conv: WhatsAppConversation;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>(conv.tags || []);
  const [input, setInput] = useState('');

  const tagMutation = useMutation({
    mutationFn: () => whatsappApi.updateTags(conv.id, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      onClose();
    },
  });

  return (
    <div className="p-3 bg-background border border-border rounded-none space-y-2.5 shadow-xl">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2.5 py-1 rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold font-mono"
          >
            #{t}
            <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
              <X className="w-3 h-3 hover:text-foreground" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault();
              setTags([...tags, input.trim().replace(/^#/, '')]);
              setInput('');
            }
          }}
          placeholder="Type tag and press Enter..."
          className="flex-1 bg-card border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3"
          isLoading={tagMutation.isPending}
          onClick={() => tagMutation.mutate()}
        >
          Save
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Voice Note Message Player Component ───────────────────────────────────────
function VoiceNoteBubble({
  text,
  audioUrl,
  duration = 10,
}: {
  text: string;
  audioUrl?: string | null;
  duration?: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanText =
    text.replace(/\[Voice Note:?.*?\]/i, '').replace(/🎙️/g, '').trim() ||
    'Voice Message';

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);

    // 1. Play real microphone recording if audioUrl exists
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.playbackRate = playbackRate;
        audioRef.current = audio;

        audio.ontimeupdate = () => {
          const cur = audio.currentTime;
          const dur = audio.duration || duration;
          setCurrentTime(cur);
          setProgress((cur / dur) * 100);
        };

        audio.onended = () => {
          stopPlayback();
        };

        audio.play().catch((err) => {
          console.warn('Real audio playback error, falling back to speech synthesis:', err);
          playFallbackSpeech();
        });
        return;
      } catch (e) {
        console.warn('Audio element error:', e);
      }
    }

    // 2. Fallback to Web Speech Synthesis speaking transcribed audio
    playFallbackSpeech();
  };

  const playFallbackSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = playbackRate;
      utterance.onend = () => stopPlayback();
      utterance.onerror = () => stopPlayback();
      window.speechSynthesis.speak(utterance);
    }

    let elapsed = 0;
    const estDuration = Math.max(duration / playbackRate, 4);
    synthTimerRef.current = setInterval(() => {
      elapsed += 0.2;
      setCurrentTime(elapsed);
      const pct = Math.min((elapsed / estDuration) * 100, 100);
      setProgress(pct);
      if (elapsed >= estDuration) {
        stopPlayback();
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const fmtTime = (secs: number) =>
    `0:${Math.floor(secs).toString().padStart(2, '0')}`;

  return (
    <div className="p-3.5 rounded-none bg-emerald-950/50 border border-emerald-500/40 space-y-2.5 w-72 shadow-lg">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-3 rounded-none bg-emerald-500 text-foreground hover:bg-emerald-400 transition-none shadow-md shadow-emerald-500/30 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Interactive Waveform Bars */}
        <div className="flex-1 flex items-center gap-1 h-7">
          {[40, 70, 100, 50, 85, 30, 90, 60, 45, 95, 75, 40, 85, 60, 100, 50, 75, 35].map(
            (h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-none transition-none  ${
                  progress > (i / 18) * 100 ? 'bg-emerald-400 scale-y-110' : 'bg-slate-700'
                }`}
                style={{ height: `${h}%` }}
              />
            )
          )}
        </div>

        {/* Speed toggle */}
        <button
          type="button"
          onClick={() => {
            const nextRate = playbackRate === 1.0 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
            setPlaybackRate(nextRate);
            if (audioRef.current) audioRef.current.playbackRate = nextRate;
          }}
          className="px-2 py-1 rounded-none bg-card border border-border text-[10px] font-mono font-bold text-foreground/90 hover:text-foreground"
        >
          {playbackRate}x
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5 text-emerald-300 font-sans font-medium truncate max-w-[170px]">
          <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
          <span className="truncate">"{cleanText}"</span>
        </span>
        <span className="font-bold text-foreground">
          {fmtTime(isPlaying ? currentTime : duration)}
        </span>
      </div>
    </div>
  );
}

// ─── Main WhatsApp Feature ────────────────────────────────────────────────────
export function WhatsAppFeature() {
  const queryClient = useQueryClient();

  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [senderMode, setSenderMode] = useState<'agent' | 'prospect' | 'bot'>('agent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [editingTagsForConv, setEditingTagsForConv] = useState<string | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Recordings Map (stores real recorded voice note blob URLs)
  const [voiceAudioMap, setVoiceAudioMap] = useState<Record<string, string>>({});

  // Live Voice Note Recording State
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Queries
  const {
    data: conversations,
    isLoading: isLoadingConvs,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: () => whatsappApi.getConversations(),
    refetchInterval: 8000,
  });

  const { data: stats } = useQuery({
    queryKey: ['whatsapp-stats'],
    queryFn: () => whatsappApi.getStats(),
  });

  // Search
  const { data: searchResults } = useQuery({
    queryKey: ['whatsapp-search', searchQuery],
    queryFn: () => whatsappApi.searchConversations(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const displayedConvs =
    searchQuery.length >= 2 ? (searchResults ?? []) : (conversations ?? []);

  const activeConv = selectedConv || (displayedConvs.length > 0 ? displayedConvs[0] : null);

  const { data: messages, isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['whatsapp-messages', activeConv?.id],
    queryFn: () => (activeConv ? whatsappApi.getMessages(activeConv.id) : []),
    enabled: Boolean(activeConv?.id),
    refetchInterval: 3000,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotThinking]);

  // Voice Note Recording Handlers with Real Speech Recognition & Audio Blob
  const startVoiceRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
        setIsRecordingVoiceNote(true);
        setVoiceNoteDuration(0);
        setLiveVoiceTranscript('');

        // Real-time speech recognition for voice notes
        const SpeechRec =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.onresult = (event: any) => {
              let text = '';
              for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
              }
              if (text.trim()) setLiveVoiceTranscript(text.trim());
            };
            rec.start();
            recognitionRef.current = rec;
          } catch (e) {
            console.warn('Speech recognition start failed in voice note:', e);
          }
        }

        voiceTimerRef.current = setInterval(() => {
          setVoiceNoteDuration((s) => s + 1);
        }, 1000);
      }
    } catch (err) {
      console.warn('Microphone permission denied for WhatsApp Voice Note:', err);
    }
  };

  const cancelVoiceRecording = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setIsRecordingVoiceNote(false);
    setVoiceNoteDuration(0);
    setLiveVoiceTranscript('');
  };

  const finishAndSendVoiceRecording = () => {
    const durationSec = voiceNoteDuration || 6;
    const spokenText =
      liveVoiceTranscript.trim() ||
      `Voice message to ${activeConv?.contact_name || 'Prospect'}`;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const durationFormatted = `0:${durationSec.toString().padStart(2, '0')}`;
        const messageText = `🎙️ [Voice Note: ${durationFormatted}] ${spokenText}`;

        sendMutation.mutate(
          { text: messageText, mode: senderMode },
          {
            onSuccess: (res: any) => {
              const msgId = res?.message_id;
              if (msgId) {
                setVoiceAudioMap((prev) => ({ ...prev, [msgId]: audioUrl }));
              }
            },
          }
        );
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }

    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    setIsRecordingVoiceNote(false);
    setVoiceNoteDuration(0);
  };

  const sendMutation = useMutation({
    mutationFn: async ({ text, mode }: { text: string; mode: 'agent' | 'prospect' | 'bot' }) => {
      if (!activeConv) return;
      if (mode === 'prospect') {
        setIsBotThinking(true);
        const res = await whatsappApi.sendInboundWebhook({
          contact_name: activeConv.contact_name,
          phone_number: activeConv.phone_number,
          text,
        });
        setTimeout(() => setIsBotThinking(false), 900);
        return res;
      } else {
        return whatsappApi.sendMessage({
          contact_name: activeConv.contact_name,
          phone_number: activeConv.phone_number,
          text,
          sender_type: mode,
        });
      }
    },
    onSuccess: () => {
      setInputText('');
      setShowAttachmentMenu(false);
      setShowEmojiPicker(false);
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', activeConv?.id] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-stats'] });
    },
  });

  const autoPilotMutation = useMutation({
    mutationFn: ({ id, autoPilot }: { id: string; autoPilot: boolean }) =>
      whatsappApi.toggleAutoPilot(id, autoPilot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => whatsappApi.archiveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-stats'] });
      if (activeConv && activeConv.id === selectedConv?.id) setSelectedConv(null);
    },
  });

  // Quick 1-click trigger to generate an AI Auto-Pilot response
  const triggerAiResponse = async () => {
    if (!activeConv) return;
    setIsBotThinking(true);
    await whatsappApi.sendMessage({
      contact_name: activeConv.contact_name,
      phone_number: activeConv.phone_number,
      text: `Hello ${activeConv.contact_name.split(' ')[0]}, our 24/7 AI Auto-Pilot qualified your lead profile. Let me know if you would like to schedule a 15-minute live platform demo!`,
      sender_type: 'bot',
    });
    setIsBotThinking(false);
    queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', activeConv.id] });
    queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMutation.mutate({ text: inputText.trim(), mode: senderMode });
  };

  const handleReactToMessage = (msgId: string, emoji: string) => {
    setMessageReactions((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === emoji ? '' : emoji,
    }));
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const popularEmojis = ['👍', '❤️', '😂', '🔥', '👏', '🚀', '✅', '🙏'];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-none bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-teal-950/40 border border-emerald-500/20 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-none bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <MessageSquare className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span>WhatsApp Business Multi-Agent Hub</span>
              <span className="px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                24/7 AI Auto-Pilot
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Omnichannel conversational CRM with voice note intelligence, broadcast campaigns, and instant client sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-border bg-card/80 hover:bg-muted text-foreground/90"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplatesModal(true)}
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>Meta Templates &amp; Media</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBroadcastModal(true)}
            className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-foreground"
          >
            <Megaphone className="w-3.5 h-3.5 mr-1.5" />
            <span>New Broadcast</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-foreground font-bold shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Chats"
          value={stats?.active_conversations ?? 0}
          sub={`${stats?.total_conversations ?? 0} total threads`}
          icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
          color="text-emerald-400"
          glowClass="hover:border-emerald-500/40"
        />
        <StatCard
          label="Bot Auto-Pilot Rate"
          value={`${stats?.bot_auto_reply_rate ?? 0}%`}
          sub={`${stats?.auto_pilot_enabled ?? 0} chats automated`}
          icon={<Zap className="w-4 h-4 text-purple-400" />}
          color="text-purple-400"
          glowClass="hover:border-purple-500/40"
        />
        <StatCard
          label="Avg Response Time"
          value={`${stats?.avg_response_time_seconds ?? 0}s`}
          sub="Autonomous SLA speed"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          color="text-amber-400"
          glowClass="hover:border-amber-500/40"
        />
        <StatCard
          label="Unread Inbound"
          value={stats?.unread_total ?? 0}
          sub={`${stats?.handed_off_conversations ?? 0} rep handoffs`}
          icon={<Activity className="w-4 h-4 text-rose-400" />}
          color="text-rose-400"
          glowClass="hover:border-rose-500/40"
        />
      </div>

      {/* ── Main WhatsApp Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border rounded-none overflow-hidden bg-background shadow-2xl h-[720px] max-h-[720px]">
        {/* ── Conversation List ── */}
        <div className="border-r border-border bg-card/40 flex flex-col h-full min-h-0 overflow-hidden">
          {/* List Header */}
          <div className="p-3.5 border-b border-border bg-card/80 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Threads ({displayedConvs.length})</span>
              </span>
              <Badge variant="success" className="gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
                Live Sync
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Search name, phone, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 transition-none"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-800/60 scrollbar-thin">
            {isLoadingConvs ? (
              <div className="py-16 text-center text-muted-foreground/70 text-xs">Loading conversations...</div>
            ) : !displayedConvs?.length ? (
              <div className="py-16 text-center text-muted-foreground/70 text-xs p-4">
                {searchQuery ? 'No matching conversations found.' : 'No conversations started yet.'}
              </div>
            ) : (
              displayedConvs.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-3.5 cursor-pointer transition-none  space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500 text-foreground shadow-lg'
                        : 'hover:bg-card/60 text-foreground/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate">{conv.contact_name}</span>
                      <div className="flex items-center gap-1.5">
                        {conv.unread_count > 0 && (
                          <span className="w-4 h-4 rounded-none bg-emerald-500 text-foreground text-[9px] font-bold flex items-center justify-center animate-bounce">
                            {conv.unread_count}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/70 font-mono">
                          {conv.last_message_at
                            ? new Date(conv.last_message_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>{conv.phone_number}</span>
                      <div className="flex items-center gap-1.5">
                        {conv.status === 'archived' && (
                          <span className="text-[9px] text-muted-foreground/70 uppercase font-bold">Archived</span>
                        )}
                        {conv.ai_auto_pilot && (
                          <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
                            <Bot className="w-3.5 h-3.5" /> Auto
                          </span>
                        )}
                      </div>
                    </div>

                    {conv.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {conv.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-none bg-muted/80 border border-border/50 text-muted-foreground text-[9px] font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="lg:col-span-2 flex flex-col bg-background h-full min-h-0 overflow-hidden relative">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-border bg-card/90 backdrop-blur-xl shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-emerald-600 to-teal-500 text-foreground font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-600/30">
                      {activeConv.contact_name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-none bg-emerald-400 border-2 border-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-foreground">{activeConv.contact_name}</h3>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        online
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground/70" />
                      {activeConv.phone_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Quick Response Trigger */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={triggerAiResponse}
                    isLoading={isBotThinking}
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs h-8"
                  >
                    <Bot className="w-3.5 h-3.5 mr-1" />
                    <span>AI Reply</span>
                  </Button>

                  {/* Tags trigger */}
                  <button
                    type="button"
                    title="Manage tags"
                    onClick={() =>
                      setEditingTagsForConv(
                        editingTagsForConv === activeConv.id ? null : activeConv.id
                      )
                    }
                    className="p-2 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground transition-none"
                  >
                    <Tag className="w-4 h-4" />
                  </button>

                  {/* Archive toggle */}
                  <button
                    type="button"
                    title="Archive chat"
                    onClick={() => archiveMutation.mutate(activeConv.id)}
                    className="p-2 rounded-none text-muted-foreground hover:bg-muted hover:text-amber-400 transition-none"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  {/* AI Auto-Pilot Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      autoPilotMutation.mutate({
                        id: activeConv.id,
                        autoPilot: !activeConv.ai_auto_pilot,
                      })
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold border transition-none ${
                      activeConv.ai_auto_pilot
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Auto: {activeConv.ai_auto_pilot ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Inline Tags Editor */}
              {editingTagsForConv === activeConv.id && (
                <div className="p-3 bg-card border-b border-border shrink-0">
                  <TagsEditor
                    conv={activeConv}
                    onClose={() => setEditingTagsForConv(null)}
                  />
                </div>
              )}

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4 scrollbar-thin bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/40">
                {isLoadingMsgs ? (
                  <div className="py-24 text-center text-muted-foreground/70 text-xs">
                    Loading conversation stream...
                  </div>
                ) : !messages?.length ? (
                  <div className="py-24 text-center text-muted-foreground/70 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 opacity-30 mx-auto" />
                    <p>No messages yet. Send an opening greeting or record a voice note!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isBot = msg.sender_type === 'bot';
                    const isProspect = msg.sender_type === 'prospect';
                    const isAgent = msg.sender_type === 'agent';
                    const isVoiceNote = msg.text.toLowerCase().includes('[voice note');
                    const reaction = messageReactions[msg.id];
                    const audioUrl = voiceAudioMap[msg.id] || msg.media_url;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group ${isProspect ? 'items-start' : 'items-end'} animate-in fade-in `}
                      >
                        <div className="relative">
                          {/* Hover Emoji Reaction Bar */}
                          <div
                            className={`absolute -top-7 ${isProspect ? 'left-0' : 'right-0'} hidden group-hover:flex items-center gap-1 p-1 bg-card border border-border rounded-none shadow-2xl z-20`}
                          >
                            {['👍', '❤️', '🔥', '👏', '🚀'].map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => handleReactToMessage(msg.id, em)}
                                className="w-6 h-6 hover:scale-125 text-xs flex items-center justify-center transition-none"
                              >
                                {em}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-none text-xs space-y-1.5 shadow-xl transition-none ${
                              isBot
                                ? 'bg-gradient-to-br from-purple-950/90 to-slate-900 border border-purple-500/50 text-purple-100 rounded-none-tr-none'
                                : isAgent
                                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-foreground rounded-none-tr-none'
                                : 'bg-card border border-border text-slate-200 rounded-none-tl-none'
                            }`}
                          >
                            {/* Sender Header */}
                            <div className="flex items-center gap-1.5 text-[10px] font-bold mb-1 border-b border-border pb-1">
                              {isBot ? (
                                <span className="flex items-center gap-1 text-purple-300">
                                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                                  AI Auto-Pilot Fleet
                                </span>
                              ) : isAgent ? (
                                <span className="flex items-center gap-1 text-emerald-200">
                                  <User className="w-3.5 h-3.5" />
                                  Sales Representative (You)
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <User className="w-3.5 h-3.5 text-blue-400" />
                                  {activeConv.contact_name} (Lead)
                                </span>
                              )}
                            </div>

                            {msg.intent && (
                              <div className="text-[9px] text-purple-300/80 font-mono uppercase tracking-wider">
                                Intent: {msg.intent}
                              </div>
                            )}

                            {/* Voice Note Player with Real Microphone Audio Playback */}
                            {isVoiceNote ? (
                              <VoiceNoteBubble text={msg.text} audioUrl={audioUrl} />
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                                {msg.text}
                              </p>
                            )}

                            {/* Time & Read Receipts */}
                            <div
                              className={`flex items-center justify-end gap-1 text-[9px] font-mono pt-1 ${
                                isProspect ? 'text-muted-foreground/70' : 'text-emerald-200/70'
                              }`}
                            >
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {!isProspect && (
                                <CheckCheck
                                  className={`w-3.5 h-3.5 ${
                                    msg.status === 'read' ? 'text-emerald-300' : 'text-muted-foreground'
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          {/* Reaction badge on bubble */}
                          {reaction && (
                            <div
                              className={`absolute -bottom-2 ${
                                isProspect ? 'left-2' : 'right-2'
                              } px-1.5 py-0.5 rounded-none bg-card border border-border text-[11px] shadow-lg flex items-center gap-0.5`}
                            >
                              <span>{reaction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* AI typing simulation indicator */}
                {isBotThinking && (
                  <div className="flex items-center gap-2 p-3 rounded-none bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs w-fit animate-pulse">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>AI Auto-Pilot is analyzing lead intent and drafting reply...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick AI Suggestion Chips */}
              <div className="px-4 py-2 bg-card/60 border-t border-border flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                <span className="text-[10px] text-muted-foreground/70 uppercase font-bold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Quick Actions:
                </span>
                {[
                  'Send Enterprise Pricing & Tier Matrix',
                  'Propose Live 15-min Demo Slot with Solutions Architect',
                  'Confirm Scheduled Zoom Briefing',
                  'Share SOC2 Compliance Whitepaper',
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setInputText(tmpl)}
                    className="px-3 py-1 rounded-none bg-card border border-border hover:border-emerald-500/40 text-[10px] text-foreground/90 hover:text-foreground whitespace-nowrap transition-none flex items-center gap-1"
                  >
                    + {tmpl}
                  </button>
                ))}
              </div>

              {/* Attachment Picker Popover */}
              {showAttachmentMenu && (
                <div className="absolute bottom-20 left-4 z-30 p-3 rounded-none bg-card border border-border shadow-2xl grid grid-cols-3 gap-2 w-72 animate-in fade-in ">
                  {[
                    {
                      label: 'Proposal PDF',
                      icon: <FileText className="w-4 h-4 text-blue-400" />,
                      action: () => {
                        sendMutation.mutate({
                          text: '📄 [Attachment: Enterprise_AI_CRM_Proposal_v2.pdf (2.4 MB)] Please review our multi-agent architecture and commercial terms.',
                          mode: senderMode,
                        });
                      },
                    },
                    {
                      label: 'Pricing Matrix',
                      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
                      action: () => {
                        sendMutation.mutate({
                          text: '📊 [Attachment: SaaS_Tier_Pricing_Matrix_2026.pdf] Here is the complete breakdown of Growth, Enterprise, and Custom Agent tiers.',
                          mode: senderMode,
                        });
                      },
                    },
                    {
                      label: 'Demo Screen',
                      icon: <ImageIcon className="w-4 h-4 text-purple-400" />,
                      action: () => {
                        sendMutation.mutate({
                          text: '🖼️ [Screenshot: Realtime_Objection_Battlecard_Studio.png] Preview of our live sales speech battle-card analytics.',
                          mode: senderMode,
                        });
                      },
                    },
                    {
                      label: 'Office Pin',
                      icon: <MapPin className="w-4 h-4 text-rose-400" />,
                      action: () => {
                        sendMutation.mutate({
                          text: '📍 [Location: 500 Howard St, San Francisco, CA] HQ Solutions Briefing Center.',
                          mode: senderMode,
                        });
                      },
                    },
                    {
                      label: 'Contact Card',
                      icon: <User className="w-4 h-4 text-amber-400" />,
                      action: () => {
                        sendMutation.mutate({
                          text: '👤 [vCard: Marcus Vance - Lead Solutions Architect] Phone: +1 415-890-2144.',
                          mode: senderMode,
                        });
                      },
                    },
                  ].map((att) => (
                    <button
                      key={att.label}
                      type="button"
                      onClick={att.action}
                      className="p-2.5 rounded-none bg-background hover:bg-muted border border-border flex flex-col items-center gap-1.5 text-center transition-none group"
                    >
                      <div className="p-2 rounded-none bg-card group-hover:scale-110 transition-none">
                        {att.icon}
                      </div>
                      <span className="text-[10px] font-bold text-foreground/90 group-hover:text-foreground">
                        {att.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 left-14 z-30 p-3 rounded-none bg-card border border-border shadow-2xl grid grid-cols-4 gap-2 w-52 animate-in fade-in ">
                  {popularEmojis.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setInputText((prev) => prev + em);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 text-xl hover:bg-muted rounded-none transition-none flex items-center justify-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Interactive Input Bar / Live Voice Note Recorder ── */}
              <div className="p-3.5 border-t border-border bg-card/90 backdrop-blur-xl shrink-0">
                {isRecordingVoiceNote ? (
                  /* Live Voice Note HUD */
                  <div className="flex items-center justify-between gap-3 bg-background p-2.5 rounded-none border border-rose-500/40 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-none bg-rose-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-rose-400">
                          0:{voiceNoteDuration.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-xs text-foreground/90 font-medium">
                        {liveVoiceTranscript ? `"${liveVoiceTranscript}"` : 'Listening to your voice...'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="p-2 rounded-none text-muted-foreground hover:text-rose-400 hover:bg-card transition-none"
                        title="Cancel Recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={finishAndSendVoiceRecording}
                        className="bg-emerald-600 hover:bg-emerald-500 px-3.5 rounded-none shadow-lg shadow-emerald-600/30"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>Send Note</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Standard Input Bar */
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    {/* Attachment Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className={`p-2 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted transition-none ${
                        showAttachmentMenu ? 'bg-muted text-emerald-400' : ''
                      }`}
                      title="Attach Document / Media"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Emoji Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted transition-none ${
                        showEmojiPicker ? 'bg-muted text-amber-400' : ''
                      }`}
                      title="Add Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {/* Sender Mode Switcher */}
                    <div className="flex items-center bg-background p-0.5 rounded-none border border-border text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSenderMode('agent')}
                        className={`px-2 py-1 rounded-none transition-none ${
                          senderMode === 'agent'
                            ? 'bg-emerald-600 text-foreground'
                            : 'text-muted-foreground hover:text-slate-200'
                        }`}
                        title="Send as Sales Rep"
                      >
                        Rep
                      </button>
                      <button
                        type="button"
                        onClick={() => setSenderMode('prospect')}
                        className={`px-2 py-1 rounded-none transition-none ${
                          senderMode === 'prospect'
                            ? 'bg-blue-600 text-foreground'
                            : 'text-muted-foreground hover:text-slate-200'
                        }`}
                        title="Send as Inbound Prospect (triggers AI Bot reply)"
                      >
                        Lead
                      </button>
                      <button
                        type="button"
                        onClick={() => setSenderMode('bot')}
                        className={`px-2 py-1 rounded-none transition-none ${
                          senderMode === 'bot'
                            ? 'bg-purple-600 text-foreground'
                            : 'text-muted-foreground hover:text-slate-200'
                        }`}
                        title="Send directly as AI Bot"
                      >
                        AI Bot
                      </button>
                    </div>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        senderMode === 'prospect'
                          ? `Speak as ${activeConv.contact_name} (triggers AI Auto-Pilot)...`
                          : senderMode === 'bot'
                          ? 'Send as AI Auto-Pilot Bot...'
                          : 'Type a WhatsApp message...'
                      }
                      className="flex-1 bg-background border border-border rounded-none px-4 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500 transition-none"
                    />

                    {inputText.trim() ? (
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={sendMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 px-4 shrink-0 rounded-none shadow-lg shadow-emerald-600/20"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="p-2.5 rounded-none bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-foreground transition-none shadow-md shadow-emerald-600/10"
                        title="Record Voice Note"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/70 space-y-4 p-8">
              <div className="p-4 rounded-none bg-card border border-border">
                <MessageSquare className="w-12 h-12 opacity-30 text-emerald-400" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-foreground">Select a WhatsApp Conversation</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Review 24/7 lead qualification threads, send voice notes, or launch an outbound broadcast.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500"
                onClick={() => setShowNewModal(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Start New Thread
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewModal && <NewConversationModal onClose={() => setShowNewModal(false)} />}
      {showBroadcastModal && <BroadcastModal onClose={() => setShowBroadcastModal(false)} />}
      {showTemplatesModal && (
        <WhatsAppTemplatesModal
          isOpen={showTemplatesModal}
          onClose={() => setShowTemplatesModal(false)}
          onSelectTemplate={(tpl) => {
            setInputText(tpl.body_text);
          }}
        />
      )}
    </div>
  );
}
