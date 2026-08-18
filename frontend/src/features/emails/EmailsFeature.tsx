import { useState } from 'react';
import { Mail, Sparkles, Send, Filter, CheckCircle2, Brain, MessageSquare, Lightbulb, ArrowRight, UserCheck, Plus, AlertCircle, Clock } from 'lucide-react';
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
  anger: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', emoji: '😠' },
  frustration: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', emoji: '😤' },
  happiness: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', emoji: '😊' },
  excitement: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', emoji: '🎉' },
  neutral: { color: 'text-slate-400 bg-slate-500/10 border-slate-500/30', emoji: '😐' },
};

function EmotionBadge({ emotion }: { emotion: string | null | undefined }) {
  if (!emotion) return null;
  const key = emotion.toLowerCase();
  const cfg = EMOTION_CONFIG[key] ?? EMOTION_CONFIG.neutral;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span>{cfg.emoji}</span>
      {emotion}
    </span>
  );
}

function SentimentBar({ score }: { score: number | null | undefined }) {
  if (score == null) return null;
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'from-emerald-500 to-emerald-400' : score >= 4 ? 'from-amber-500 to-amber-400' : 'from-rose-500 to-rose-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-400">{score}/10</span>
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
    // Resolve reply recipient: reply to from_email (or to_email if outbound)
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
        toEmail: recipientEmail,
      });
      setSendSuccessMsg(res.message || `Email queued for delivery to ${recipientEmail}`);
      await refetch();
      setTimeout(() => {
        setSelectedEmail(null);
        setSendSuccessMsg(null);
      }, 1800);
    } catch (err: any) {
      setSendErrorMsg(err.response?.data?.detail || err.message || 'Failed to dispatch email response.');
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComposeError(null);

    if (!composeTo || !composeSubject || !composeBody) {
      setComposeError('Please fill in all required fields.');
      return;
    }

    try {
      await composeMutation.mutateAsync({
        to_email: composeTo,
        subject: composeSubject,
        body: composeBody,
      });
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      await refetch();
    } catch (err: any) {
      setComposeError(err.response?.data?.detail || err.message || 'Failed to compose and deliver outbound email.');
    }
  };

  const handleBulkAnalyzeEmails = async () => {
    if (!emails || emails.length === 0) return;
    setIsBulkAnalyzing(true);
    try {
      for (const email of emails.slice(0, 5)) {
        await triggerEmailMutation.mutateAsync({
          id: email.id,
          subject: email.subject,
          body: email.body || email.subject,
          sender: email.from_email || 'prospect@enterprise.com',
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
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.from_email && e.from_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.to_email && e.to_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-400" />
            {t('emails.title', 'Autonomous Email Intelligence & Delivery')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('emails.subtitle', 'Inbound triage, emotion detection, and centralized SMTP email delivery')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSyncModalOpen(true)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
          >
            <Mail className="w-4 h-4 text-purple-400" />
            <span>IMAP / OAuth Sync</span>
          </Button>
          <Button variant="outline" onClick={handleBulkAnalyzeEmails} isLoading={isBulkAnalyzing}>
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{t('emails.bulk_analyze', 'AI Bulk Triage')}</span>
          </Button>
          <Button variant="outline" onClick={() => setEmailModalOpen(true)}>
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{t('emails.analyze_btn', 'Analyze Email')}</span>
          </Button>
          <Button onClick={() => setIsComposeOpen(true)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white">
            <Plus className="w-4 h-4" />
            <span>Compose Email</span>
          </Button>
        </div>
      </div>

      {/* Priority Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority:</span>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                priorityFilter === p
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </Card>

      {/* Email Inbox Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : filteredEmails.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 text-sm">
            No emails match your search or filter criteria.
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card
              key={email.id}
              className="p-4 hover:border-slate-700/80 transition-all cursor-pointer group"
              onClick={() => handleOpenEmail(email)}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-white group-hover:text-brand-400 transition-colors">
                      {email.subject}
                    </h3>
                    <Badge statusValue={email.priority}>{email.priority} priority</Badge>
                    {email.response_sent && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EmotionBadge emotion={email.emotion} />
                    <Badge statusValue={email.sentiment}>{email.sentiment}</Badge>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenEmail(email); }}>
                      {email.response_sent ? 'View / Resend' : 'Review & Send'}
                    </Button>
                  </div>
                </div>

                {/* Sender & Recipient addresses */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {email.from_email && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">From:</span>
                      <strong className="text-slate-300 font-mono text-[11px]">{email.from_email}</strong>
                    </span>
                  )}
                  {email.to_email && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">To:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{email.to_email}</span>
                    </span>
                  )}
                  {email.sent_at && (
                    <span className="flex items-center gap-1 text-slate-500 ml-auto text-[11px]">
                      <Clock className="w-3 h-3" />
                      {new Date(email.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Sentiment score bar */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">Sentiment Score</span>
                  <div className="flex-1 max-w-[140px]">
                    <SentimentBar score={email.sentiment_score} />
                  </div>
                  <span className="text-[10px] text-slate-500 ml-auto">
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
          title={`Email Response — ${selectedEmail.subject}`}
          description="Review AI response draft and dispatch directly to recipient via centralized email delivery queue."
        >
          <div className="space-y-4">
            {sendErrorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{sendErrorMsg}</div>
              </div>
            )}

            {sendSuccessMsg && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>{sendSuccessMsg}</div>
              </div>
            )}

            {/* Recipient Input & Confirmation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                Recipient Address (Will Receive Email)
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
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Category: <span className="text-slate-300 font-medium">{selectedEmail.category}</span></span>
                <div className="flex items-center gap-2">
                  <EmotionBadge emotion={selectedEmail.emotion} />
                  <Badge statusValue={selectedEmail.sentiment}>{selectedEmail.sentiment} sentiment</Badge>
                </div>
              </div>
              {selectedEmail.sentiment_score != null && (
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-500">Sentiment Score:</span>
                  <div className="flex-1">
                    <SentimentBar score={selectedEmail.sentiment_score} />
                  </div>
                </div>
              )}
            </div>

            {/* AI Follow-up Suggestions */}
            {selectedEmail.follow_up_suggestions?.length ? (
              <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-2">
                <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  EmailIntelligenceAgent Suggestions
                </h4>
                <ul className="space-y-1.5">
                  {selectedEmail.follow_up_suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ArrowRight className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Editable draft */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Response Content (Editable Body)
              </label>
              <textarea
                rows={6}
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="w-full bg-slate-950/90 text-slate-100 border border-slate-700/80 rounded-xl p-3 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                Close
              </Button>
              <Button
                onClick={handleSendResponse}
                isLoading={sendResponseMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{selectedEmail.response_sent ? 'Resend to Recipient' : 'Send to Recipient'}</span>
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
          title="Compose Outbound Email"
          description="Dispatch a direct email to any customer or lead through the centralized SMTP delivery queue."
        >
          <form onSubmit={handleComposeSubmit} className="space-y-4">
            {composeError && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{composeError}</div>
              </div>
            )}

            <Input
              label="Recipient Email Address"
              type="email"
              placeholder="lead@company.com"
              required
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
            />

            <Input
              label="Subject Line"
              placeholder="Enterprise Partnership & Discovery Call"
              required
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Email Message Body <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your email message here..."
                className="w-full bg-slate-900 text-slate-100 border border-slate-700/80 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={composeMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Queue & Send Email</span>
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
