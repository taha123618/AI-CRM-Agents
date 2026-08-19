import { useState } from 'react';
import { Mail, Sparkles, Send, Filter, CheckCircle2, Brain, MessageSquare, Lightbulb, ArrowRight, UserCheck, Plus, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEmails, useSendEmailResponse, useComposeEmail } from '@/hooks/use-emails';
import { useTriggerEmailIntelligence } from '@/hooks/use-agents';
import { useUIStore } from '@/stores/use-ui-store';
import { useTranslation } from '@/features/multi-language';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmailMessage } from '@/types/crm.types';
import { EmailSyncAccountsModal } from './components/EmailSyncAccountsModal';

const EMOTION_CONFIG: Record<string, { color: string; emoji: string }> = {
  anger: { color: 'text-[#FF2A54] bg-[#0B0C10] border-[#FF2A54]', emoji: '😠' },
  frustration: { color: 'text-amber-400 bg-[#0B0C10] border-amber-400', emoji: '😤' },
  happiness: { color: 'text-[#FFB800] bg-[#0B0C10] border-[#FFB800]', emoji: '😊' },
  excitement: { color: 'text-yellow-400 bg-[#0B0C10] border-yellow-400', emoji: '🎉' },
  neutral: { color: 'text-slate-400 bg-[#0B0C10] border-slate-500', emoji: '😐' },
};

