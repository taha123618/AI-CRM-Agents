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

    // Populate attendee email default
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
          duration_minutes: Number(editDuration),
          location: editLocation,
          notes: editNotes,
        },
      });
      setEditingMeeting(null);
      if (selectedMeeting?.id === editingMeeting.id) {
        setSelectedMeeting(null);
      }
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteMeeting = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteMeetingMutation.mutateAsync(id);
      if (selectedMeeting?.id === id) {
        setSelectedMeeting(null);
      }
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleSendEmailInvite = async () => {
    if (!selectedMeeting) return;
    setInviteErrorMsg(null);
    setInviteSuccessMsg(null);

    const emailList = inviteEmailInput
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    if (emailList.length === 0) {
      setInviteErrorMsg('Please provide at least one valid attendee email address.');
      return;
    }

    try {
      const res = await sendMeetingInviteMutation.mutateAsync({
        id: selectedMeeting.id,
        payload: {
          attendee_emails: emailList,
        },
      });
      setInviteSuccessMsg(res.message || `Meeting briefing sent to ${emailList.join(', ')}`);
      await refetch();
      setTimeout(() => {
        setInviteSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setInviteErrorMsg(err.response?.data?.detail || err.message || 'Failed to dispatch meeting briefing email.');
    }
  };

  const handleTriggerAgent = async (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    try {
      await triggerMeetingMutation.mutateAsync({
        title: meeting.title,
        meeting_type: meeting.meeting_type || 'Executive Demo',
        attendee_email: 'buyer@acme.org',
      });
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteFromModal = async (id: string) => {
    try {
      await deleteMeetingMutation.mutateAsync(id);
      setSelectedMeeting(null);
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleBulkSchedule = async () => {
    if (!meetings || meetings.length === 0) return;
    setIsBulkScheduling(true);
    try {
      for (const meeting of meetings.slice(0, 5)) {
        await triggerMeetingMutation.mutateAsync({
          title: meeting.title,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
            {t('meetings.title', 'Autonomous Meeting Scheduling & Email Delivery')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('meetings.subtitle', 'Automated agenda builder, participant email briefing dispatch, and CRM sync')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkSchedule} isLoading={isBulkScheduling}>
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{t('meetings.prep_materials', 'Run AI Fleet Prep Audit')}</span>
          </Button>
          <Button onClick={() => setMeetingModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white">
            <Sparkles className="w-4 h-4" />
            <span>{t('meetings.schedule_btn', 'Schedule AI Briefing')}</span>
          </Button>
        </div>
      </div>

      {/* Meetings List / Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
        ) : filteredMeetings.length === 0 ? (
          <Card className="md:col-span-2 p-12 text-center text-slate-500 text-sm">
            No upcoming meetings scheduled.
          </Card>
        ) : (
          filteredMeetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="p-5 space-y-3 hover:border-slate-700/80 transition-all cursor-pointer group"
              onClick={() => handleOpenMeeting(meeting)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="purple">{meeting.meeting_type}</Badge>
                  <h3 className="font-bold text-sm text-white mt-1 group-hover:text-purple-300 transition-colors">
                    {meeting.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge statusValue={meeting.status}>{meeting.status}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleOpenEdit(e, meeting)}
                    className="text-slate-500 hover:text-brand-400 p-1.5 h-7 w-7"
                    title="Edit Meeting Details"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteMeeting(e, meeting.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 h-7 w-7"
                    title="Cancel & Delete Meeting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  <span>{formatDate(meeting.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>AI Prep Ready</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400 font-medium ml-auto">
                  <Mail className="w-3.5 h-3.5" />
                  <span>SMTP Briefing</span>
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
          title={`Meeting Prep — ${selectedMeeting.title}`}
          description={`Automated briefing created by MeetingSchedulerAgent for ${selectedMeeting.meeting_type}`}
          className="max-w-2xl"
        >
          <div className="space-y-4 min-w-0">
            {inviteErrorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{inviteErrorMsg}</div>
              </div>
            )}

            {inviteSuccessMsg && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>{inviteSuccessMsg}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled Time</span>
                <div className="text-xs font-mono text-white mt-1 break-words">
                  {new Date(selectedMeeting.scheduled_at).toLocaleString()} ({selectedMeeting.duration_minutes || 30} mins)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Location / Link</span>
                <div className="text-xs font-medium text-brand-400 mt-1 flex items-center gap-1 min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate block" title={selectedMeeting.location || 'Google Meet (auto-generated)'}>
                    {selectedMeeting.location || 'Google Meet (auto-generated)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Dispatch Action Card */}
            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  Dispatch Email Briefing to Attendees
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="attendee@company.com, cto@enterprise.com"
                  value={inviteEmailInput}
                  onChange={(e) => setInviteEmailInput(e.target.value)}
                  className="font-mono text-xs flex-1"
                />
                <Button
                  onClick={handleSendEmailInvite}
                  isLoading={sendMeetingInviteMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email Invite</span>
                </Button>
              </div>
              <p className="text-[11px] text-slate-400">
                Dispatches full meeting briefing, Google Meet details, and agenda directly through centralized SMTP queue.
              </p>
            </div>

            {/* Agenda section */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 min-w-0">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                Proposed Meeting Agenda
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-2 pt-1 min-w-0">
                {Array.isArray(selectedMeeting.agenda) && selectedMeeting.agenda.length > 0 ? (
                  selectedMeeting.agenda.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 min-w-0">
                      <span className="text-purple-400 font-bold shrink-0">•</span>
                      <span className="break-words flex-1">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 break-words">
                    1. Welcome & Alignment (5 mins)<br />
                    2. Product Architecture & Enterprise Security Review (15 mins)<br />
                    3. Custom Pricing & Implementation Next Steps (10 mins)
                  </li>
                )}
              </ul>
            </div>

            {/* Context & Notes */}
            {selectedMeeting.notes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 break-words min-w-0">
                <span className="text-slate-500 font-semibold block mb-1">Context Notes:</span>
                {selectedMeeting.notes}
              </div>
            )}

            {/* Prep Materials from MeetingSchedulerAgent */}
            {selectedMeeting.prep_materials && typeof selectedMeeting.prep_materials === 'object' && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  MeetingSchedulerAgent — Prep Materials
                </h4>
                <ul className="space-y-1 min-w-0">
                  {Object.entries(selectedMeeting.prep_materials).map(([k, v]) => (
                    <li key={k} className="flex items-start gap-2 text-xs text-slate-300 min-w-0">
                      <ChevronRight className="w-3 h-3 text-brand-400 mt-0.5 shrink-0" />
                      <span className="break-all flex-1"><span className="font-semibold text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Tasks Checklist */}
            {selectedMeeting.followup_tasks?.length ? (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 min-w-0">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                  Post-Meeting Follow-up Tasks
                </h4>
                <ul className="space-y-1.5 min-w-0">
                  {selectedMeeting.followup_tasks.map((task: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300 min-w-0">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0 opacity-60" />
                      <span className="break-words flex-1">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Attendees */}
            {selectedMeeting.attendees && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  Attendees
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1 min-w-0">
                  {(Array.isArray(selectedMeeting.attendees)
                    ? selectedMeeting.attendees
                    : Object.values(selectedMeeting.attendees || {})
                  ).map((a: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 break-all">
                      {typeof a === 'string' ? a : a?.name || a?.email || JSON.stringify(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleTriggerAgent(e, selectedMeeting)}
                  isLoading={triggerMeetingMutation.isPending}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Re-Prep</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleOpenEdit(e, selectedMeeting)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Meeting</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFromModal(selectedMeeting.id)}
                  isLoading={deleteMeetingMutation.isPending}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
              </div>

              <Button variant="outline" onClick={() => setSelectedMeeting(null)}>
                Close
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
          title="Edit Meeting Details"
          description="Update agenda, meeting type, duration, or notes."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Meeting Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Meeting Type"
                options={TYPE_OPTIONS}
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                required
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Location / Video Link"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Context / Notes</label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 border border-slate-700/80 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setEditingMeeting(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMeetingMutation.isPending}>
                <Pencil className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
