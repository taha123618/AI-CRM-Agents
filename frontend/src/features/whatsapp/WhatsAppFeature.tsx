import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { whatsappApi } from './api/whatsappApi';
import { WhatsAppConversation } from './types/whatsapp.types';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';

export function WhatsAppFeature() {
  const queryClient = useQueryClient();
  const { data: conversations, isLoading: isLoadingConvs, refetch, isRefetching } = useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: () => whatsappApi.getConversations(),
  });

  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [simulateInbound, setSimulateInbound] = useState(false);

  const activeConv = selectedConv || (conversations && conversations.length > 0 ? conversations[0] : null);

  const { data: messages, isLoading: isLoadingMsgs } = useQuery({
    queryKey: ['whatsapp-messages', activeConv?.id],
    queryFn: () => (activeConv ? whatsappApi.getMessages(activeConv.id) : []),
    enabled: Boolean(activeConv?.id),
    refetchInterval: 4000,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!activeConv) return;
      if (simulateInbound) {
        return whatsappApi.sendInboundWebhook({
          contact_name: activeConv.contact_name,
          phone_number: activeConv.phone_number,
          text,
        });
      } else {
        return whatsappApi.sendMessage({
          contact_name: activeConv.contact_name,
          phone_number: activeConv.phone_number,
          text,
          sender_type: 'agent',
        });
      }
    },
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', activeConv?.id] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });

  const autoPilotMutation = useMutation({
    mutationFn: ({ id, autoPilot }: { id: string; autoPilot: boolean }) =>
      whatsappApi.toggleAutoPilot(id, autoPilot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMutation.mutate(inputText.trim());
  };

  const handleQuickTemplate = (templateText: string) => {
    setInputText(templateText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>WhatsApp Business Multi-Agent Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Omnichannel conversational CRM assistant for automated 24/7 lead qualification, demo bookings, and client sync.
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

          <Badge variant="success" className="gap-1.5 py-1.5 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Meta WhatsApp Cloud API Connected
          </Badge>
        </div>
      </div>

      {/* Main WhatsApp Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 h-[680px]">
        {/* Left Column: Conversations List */}
        <div className="border-r border-slate-800 bg-slate-900/40 flex flex-col justify-between">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Conversations ({conversations?.length || 0})
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {isLoadingConvs ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading conversations...</div>
            ) : (
              (conversations || []).map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-3.5 cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 text-white'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{conv.contact_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{conv.phone_number}</span>
                      {conv.ai_auto_pilot && (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                          <Bot className="w-3 h-3" /> Auto-Pilot
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Chat Stream & Interactive Sender */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-slate-950">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{activeConv.contact_name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{activeConv.phone_number}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      autoPilotMutation.mutate({
                        id: activeConv.id,
                        autoPilot: !activeConv.ai_auto_pilot,
                      })
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      activeConv.ai_auto_pilot
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title="Toggle autonomous bot auto-replies"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Auto-Pilot: {activeConv.ai_auto_pilot ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMsgs ? (
                  <div className="py-20 text-center text-slate-500 text-xs">Loading message stream...</div>
                ) : (
                  (messages || []).map((msg) => {
                    const isFromMe = msg.sender_type === 'agent' || msg.sender_type === 'bot';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            msg.sender_type === 'bot'
                              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-tr-none'
                              : isFromMe
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.sender_type === 'bot' && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mb-0.5">
                              <Bot className="w-3 h-3" />
                              <span>Autonomous WhatsApp Agent</span>
                            </div>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] font-mono ${
                              isFromMe ? 'text-emerald-300/80' : 'text-slate-500'
                            }`}
                          >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isFromMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Template Chips */}
              <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Templates:</span>
                {[
                  'Send Enterprise Pricing & Tier Matrix',
                  'Propose Live 15-min Demo Slot',
                  'Confirm Scheduled Zoom Briefing',
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => handleQuickTemplate(tmpl)}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:border-emerald-500/40 hover:text-white whitespace-nowrap transition-all"
                  >
                    + {tmpl}
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setSimulateInbound(!simulateInbound)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${
                    simulateInbound
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title="Toggle whether sending simulates inbound client message or outbound rep message"
                >
                  {simulateInbound ? 'Mode: Client Inbound' : 'Mode: Rep Outbound'}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    simulateInbound
                      ? 'Simulate prospect inquiry (will trigger AI Auto-Pilot)...'
                      : 'Type a WhatsApp message to prospect...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={sendMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <MessageSquare className="w-12 h-12 opacity-30" />
              <p className="text-xs">Select or initiate a WhatsApp conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
