import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EmailSyncAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailSyncAccountsModal({ isOpen, onClose }: EmailSyncAccountsModalProps) {
  const queryClient = useQueryClient();
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [provider, setProvider] = useState('gmail');
  const [emailAddress, setEmailAddress] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Queries
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['email-sync-accounts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/email-sync/accounts');
      return data;
    },
    enabled: isOpen,
  });

  const { data: threads } = useQuery({
    queryKey: ['email-sync-threads'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/email-sync/threads');
      return data;
    },
    enabled: isOpen,
  });

  const { data: threadMessages, isLoading: isLoadingThreadMsgs } = useQuery({
    queryKey: ['email-thread-messages', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return null;
      const { data } = await apiClient.get(`/api/email-sync/threads/${selectedThreadId}/messages`);
      return data;
    },
    enabled: Boolean(selectedThreadId),
  });

  // Mutations
  const connectMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/email-sync/accounts', {
        provider,
        email_address: emailAddress.trim(),
        display_name: displayName.trim() || undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sync-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['email-sync-threads'] });
      setIsConnectOpen(false);
      setEmailAddress('');
      setDisplayName('');
    },
  });

  const syncAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { data } = await apiClient.post(`/api/email-sync/accounts/${accountId}/sync`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sync-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['email-sync-threads'] });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Bi-Directional Email IMAP &amp; OAuth Sync Studio</h3>
                <Badge variant="purple" className="text-[10px] font-mono">
                  Gmail &amp; Outlook 365
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                2-way mailbox sync, automatic conversation thread aggregation, and inbound streaming.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="orange"
              onClick={() => setIsConnectOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Connect Mailbox</span>
            </Button>

            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Connected Mailboxes Bar */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Connected Mailboxes ({accounts?.length || 0})
            </span>

            {isLoadingAccounts ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts?.map((acc: any) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xs font-bold text-white capitalize">{acc.provider}</h4>
                      </div>
                      <p className="text-[11px] font-mono text-slate-300 mt-0.5">{acc.email_address}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => syncAccountMutation.mutate(acc.id)}
                      disabled={syncAccountMutation.isPending}
                      className="h-7 px-2 text-xs text-blue-400 hover:bg-blue-950/40"
                      title="Sync Now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncAccountMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Threads & Messages Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-slate-800/80">
            {/* Threads List */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Synchronized Conversation Threads ({threads?.length || 0})
              </span>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {threads?.map((th: any) => (
                  <div
                    key={th.id}
                    onClick={() => setSelectedThreadId(th.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedThreadId === th.id
                        ? 'bg-blue-950/40 border-blue-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <Badge variant="purple" className="text-[9px] py-0">
                        {th.message_count} msgs
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {th.last_message_at ? new Date(th.last_message_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white truncate">{th.subject}</h5>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{th.snippet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thread Messages Timeline */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Thread Message History
              </span>

              {isLoadingThreadMsgs ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : threadMessages ? (
                <div className="space-y-3 max-h-[340px] overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">
                    {threadMessages.subject}
                  </h4>

                  <div className="space-y-3">
                    {threadMessages.messages?.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          msg.direction === 'inbound'
                            ? 'bg-slate-900 border-slate-800 text-slate-200'
                            : 'bg-blue-950/40 border-blue-500/30 text-blue-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="font-bold text-white">{msg.sender}</span>
                          <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                        </div>
                        <p className="text-xs leading-relaxed font-sans">{msg.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-slate-950/40 border border-slate-800/60">
                  Select a conversation thread on the left to view message history.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connect Modal */}
        {isConnectOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-white">Connect Email Mailbox</h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provider Type</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="gmail">Google Workspace / Gmail OAuth</option>
                    <option value="outlook_365">Microsoft Graph / Outlook 365</option>
                    <option value="imap">Standard IMAP / SMTP Mailbox</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rep@enterprise.ai"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Inbound Mailbox"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsConnectOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="orange"
                    onClick={() => connectMutation.mutate()}
                    disabled={connectMutation.isPending || !emailAddress.trim()}
                  >
                    {connectMutation.isPending ? 'Connecting...' : 'Authorize & Connect'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
