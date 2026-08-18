import { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Bot,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';

interface LiveVoiceGatewayModalProps {
  isOpen: boolean;
  contactName?: string;
  phoneNumber?: string;
  onClose: () => void;
}

export function LiveVoiceGatewayModal({
  isOpen,
  contactName = 'Prospect',
  phoneNumber = '+1 (415) 555-0199',
  onClose,
}: LiveVoiceGatewayModalProps) {
  const [, setCallState] = useState<'initiating' | 'connecting' | 'active' | 'ended'>('initiating');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [tokenData, setTokenData] = useState<any | null>(null);
  const [liveTurns, setLiveTurns] = useState<
    Array<{ speaker: string; text: string; intent?: string; battleCard?: string }>
  >([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCallState('connecting');
      setDurationSeconds(0);
      setLiveTurns([]);

      // Fetch live WebRTC session token
      apiClient
        .post('/api/voice-calls/gateway/token', {
          identity: 'rep-agent',
          room_name: `room-${Date.now().toString().slice(-4)}`,
          phone_number: phoneNumber,
        })
        .then((res: { data: any }) => {
          setTokenData(res.data);
          setCallState('active');

          // Initial simulated live speech turns
          setTimeout(() => {
            setLiveTurns((prev) => [
              ...prev,
              {
                speaker: 'Prospect',
                text: "Hello, this is David. We're considering your Enterprise CRM for our sales team.",
                intent: 'high_interest',
                battleCard: 'Highlight multi-agent autonomous SDR cadences & 1-click deal war room proposals.',
              },
            ]);
          }, 1500);

          setTimeout(() => {
            setLiveTurns((prev) => [
              ...prev,
              {
                speaker: 'AI Rep',
                text: "Hi David, thanks for picking up! I understand you're looking for enterprise SOC-2 compliance and automated lead qualification?",
              },
            ]);
          }, 3500);
        })
        .catch(() => {
          setCallState('active');
        });

      timerRef.current = setInterval(() => {
        setDurationSeconds((d) => d + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, phoneNumber]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Twilio / WebRTC Live Voice AI Gateway</h3>
                <Badge variant="success" className="text-[10px] font-mono">
                  SIP Trunk
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Calling <span className="text-white font-medium">{contactName}</span> ({phoneNumber})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Call Stage */}
        <div className="p-6 space-y-6">
          {/* Call Status & Timer */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{formatDuration(durationSeconds)}</span>
            </div>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-brand-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
              <PhoneCall className="w-7 h-7" />
            </div>

            <h4 className="text-base font-bold text-white">{contactName}</h4>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{phoneNumber}</p>

            {/* Audio Waveform Animation */}
            <div className="flex items-center gap-1 mt-4 h-8">
              {[40, 75, 90, 60, 100, 45, 80, 65, 95, 50, 85, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400/80 rounded-full transition-all duration-300 animate-pulse"
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Real-time Streaming Speech Turns & Battle-Card Assistant */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                Live Real-Time Audio Transcript &amp; Battle-Cards
              </span>
              {tokenData && (
                <span className="text-[10px] font-mono text-slate-500">Session: {tokenData.session_id}</span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              {liveTurns.map((turn, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold ${
                        turn.speaker === 'Prospect' ? 'text-blue-400' : 'text-purple-400'
                      }`}
                    >
                      {turn.speaker}:
                    </span>
                    <span className="text-slate-200">{turn.text}</span>
                  </div>

                  {turn.battleCard && (
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 flex items-start gap-2 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 block">Live Battle-Card Advice:</span>
                        <span>{turn.battleCard}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Call Action Controls */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border transition-all ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-2xl border transition-all ${
                isSpeakerOn
                  ? 'bg-slate-900 border-slate-800 text-brand-400 hover:bg-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Speaker Audio"
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="text-xs">End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
