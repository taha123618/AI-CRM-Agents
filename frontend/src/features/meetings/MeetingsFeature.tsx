import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  UserCheck,
  MapPin,
  FileText,
  Trash2,
  Pencil,
  CheckSquare,
  ChevronRight,
  Bot,
  Users,
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useMeetings, useUpdateMeeting, useDeleteMeeting, useSendMeetingInvite } from '@/hooks/use-meetings';
import { useTriggerMeetingScheduler } from '@/hooks/use-agents';
import { useUIStore } from '@/stores/use-ui-store';
import { useTranslation, useLocaleFormat } from '@/features/multi-language';
import { Meeting } from '@/types/crm.types';

const TYPE_OPTIONS = [
  { value: 'Executive Demo', label: 'Executive Demo' },
  { value: 'Discovery Call', label: 'Discovery Call' },
  { value: 'Technical Review', label: 'Technical Review' },
  { value: 'Renewal Discussion', label: 'Renewal Discussion' },
];

export function MeetingsFeature() {
  const { t } = useTranslation();
  const { formatDate } = useLocaleFormat();
  const { data: meetings, isLoading, refetch } = useMeetings();
  const updateMeetingMutation = useUpdateMeeting();
  const deleteMeetingMutation = useDeleteMeeting();
  const triggerMeetingMutation = useTriggerMeetingScheduler();
  const sendMeetingInviteMutation = useSendMeetingInvite();
  const { setMeetingModalOpen, searchQuery } = useUIStore();

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isBulkScheduling, setIsBulkScheduling] = useState(false);

  // Email Invite State
  const [inviteEmailInput, setInviteEmailInput] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Technical Review');
  const [editDuration, setEditDuration] = useState(30);
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setInviteSuccessMsg(null);
    setInviteErrorMsg(null);

    let defaultAttendee = 'executive@customer-domain.com';
    if (meeting.attendees) {
      if (Array.isArray(meeting.attendees) && meeting.attendees.length > 0) {
        const first = meeting.attendees[0];
        defaultAttendee = typeof first === 'string' ? first : first?.email || defaultAttendee;
      } else if (typeof meeting.attendees === 'string') {
        defaultAttendee = meeting.attendees;
      }
    }
    setInviteEmailInput(defaultAttendee);
  };

  const handleOpenEdit = (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    setEditingMeeting(meeting);
    setEditTitle(meeting.title || 'Product Architecture Review & Security Q&A');
    setEditType(meeting.meeting_type || 'Technical Review');
    setEditDuration(meeting.duration_minutes || 30);
    setEditLocation(meeting.location || 'Google Meet (auto-generated)');

    const notesContent =
      meeting.notes ||
      (typeof meeting.prep_materials === 'object' && meeting.prep_materials?.prep_notes) ||
      'Focus on SOC2 compliance and PostgreSQL connection security';

    setEditNotes(notesContent);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    try {
      await updateMeetingMutation.mutateAsync({
        id: editingMeeting.id,
        meeting: {
          title: editTitle,
          meeting_type: editType,
          duration_minutes: editDuration,
          location: editLocation,
          notes: editNotes,
        },
      });
      setEditingMeeting(null);
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteMeeting = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled meeting?')) return;
    await deleteMeetingMutation.mutateAsync(id);
    if (selectedMeeting?.id === id) setSelectedMeeting(null);
    await refetch();
  };

  const handleDeleteFromModal = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled meeting?')) return;
    await deleteMeetingMutation.mutateAsync(id);
    setSelectedMeeting(null);
    await refetch();
  };

  const handleTriggerAgent = async (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    await triggerMeetingMutation.mutateAsync({
      title: meeting.title,
      meeting_type: meeting.meeting_type,
      attendee_email: 'attendee@company.com',
    });
    await refetch();
  };

  const handleSendEmailInvite = async () => {
    if (!selectedMeeting) return;
    setInviteErrorMsg(null);
    setInviteSuccessMsg(null);

    const emails = inviteEmailInput
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (emails.length === 0) {
      setInviteErrorMsg('Please provide at least one valid recipient email address.');
      return;
    }

    try {
      const res = await sendMeetingInviteMutation.mutateAsync({
        id: selectedMeeting.id,
        payload: {
          attendee_emails: emails,
        },
      });
      setInviteSuccessMsg(
        res.message || `Briefing successfully dispatched to ${emails.length} attendee(s).`
      );
    } catch (err: any) {
      setInviteErrorMsg(
        err?.response?.data?.detail || err?.message || 'Failed to dispatch email invite via SMTP queue.'
      );
    }
  };

  const handleBulkSchedule = async () => {
    setIsBulkScheduling(true);
    try {
      for (const meeting of meetings || []) {
        await triggerMeetingMutation.mutateAsync({
          title: meeting.title || 'Executive Strategy Demo',
          meeting_type: meeting.meeting_type || 'Executive Demo',
          attendee_email: 'buyer@acme.org',
        });
      }
      await refetch();
    } finally {
      setIsBulkScheduling(false);
    }
  };

  const filteredMeetings = (meetings || []).filter(
    (m) =>
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meeting_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>{t('meetings.title', 'MEETING SCHEDULER & BRIEFING STUDIO')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase">
            {t('meetings.subtitle', 'AUTOMATED AGENDA BUILDER, PARTICIPANT BRIEFINGS, AND SMTP QUEUE DISPATCH')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkSchedule} isLoading={isBulkScheduling} className="text-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t('meetings.prep_materials', 'AUDIT ALL MEETINGS')}</span>
          </Button>
          <Button onClick={() => setMeetingModalOpen(true)} variant="primary" className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>{t('meetings.schedule_btn', 'SCHEDULE BRIEFING')}</span>
          </Button>
        </div>
      </div>

      {/* Meetings List / Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : filteredMeetings.length === 0 ? (
          <Card className="md:col-span-2 p-10 text-center text-muted-foreground/60 text-xs font-mono uppercase">
            NO UPCOMING MEETINGS SCHEDULED.
          </Card>
        ) : (
          filteredMeetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="p-4 space-y-2.5 hover:border-primary transition-none cursor-pointer group font-mono"
              onClick={() => handleOpenMeeting(meeting)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="purple" className="text-[8px] uppercase">{meeting.meeting_type}</Badge>
                  <h3 className="font-bold text-xs text-white mt-1 group-hover:text-primary transition-none uppercase">
                    {meeting.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <Badge statusValue={meeting.status}>{meeting.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleOpenEdit(e, meeting)}
                    className="text-muted-foreground hover:text-white p-1 h-6 w-6"
                    title="Edit Meeting Details"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteMeeting(e, meeting.id)}
                    className="text-muted-foreground hover:text-destructive p-1 h-6 w-6"
                    title="Cancel & Delete Meeting"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{formatDate(meeting.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase">
                  <UserCheck className="w-3 h-3" />
                  <span>AI PREP READY</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400 font-bold text-[10px] uppercase ml-auto">
                  <Mail className="w-3 h-3" />
                  <span>SMTP QUEUE</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Meeting Prep Details Modal */}
      {selectedMeeting && (
        <Modal
          isOpen={Boolean(selectedMeeting)}
          onClose={() => setSelectedMeeting(null)}
          title={`MEETING PREP — ${selectedMeeting.title.toUpperCase()}`}
          description={`AUTOMATED BRIEFING CREATED BY MEETINGSCHEDULERAGENT FOR ${selectedMeeting.meeting_type.toUpperCase()}`}
          className="max-w-2xl font-mono"
        >
          <div className="space-y-3 min-w-0 font-mono">
            {inviteErrorMsg && (
              <div className="p-2.5 bg-background border border-destructive text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div className="uppercase">{inviteErrorMsg}</div>
              </div>
            )}

            {inviteSuccessMsg && (
              <div className="p-2.5 bg-background border border-primary text-primary text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="uppercase">{inviteSuccessMsg}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
              <div className="p-2.5 bg-background border border-border min-w-0">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">SCHEDULED TIME</span>
                <div className="text-xs font-mono text-white mt-0.5 break-words">
                  {new Date(selectedMeeting.scheduled_at).toLocaleString()} ({selectedMeeting.duration_minutes || 30} MINS)
                </div>
              </div>
              <div className="p-2.5 bg-background border border-border min-w-0">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">LOCATION / LINK</span>
                <div className="text-xs font-mono text-primary mt-0.5 flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate block" title={selectedMeeting.location || 'Google Meet (auto-generated)'}>
                    {selectedMeeting.location || 'Google Meet (auto-generated)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Dispatch Action Card */}
            <div className="p-3 bg-background border border-border space-y-1.5">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-primary" />
                DISPATCH EMAIL BRIEFING TO ATTENDEES
              </h4>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="attendee@company.com, cto@enterprise.com"
                  value={inviteEmailInput}
                  onChange={(e) => setInviteEmailInput(e.target.value)}
                  className="font-mono text-xs flex-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendEmailInvite}
                  isLoading={sendMeetingInviteMutation.isPending}
                  className="text-xs h-7 shrink-0"
                >
                  <Send className="w-3 h-3 mr-1" />
                  <span>SEND INVITE</span>
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase">
                DISPATCHES FULL BRIEFING, GOOGLE MEET DETAILS, AND AGENDAS VIA SMTP QUEUE.
              </p>
            </div>

            {/* Agenda section */}
            <div className="p-3 bg-background border border-border space-y-1.5 min-w-0">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-primary shrink-0" />
                PROPOSED MEETING AGENDA
              </h4>
              <ul className="text-xs text-foreground/80 space-y-1 pl-1 min-w-0 font-mono">
                {Array.isArray(selectedMeeting.agenda) && selectedMeeting.agenda.length > 0 ? (
                  selectedMeeting.agenda.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 min-w-0">
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span className="break-words flex-1 uppercase">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground break-words uppercase">
                    1. WELCOME &amp; ALIGNMENT (5 MINS)<br />
                    2. PRODUCT ARCHITECTURE &amp; SECURITY REVIEW (15 MINS)<br />
                    3. PRICING &amp; NEXT STEPS (10 MINS)
                  </li>
                )}
              </ul>
            </div>

            {/* Context & Notes */}
            {selectedMeeting.notes && (
              <div className="p-2.5 bg-background border border-border text-xs text-foreground/80 break-words min-w-0 font-mono uppercase">
                <span className="text-muted-foreground/60 font-bold block mb-0.5">CONTEXT NOTES:</span>
                {selectedMeeting.notes}
              </div>
            )}

            {/* Prep Materials from MeetingSchedulerAgent */}
            {selectedMeeting.prep_materials && typeof selectedMeeting.prep_materials === 'object' && (
              <div className="p-3 bg-background border border-border space-y-1.5 min-w-0 font-mono">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3 h-3 text-primary shrink-0" />
                  MEETINGSCHEDULERAGENT — PREP MATERIALS
                </h4>
                <ul className="space-y-1 min-w-0">
                  {Object.entries(selectedMeeting.prep_materials).map(([k, v]) => (
                    <li key={k} className="flex items-start gap-1.5 text-xs text-foreground/80 min-w-0 font-mono uppercase">
                      <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="break-all flex-1"><span className="font-bold text-muted-foreground">{k.replace(/_/g, ' ')}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Tasks Checklist */}
            {selectedMeeting.followup_tasks?.length ? (
              <div className="p-3 bg-background border border-primary/40 space-y-1.5 min-w-0 font-mono">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 shrink-0" />
                  POST-MEETING FOLLOW-UP TASKS
                </h4>
                <ul className="space-y-1 min-w-0">
                  {selectedMeeting.followup_tasks.map((task: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80 min-w-0 font-mono uppercase">
                      <CheckSquare className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="break-words flex-1">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Attendees */}
            {selectedMeeting.attendees && (
              <div className="p-2.5 bg-background border border-border space-y-1 min-w-0 font-mono">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-primary shrink-0" />
                  ATTENDEES
                </h4>
                <div className="flex flex-wrap gap-1 pt-0.5 min-w-0">
                  {(Array.isArray(selectedMeeting.attendees)
                    ? selectedMeeting.attendees
                    : Object.values(selectedMeeting.attendees || {})
                  ).map((a: any, i: number) => (
                    <span key={i} className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-card text-foreground border border-border break-all">
                      {typeof a === 'string' ? a : a?.name || a?.email || JSON.stringify(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-border">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleTriggerAgent(e, selectedMeeting)}
                  isLoading={triggerMeetingMutation.isPending}
                  className="text-xs h-7"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>AI RE-PREP</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleOpenEdit(e, selectedMeeting)}
                  className="text-xs h-7"
                >
                  <Pencil className="w-3 h-3" />
                  <span>EDIT</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFromModal(selectedMeeting.id)}
                  isLoading={deleteMeetingMutation.isPending}
                  className="text-destructive hover:bg-rose-950/30 p-1 h-7"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <Button variant="outline" onClick={() => setSelectedMeeting(null)} className="text-xs">
                CLOSE
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Meeting Modal */}
      {editingMeeting && (
        <Modal
          isOpen={Boolean(editingMeeting)}
          onClose={() => setEditingMeeting(null)}
          title="EDIT MEETING DETAILS"
          description="UPDATE AGENDA, MEETING TYPE, DURATION, OR CONTEXT NOTES."
          className="font-mono"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3 font-mono">
            <Input
              label="MEETING TITLE"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Select
                label="MEETING TYPE"
                options={TYPE_OPTIONS}
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                required
              />
              <Input
                label="DURATION (MINS)"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="LOCATION / VIDEO LINK"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/80">CONTEXT / NOTES</label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-background text-foreground border border-border rounded-none p-2.5 text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingMeeting(null)} className="text-xs">
                CANCEL
              </Button>
              <Button type="submit" variant="primary" isLoading={updateMeetingMutation.isPending} className="text-xs">
                <Pencil className="w-3.5 h-3.5 mr-1" />
                <span>SAVE CHANGES</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
