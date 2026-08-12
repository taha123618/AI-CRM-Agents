import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, UserCheck, MapPin, FileText, Trash2, Pencil, CheckSquare, ChevronRight, Bot, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useMeetings, useUpdateMeeting, useDeleteMeeting } from '@/hooks/use-meetings';
import { useUIStore } from '@/stores/use-ui-store';
import { Meeting } from '@/types/crm.types';

const TYPE_OPTIONS = [
  { value: 'Executive Demo', label: 'Executive Demo' },
  { value: 'Discovery Call', label: 'Discovery Call' },
  { value: 'Technical Review', label: 'Technical Review' },
  { value: 'Renewal Discussion', label: 'Renewal Discussion' },
];

export function MeetingsPage() {
  const { data: meetings, isLoading } = useMeetings();
  const updateMeetingMutation = useUpdateMeeting();
  const deleteMeetingMutation = useDeleteMeeting();
  const { setMeetingModalOpen, searchQuery } = useUIStore();

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('Technical Review');
  const [editDuration, setEditDuration] = useState(30);
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');

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
    } catch {
      // Error handled by mutation
    }
  };

  const handleDeleteMeeting = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMeetingMutation.mutate(id);
  };

  const handleDeleteFromModal = async (id: string) => {
    try {
      await deleteMeetingMutation.mutateAsync(id);
      setSelectedMeeting(null);
    } catch {
      // Error handled by mutation
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
            AI Calendar & Smart Meeting Prep
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Context-aware scheduling and automatic meeting prep by MeetingSchedulerAgent
          </p>
        </div>

        <Button onClick={() => setMeetingModalOpen(true)}>
          <Sparkles className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </Button>
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
              onClick={() => setSelectedMeeting(meeting)}
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
                  <span>{new Date(meeting.scheduled_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>AI Prep Generated</span>
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
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Scheduled Time</span>
                <div className="text-xs font-mono text-white mt-1">
                  {new Date(selectedMeeting.scheduled_at).toLocaleString()} ({selectedMeeting.duration_minutes || 30} mins)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Location / Link</span>
                <div className="text-xs font-medium text-brand-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedMeeting.location || 'Google Meet (auto-generated)'}</span>
                </div>
              </div>
            </div>

            {/* Agenda section */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Proposed Meeting Agenda
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-2 pt-1">
                {Array.isArray(selectedMeeting.agenda) && selectedMeeting.agenda.length > 0 ? (
                  selectedMeeting.agenda.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">
                    1. Welcome & Alignment (5 mins)<br />
                    2. Product Architecture & Enterprise Security Review (15 mins)<br />
                    3. Custom Pricing & Implementation Next Steps (10 mins)
                  </li>
                )}
              </ul>
            </div>

            {/* Context & Notes */}
            {selectedMeeting.notes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 font-semibold block mb-1">Context Notes:</span>
                {selectedMeeting.notes}
              </div>
            )}

            {/* Prep Materials from MeetingSchedulerAgent */}
            {selectedMeeting.prep_materials && typeof selectedMeeting.prep_materials === 'object' && (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-brand-400" />
                  MeetingSchedulerAgent — Prep Materials
                </h4>
                <ul className="space-y-1">
                  {Object.entries(selectedMeeting.prep_materials).map(([k, v]) => (
                    <li key={k} className="flex items-start gap-2 text-xs text-slate-300">
                      <ChevronRight className="w-3 h-3 text-brand-400 mt-0.5 shrink-0" />
                      <span><span className="font-semibold text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Tasks Checklist */}
            {selectedMeeting.followup_tasks?.length ? (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Post-Meeting Follow-up Tasks
                </h4>
                <ul className="space-y-1.5">
                  {selectedMeeting.followup_tasks.map((task: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0 opacity-60" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Attendees */}
            {selectedMeeting.attendees && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Attendees
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(Array.isArray(selectedMeeting.attendees)
                    ? selectedMeeting.attendees
                    : Object.values(selectedMeeting.attendees || {})
                  ).map((a: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
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
