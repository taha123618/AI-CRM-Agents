import { useState } from 'react';
import { Mail, Sparkles, Send, Filter, CheckCircle2, Brain, MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEmails, useSendEmailResponse } from '@/hooks/use-emails';
import { useTriggerEmailIntelligence } from '@/hooks/use-agents';
import { useUIStore } from '@/stores/use-ui-store';
import { useTranslation } from '@/features/multi-language';
import { Modal } from '@/components/ui/Modal';
import { EmailMessage } from '@/types/crm.types';

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
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [editedResponse, setEditedResponse] = useState<string>('');
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);

  const sendResponseMutation = useSendEmailResponse();
  const triggerEmailMutation = useTriggerEmailIntelligence();

  const handleOpenEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
    setEditedResponse(
      email.draft_response ||
        'Hi, Thank you for reaching out! Our team has received your message and will share the requested security documentation and SLA options shortly.'
    );
  };

  const handleSendResponse = async () => {
    if (!selectedEmail) return;
    try {
      await sendResponseMutation.mutateAsync({
        id: selectedEmail.id,
        replyText: editedResponse,
      });
      setSelectedEmail(null);
      await refetch();
    } catch {
      // Error handled by mutation
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
          body: email.subject,
          sender: 'prospect@enterprise.com',
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
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-400" />
            {t('emails.title', 'Autonomous Email Intelligence & Sentiment')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('emails.subtitle', 'Inbound triage, emotion detection, and automated AI response drafting')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkAnalyzeEmails} isLoading={isBulkAnalyzing}>
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{t('emails.analyze_btn', 'Analyze Inbound Email')}</span>
          </Button>
          <Button onClick={() => setEmailModalOpen(true)}>
            <Sparkles className="w-4 h-4" />
            <span>{t('emails.analyze_btn', 'Analyze Email')}</span>
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
            No emails match your priority filter.
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card
              key={email.id}
              className="p-4 hover:border-slate-700/80 transition-all cursor-pointer group"
              onClick={() => handleOpenEmail(email)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-white group-hover:text-brand-400 transition-colors">
                      {email.subject}
                    </h3>
                    <Badge statusValue={email.priority}>{email.priority} priority</Badge>
                    {email.response_sent && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Sent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EmotionBadge emotion={email.emotion} />
                    <Badge statusValue={email.sentiment}>{email.sentiment}</Badge>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenEmail(email); }}>
                      {email.response_sent ? 'View Reply' : 'View Draft'}
                    </Button>
                  </div>
                </div>

                {/* Sentiment score bar */}
                <div className="flex items-center gap-3">
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

      {/* Draft Response Modal */}
      {selectedEmail && (
        <Modal
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          title={`AI Response — ${selectedEmail.subject}`}
          description="Edit and confirm the AI draft reply before sending to customer"
        >
          <div className="space-y-4">
            {/* Email Intelligence metadata row */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Category: <span className="text-slate-300 font-medium">{selectedEmail.category}</span></span>
                <div className="flex items-center gap-2">
                  <EmotionBadge emotion={selectedEmail.emotion} />
                  <Badge statusValue={selectedEmail.sentiment}>{selectedEmail.sentiment} sentiment</Badge>
                  {selectedEmail.response_sent && (
                    <span className="text-emerald-400 font-medium text-xs">✓ Sent</span>
                  )}
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
                  EmailIntelligenceAgent Follow-up Suggestions
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
                AI Draft Response (Editable)
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
                className={selectedEmail.response_sent ? 'bg-emerald-600 hover:bg-emerald-500' : ''}
              >
                <Send className="w-4 h-4" />
                <span>{selectedEmail.response_sent ? 'Resend Response' : 'Send Response'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