function EmotionBadge({ emotion }: { emotion: string | null | undefined }) {
  if (!emotion) return null;
  const key = emotion.toLowerCase();
  const cfg = EMOTION_CONFIG[key] ?? EMOTION_CONFIG.neutral;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-none text-[8px] font-bold uppercase font-mono border ${cfg.color}`}>
      <span>{cfg.emoji}</span>
      {emotion}
    </span>
  );
}

function SentimentBar({ score }: { score: number | null | undefined }) {
  if (score == null) return null;
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'bg-[#FFB800]' : score >= 4 ? 'bg-[#FFB800]' : 'bg-[#FF2A54]';
  return (
    <div className="flex items-center gap-2 font-mono">
      <div className="flex-1 h-1.5 bg-[#0B0C10] border border-[#3A4552] rounded-none overflow-hidden">
        <div className={`h-full ${color} rounded-none transition-none`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-bold text-slate-400 font-mono">{score}/10</span>
    </div>
  );
}

export function EmailsFeature() {
  const { t } = useTranslation();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { data: emails, isLoading, refetch } = useEmails(0, 100, priorityFilter === 'all' ? undefined : priorityFilter);
  const { setEmailModalOpen, searchQuery } = useUIStore();

  // Selected email for viewing & replying
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [editedResponse, setEditedResponse] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [sendErrorMsg, setSendErrorMsg] = useState<string | null>(null);
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);

  // Direct Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeError, setComposeError] = useState<string | null>(null);

  const sendResponseMutation = useSendEmailResponse();
  const composeMutation = useComposeEmail();
  const triggerEmailMutation = useTriggerEmailIntelligence();

  const handleOpenEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
    setSendSuccessMsg(null);
    setSendErrorMsg(null);
    const targetRecipient = email.from_email || email.to_email || 'prospect@enterprise.com';
    setRecipientEmail(targetRecipient);
    setEditedResponse(
      email.draft_response ||
      'Hi, Thank you for reaching out! Our team has received your inquiry and will follow up with complete documentation and next steps shortly.'
    );
  };

  const handleSendResponse = async () => {
    if (!selectedEmail) return;
    setSendErrorMsg(null);
    setSendSuccessMsg(null);

    if (!recipientEmail || !recipientEmail.includes('@')) {
      setSendErrorMsg('Please provide a valid recipient email address.');
      return;
    }

    try {
      const res = await sendResponseMutation.mutateAsync({
        id: selectedEmail.id,
        replyText: editedResponse,
        toEmail: recipientEmail.trim(),
      });
      setSendSuccessMsg(
        res.message ||
        `Email response successfully dispatched to ${recipientEmail} via SMTP background queue!`
      );
      await refetch();
    } catch (err: any) {
      setSendErrorMsg(
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to send email response. Check SMTP configuration.'
      );
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComposeError(null);

    if (!composeTo || !composeTo.includes('@')) {
      setComposeError('Please provide a valid recipient email address.');
      return;
    }
    if (!composeSubject.trim()) {
      setComposeError('Subject line is required.');
      return;
    }
    if (!composeBody.trim()) {
      setComposeError('Email body cannot be empty.');
      return;
    }

    try {
      await composeMutation.mutateAsync({
        to_email: composeTo.trim(),
        subject: composeSubject.trim(),
        body: composeBody.trim(),
      });
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      await refetch();
    } catch (err: any) {
      setComposeError(
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to queue outbound email transmission.'
      );
    }
  };

  const handleBulkAnalyze = async () => {
    setIsBulkAnalyzing(true);
    try {
      for (const email of emails || []) {
        await triggerEmailMutation.mutateAsync({
          sender: email.from_email || 'prospect@acme.org',
          subject: email.subject || 'Enterprise SLA Inquiry',
          body: email.body || 'We require dedicated SOC2 reports and Postgres migration tools.',
        });
      }
      await refetch();
    } finally {
      setIsBulkAnalyzing(false);
    }
  };

  const filteredEmails = (emails || []).filter(
    (e) =>
      !searchQuery ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.to_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121212] p-4 border border-[#3A4552]">
        <div>
          <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#FFB800]" />
            <span>{t('emails.title', 'AUTONOMOUS EMAIL INTELLIGENCE')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 uppercase">
            {t('emails.subtitle', 'AI SENTIMENT RADAR, AUTO-CLASSIFICATION, AND DRAFT SYNTHESIS')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsSyncModalOpen(true)} className="text-xs h-7">
            <RefreshCw className="w-3 h-3 text-cyan-400 mr-1" />
            <span>SYNC ACCOUNTS</span>
          </Button>

          <Button variant="outline" onClick={handleBulkAnalyze} isLoading={isBulkAnalyzing} className="text-xs h-7">
            <Sparkles className="w-3 h-3 text-[#FFB800]" />
            <span>AUDIT FLEET</span>
          </Button>

          <Button variant="outline" onClick={() => setEmailModalOpen(true)} className="text-xs h-7">
            <Brain className="w-3 h-3 text-[#FFB800]" />
            <span>AI ANALYZE</span>
          </Button>

          <Button onClick={() => setIsComposeOpen(true)} variant="primary" className="text-xs h-7">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>COMPOSE EMAIL</span>
          </Button>
        </div>
      </div>

      {/* Priority Filter Bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PRIORITY:</span>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-0.5 text-[9px] font-bold uppercase transition-none ${priorityFilter === p
                  ? 'bg-[#FFB800] text-[#0B0C10] border border-[#FFB800]'
                  : 'bg-[#0B0C10] text-slate-400 hover:text-white border border-[#3A4552]'
                }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </Card>

      {/* Email Inbox Cards List */}
      <div className="space-y-2.5">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : filteredEmails.length === 0 ? (
          <Card className="p-10 text-center text-slate-500 text-xs font-mono uppercase">
            NO EMAILS MATCH YOUR SEARCH CRITERIA.
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card
              key={email.id}
              className="p-3 hover:border-[#FFB800] transition-none cursor-pointer group font-mono"
              onClick={() => handleOpenEmail(email)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs text-white group-hover:text-[#FFB800] transition-none uppercase">
                      {email.subject}
                    </h3>
                    <Badge statusValue={email.priority}>{email.priority} PRIORITY</Badge>
                    {email.response_sent && (
                      <span className="inline-flex items-center gap-1 text-[8px] text-[#FFB800] font-bold bg-[#0B0C10] px-1.5 py-0.2 border border-[#FFB800]/50 uppercase">
                        <CheckCircle2 className="w-2.5 h-2.5" /> DELIVERED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <EmotionBadge emotion={email.emotion} />
                    <Badge statusValue={email.sentiment}>{email.sentiment}</Badge>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenEmail(email); }} className="text-[10px] h-6 px-2">
                      {email.response_sent ? 'VIEW' : 'REVIEW & SEND'}
                    </Button>
                  </div>
                </div>

                {/* Sender & Recipient addresses */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                  {email.from_email && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">FROM:</span>
                      <strong className="text-slate-300 font-mono text-[10px] uppercase">{email.from_email}</strong>
                    </span>
                  )}
                  {email.to_email && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">TO:</span>
                      <span className="text-slate-300 font-mono text-[10px] uppercase">{email.to_email}</span>
                    </span>
                  )}
                  {email.sent_at && (
                    <span className="flex items-center gap-1 text-slate-500 ml-auto text-[9px] font-mono uppercase">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Sentiment score bar */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#3A4552]/60">
                  <span className="text-[8px] text-slate-500 uppercase font-bold shrink-0">SENTIMENT</span>
                  <div className="flex-1 max-w-[120px]">
                    <SentimentBar score={email.sentiment_score} />
                  </div>
                  <span className="text-[8px] text-slate-500 ml-auto uppercase font-mono">
                    {email.category}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Review, Edit & Send Response Modal */}
      {selectedEmail && (
        <Modal
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          title={`EMAIL RESPONSE — ${selectedEmail.subject.toUpperCase()}`}
          description="REVIEW AI RESPONSE DRAFT AND DISPATCH DIRECTLY TO RECIPIENT VIA SMTP QUEUE."
          className="font-mono"
        >
          <div className="space-y-3 font-mono">
            {sendErrorMsg && (
              <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
                <div className="uppercase">{sendErrorMsg}</div>
              </div>
            )}

            {sendSuccessMsg && (
              <div className="p-2.5 bg-[#0B0C10] border border-[#FFB800] text-[#FFB800] text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <div className="uppercase">{sendSuccessMsg}</div>
              </div>
            )}

            {/* Recipient Input & Confirmation */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#FFB800]" />
                RECIPIENT ADDRESS
              </label>
              <Input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@enterprise.com"
                className="font-mono text-xs"
              />
            </div>

            {/* Email Intelligence metadata row */}
            <div className="p-2.5 bg-[#0B0C10] border border-[#3A4552] space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 uppercase text-[10px]">CATEGORY: <span className="text-slate-200 font-bold">{selectedEmail.category}</span></span>
                <div className="flex items-center gap-1.5">
                  <EmotionBadge emotion={selectedEmail.emotion} />
                  <Badge statusValue={selectedEmail.sentiment}>{selectedEmail.sentiment}</Badge>
                </div>
              </div>
              {selectedEmail.sentiment_score != null && (
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-[#FFB800] shrink-0" />
                  <span className="text-[10px] text-slate-500 uppercase">SENTIMENT SCORE:</span>
                  <div className="flex-1">
                    <SentimentBar score={selectedEmail.sentiment_score} />
                  </div>
                </div>
              )}
            </div>

            {/* AI Follow-up Suggestions */}
            {selectedEmail.follow_up_suggestions?.length ? (
              <div className="p-2.5 bg-[#0B0C10] border border-[#FFB800]/40 space-y-1 font-mono">
                <h4 className="text-[10px] font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  FOLLOW-UP SUGGESTIONS
                </h4>
                <ul className="space-y-1">
                  {selectedEmail.follow_up_suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300 font-mono uppercase">
                      <ArrowRight className="w-3 h-3 text-[#FFB800] mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Editable draft */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-[#FFB800]" />
                RESPONSE CONTENT (EDITABLE BODY)
              </label>
              <textarea
                rows={6}
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="w-full bg-[#0B0C10] text-slate-100 border border-[#3A4552] rounded-none p-2.5 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#FFB800]"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#3A4552]">
              <Button variant="outline" onClick={() => setSelectedEmail(null)} className="text-xs">
                CLOSE
              </Button>
              <Button
                onClick={handleSendResponse}
                isLoading={sendResponseMutation.isPending}
                variant="primary"
                className="text-xs h-7"
              >
                <Send className="w-3 h-3 mr-1" />
                <span>{selectedEmail.response_sent ? 'RESEND' : 'SEND EMAIL'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Compose New Outbound Email Modal */}
      {isComposeOpen && (
        <Modal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          title="COMPOSE OUTBOUND EMAIL"
          description="DISPATCH A DIRECT EMAIL THROUGH THE CENTRALIZED SMTP DELIVERY QUEUE."
          className="font-mono"
        >
          <form onSubmit={handleComposeSubmit} className="space-y-3 font-mono">
            {composeError && (
              <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF2A54] shrink-0 mt-0.5" />
                <div className="uppercase">{composeError}</div>
              </div>
            )}

            <Input
              label="RECIPIENT EMAIL ADDRESS"
              type="email"
              placeholder="lead@company.com"
              required
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
            />

            <Input
              label="SUBJECT LINE"
              placeholder="ENTERPRISE PARTNERSHIP & DISCOVERY"
              required
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
                EMAIL MESSAGE BODY <span className="text-[#FF2A54] ml-0.5">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="WRITE YOUR MESSAGE HERE..."
                className="w-full bg-[#0B0C10] text-slate-100 border border-[#3A4552] rounded-none p-2.5 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#FFB800]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3A4552]">
              <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)} className="text-xs">
                CANCEL
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={composeMutation.isPending}
                className="text-xs h-7"
              >
                <Send className="w-3 h-3 mr-1" />
                <span>DISPATCH EMAIL</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Email IMAP & OAuth Sync Studio Modal */}
      <EmailSyncAccountsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
