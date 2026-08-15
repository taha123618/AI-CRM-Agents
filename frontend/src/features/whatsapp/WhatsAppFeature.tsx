import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { whatsappApi } from './api/whatsappApi';
import { WhatsAppConversation } from './types/whatsapp.types';
import { NewConversationModal } from './components/NewConversationModal';
import { BroadcastModal } from './components/BroadcastModal';
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
} from 'lucide-react';

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  color = 'text-white',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <Card className="p-4 bg-slate-900/60 border-slate-800/80 flex items-start gap-3">
      <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400">{icon}</div>
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </span>
        <div className={`text-xl font-black font-mono mt-0.5 ${color}`}>{value}</div>
        {sub && <span className="text-[10px] text-slate-500 mt-0.5 block">{sub}</span>}
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
    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold"
          >
            {t}
            <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              setTags([...tags, input.trim()]);
              setInput('');
            }
          }}
          placeholder="Add tag..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="text-[10px] bg-emerald-600 hover:bg-emerald-500 px-2"
          isLoading={tagMutation.isPending}
          onClick={() => tagMutation.mutate()}
        >
          Save
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-500 hover:text-slate-300"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Feature ─────────────────────────────────────────────────────────────
export function WhatsAppFeature() {
  const queryClient = useQueryClient();

  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [simulateInbound, setSimulateInbound] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [editingTagsForConv, setEditingTagsForConv] = useState<string | null>(null);

  // Queries
  const {
    data: conversations,
    isLoading: isLoadingConvs,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: () => whatsappApi.getConversations(),
    refetchInterval: 10000,
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

  const displayedConvs = searchQuery.length >= 2
    ? (searchResults ?? [])
    : (conversations ?? []);

  const activeConv = selectedConv || (displayedConvs.length > 0 ? displayedConvs[0] : null);

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMutation.mutate(inputText.trim());
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>WhatsApp Business Multi-Agent Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Omnichannel conversational CRM for automated 24/7 lead qualification, demo bookings, and client sync.
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBroadcastModal(true)}
            className="border-slate-800 bg-slate-900/50 text-slate-300"
          >
            <Megaphone className="w-3.5 h-3.5 mr-1.5" />
            <span>Broadcast</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Conversations"
          value={stats?.active_conversations ?? 0}
          sub={`${stats?.total_conversations ?? 0} total`}
          icon={<MessageCircle className="w-4 h-4" />}
          color="text-emerald-400"
        />
        <StatCard
          label="Bot Auto-Reply Rate"
          value={`${stats?.bot_auto_reply_rate ?? 0}%`}
          sub={`${stats?.auto_pilot_enabled ?? 0} convs on auto-pilot`}
          icon={<Zap className="w-4 h-4" />}
          color="text-purple-400"
        />
        <StatCard
          label="Avg Response Time"
          value={`${stats?.avg_response_time_seconds ?? 0}s`}
          sub="AI-powered instant response"
          icon={<Clock className="w-4 h-4" />}
          color="text-amber-400"
        />
        <StatCard
          label="Unread Messages"
          value={stats?.unread_total ?? 0}
          sub={`${stats?.handed_off_conversations ?? 0} handed off to team`}
          icon={<Activity className="w-4 h-4" />}
          color="text-red-400"
        />
      </div>

      {/* ── Main Chat Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 h-[700px]">
        {/* ── Conversation List ── */}
        <div className="border-r border-slate-800 bg-slate-900/40 flex flex-col">
          {/* List Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Conversations ({displayedConvs.length})
              </span>
              <Badge variant="success" className="gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </Badge>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {isLoadingConvs ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading conversations...</div>
            ) : !displayedConvs.length ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                {searchQuery ? 'No conversations found.' : 'No conversations yet.'}
              </div>
            ) : (
              displayedConvs.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-3 cursor-pointer transition-all space-y-1 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{conv.contact_name}</span>
                      <div className="flex items-center gap-1">
                        {conv.unread_count > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {conv.last_message_at
                            ? new Date(conv.last_message_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{conv.phone_number}</span>
                      <div className="flex items-center gap-1.5">
                        {conv.status === 'archived' && (
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Archived</span>
                        )}
                        {conv.ai_auto_pilot && (
                          <span className="flex items-center gap-0.5 text-emerald-400 text-[10px]">
                            <Bot className="w-2.5 h-2.5" /> Auto
                          </span>
                        )}
                      </div>
                    </div>
                    {conv.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {conv.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-mono"
                          >
                            {t}
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
        <div className="lg:col-span-2 flex flex-col bg-slate-950">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{activeConv.contact_name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{activeConv.phone_number}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Tags button */}
                    <button
                      type="button"
                      title="Edit tags"
                      onClick={() =>
                        setEditingTagsForConv(
                          editingTagsForConv === activeConv.id ? null : activeConv.id
                        )
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive button */}
                    <button
                      type="button"
                      title="Archive conversation"
                      onClick={() => archiveMutation.mutate(activeConv.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {/* Auto-pilot toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        autoPilotMutation.mutate({
                          id: activeConv.id,
                          autoPilot: !activeConv.ai_auto_pilot,
                        })
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        activeConv.ai_auto_pilot
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Bot className="w-3 h-3" />
                      AI {activeConv.ai_auto_pilot ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Tags Editor */}
                {editingTagsForConv === activeConv.id && (
                  <div className="mt-2">
                    <TagsEditor
                      conv={activeConv}
                      onClose={() => setEditingTagsForConv(null)}
                    />
                  </div>
                )}
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMsgs ? (
                  <div className="py-20 text-center text-slate-500 text-xs">
                    Loading message stream...
                  </div>
                ) : !messages?.length ? (
                  <div className="py-20 text-center text-slate-500 text-xs">
                    No messages yet. Send the first message!
                  </div>
                ) : (
                  messages.map((msg) => {
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
                              <span>AI Auto-Pilot</span>
                            </div>
                          )}
                          {msg.intent && (
                            <div className="text-[9px] text-slate-400 font-mono mb-0.5">
                              Intent: {msg.intent}
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
                            {isFromMe && (
                              <CheckCheck
                                className={`w-3 h-3 ${
                                  msg.status === 'read' ? 'text-emerald-400' : ''
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Templates */}
              <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">
                  Templates:
                </span>
                {[
                  'Send Enterprise Pricing & Tier Matrix',
                  'Propose Live 15-min Demo Slot',
                  'Confirm Scheduled Zoom Briefing',
                  'Request NDA Signature',
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setInputText(tmpl)}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:border-emerald-500/40 hover:text-white whitespace-nowrap transition-all"
                  >
                    + {tmpl}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setSimulateInbound(!simulateInbound)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-colors shrink-0 ${
                    simulateInbound
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {simulateInbound ? '↩ Client' : '↪ Rep'}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    simulateInbound
                      ? 'Simulate prospect inquiry (triggers AI Auto-Pilot)...'
                      : 'Type a WhatsApp message...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={sendMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-xs">Select a conversation or start a new one.</p>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500"
                onClick={() => setShowNewModal(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewModal && <NewConversationModal onClose={() => setShowNewModal(false)} />}
      {showBroadcastModal && <BroadcastModal onClose={() => setShowBroadcastModal(false)} />}
    </div>
  );
}
