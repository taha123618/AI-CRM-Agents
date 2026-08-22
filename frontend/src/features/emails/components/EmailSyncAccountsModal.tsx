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
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-5xl bg-card border border-border rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-background border border-primary/50 text-primary">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">EMAIL IMAP &amp; OAUTH SYNC STUDIO</h3>
                <Badge variant="purple" className="text-[8px] font-mono">
                  GMAIL &amp; OUTLOOK 365
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase">
                2-WAY MAILBOX SYNC, CONVERSATION AGGREGATION, AND STREAMING.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsConnectOpen(true)}
              className="text-xs h-7"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>CONNECT MAILBOX</span>
            </Button>

            <button onClick={onClose} className="p-1 rounded-none text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 font-mono">
          {/* Connected Mailboxes Bar */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              CONNECTED MAILBOXES ({accounts?.length || 0})
            </span>

            {isLoadingAccounts ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {accounts?.map((acc: any) => (
                  <div
                    key={acc.id}
                    className="p-3 bg-background border border-border flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-none bg-primary"></span>
                        <h4 className="text-xs font-bold text-foreground uppercase">{acc.provider}</h4>
                      </div>
                      <p className="text-[10px] font-mono text-foreground mt-0.5">{acc.email_address}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => syncAccountMutation.mutate(acc.id)}
                      disabled={syncAccountMutation.isPending}
                      className="h-6 px-2 text-xs text-primary hover:bg-card"
                      title="Sync Now"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncAccountMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Threads & Messages Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-border">
            {/* Threads List */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                CONVERSATION THREADS ({threads?.length || 0})
              </span>

              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {threads?.map((th: any) => (
                  <div
                    key={th.id}
                    onClick={() => setSelectedThreadId(th.id)}
                    className={`p-2.5 border cursor-pointer transition-none ${selectedThreadId === th.id
                        ? 'bg-background border-primary text-foreground'
                        : 'bg-background border-border hover:border-border text-foreground'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <Badge variant="purple" className="text-[8px] py-0">
                        {th.message_count} MSGS
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {th.last_message_at ? new Date(th.last_message_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-foreground truncate uppercase">{th.subject}</h5>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5 uppercase">{th.snippet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thread Messages Timeline */}
            <div className="lg:col-span-7 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                MESSAGE HISTORY
              </span>

              {isLoadingThreadMsgs ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : threadMessages ? (
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto p-3 bg-background border border-border">
                  <h4 className="text-xs font-bold text-foreground border-b border-border pb-1.5 uppercase">
                    {threadMessages.subject}
                  </h4>

                  <div className="space-y-2">
                    {threadMessages.messages?.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2.5 border text-xs space-y-1 ${msg.direction === 'inbound'
                            ? 'bg-card border-border text-foreground'
                            : 'bg-background border-primary/40 text-primary'
                          }`}
                      >
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                          <span className="font-bold text-foreground uppercase">{msg.sender}</span>
                          <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                        </div>
                        <p className="text-xs leading-relaxed font-mono whitespace-pre-wrap">{msg.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-muted-foreground text-xs bg-background border border-border font-mono uppercase">
                  SELECT A CONVERSATION THREAD TO INSPECT HISTORY.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connect Modal */}
        {isConnectOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 font-mono">
            <div className="w-full max-w-md bg-card border border-border rounded-none p-5 shadow-2xl space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">CONNECT EMAIL MAILBOX</h4>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-foreground font-bold uppercase mb-1">PROVIDER TYPE</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-none bg-background border border-border text-foreground text-xs font-mono"
                  >
                    <option value="gmail">GOOGLE WORKSPACE / GMAIL OAUTH</option>
                    <option value="outlook_365">MICROSOFT GRAPH / OUTLOOK 365</option>
                    <option value="imap">STANDARD IMAP / SMTP MAILBOX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-foreground font-bold uppercase mb-1">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    placeholder="rep@enterprise.ai"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-none bg-background border border-border text-foreground text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-foreground font-bold uppercase mb-1">DISPLAY LABEL</label>
                  <input
                    type="text"
                    placeholder="E.G. SALES INBOUND"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-none bg-background border border-border text-foreground text-xs font-mono uppercase"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => setIsConnectOpen(false)} className="text-xs">
                    CANCEL
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => connectMutation.mutate()}
                    disabled={connectMutation.isPending || !emailAddress.trim()}
                    className="text-xs"
                  >
                    {connectMutation.isPending ? 'CONNECTING...' : 'AUTHORIZE'}
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
