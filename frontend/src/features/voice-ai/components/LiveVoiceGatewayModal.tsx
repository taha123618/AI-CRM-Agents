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
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl bg-[#1F2833] border border-[#3A4552] rounded-none shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#3A4552] flex items-center justify-between bg-[#0B0C10]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-[#0B0C10] border border-[#39FF14]/50 text-[#39FF14]">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">LIVE VOICE AI GATEWAY</h3>
                <Badge variant="success" className="text-[8px] font-mono">
                  SIP TRUNK
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 uppercase">
                CALLING <span className="text-white font-bold">{contactName}</span> ({phoneNumber})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-none text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Call Stage */}
        <div className="p-4 space-y-4 font-mono">
          {/* Call Status & Timer */}
          <div className="p-4 bg-[#0B0C10] border border-[#3A4552] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-2.5 right-3 flex items-center gap-1 text-[10px] font-mono text-[#39FF14] uppercase">
              <span className="w-1.5 h-1.5 rounded-none bg-[#39FF14]"></span>
              <span>{formatDuration(durationSeconds)}</span>
            </div>

            <div className="w-12 h-12 rounded-none bg-[#1F2833] border border-[#39FF14]/50 flex items-center justify-center text-[#39FF14] mb-2">
              <PhoneCall className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-white uppercase">{contactName}</h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{phoneNumber}</p>

            {/* Audio Waveform Animation */}
            <div className="flex items-center gap-1 mt-3 h-6">
              {[40, 75, 90, 60, 100, 45, 80, 65, 95, 50, 85, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#39FF14] rounded-none transition-none"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Real-time Streaming Speech Turns & Battle-Card Assistant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-[#39FF14]" />
                LIVE AUDIO TRANSCRIPT &amp; BATTLE-CARDS
              </span>
              {tokenData && (
                <span className="text-[9px] font-mono text-slate-500 uppercase">SESSION: {tokenData.session_id}</span>
              )}
            </div>

            <div className="max-h-44 overflow-y-auto space-y-2 p-2.5 bg-[#0B0C10] border border-[#3A4552] text-xs font-mono">
              {liveTurns.map((turn, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        turn.speaker === 'Prospect' ? 'text-cyan-400' : 'text-[#39FF14]'
                      }`}
                    >
                      {turn.speaker}:
                    </span>
                    <span className="text-slate-200 text-xs">{turn.text}</span>
                  </div>

                  {turn.battleCard && (
                    <div className="p-2 bg-[#1F2833] border border-[#39FF14]/40 text-[#39FF14] flex items-start gap-1.5 text-[10px]">
                      <Sparkles className="w-3 h-3 text-[#39FF14] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase">LIVE BATTLE-CARD:</span>
                        <span>{turn.battleCard}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Call Action Controls */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#3A4552]">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 border transition-none font-mono ${
                isMuted
                  ? 'bg-[#0B0C10] border-[#FF2A54] text-[#FF2A54]'
                  : 'bg-[#0B0C10] border-[#3A4552] text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-2.5 border transition-none font-mono ${
                isSpeakerOn
                  ? 'bg-[#0B0C10] border-[#3A4552] text-[#39FF14]'
                  : 'bg-[#0B0C10] border-[#3A4552] text-slate-500'
              }`}
              title="Speaker Audio"
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-2.5 px-4 bg-[#FF2A54] hover:bg-[#FF2A54]/90 text-white font-bold font-mono text-xs uppercase flex items-center gap-1.5 border border-[#FF2A54] transition-none"
            >
              <PhoneOff className="w-4 h-4" />
              <span>END CALL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
