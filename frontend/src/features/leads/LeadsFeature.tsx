import { useState } from 'react';
import { Plus, Sparkles, Trash2, Bot, Users, Pencil, Target, ArrowRight, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLeads, useUpdateLead, useDeleteLead } from '@/hooks/use-leads';
import { useTriggerLeadQualification } from '@/hooks/use-agents';
import { useUIStore } from '@/stores/use-ui-store';
import { useTranslation, useLocaleFormat } from '@/features/multi-language';
import { getScoreColor } from '@/lib/utils';
import { Lead, LeadStatus } from '@/types/crm.types';

const STATUS_OPTIONS = [
  { value: 'new', label: 'NEW' },
  { value: 'contacted', label: 'CONTACTED' },
  { value: 'qualified', label: 'QUALIFIED' },
  { value: 'unqualified', label: 'UNQUALIFIED' },
];

export function LeadsFeature() {
  const { t } = useTranslation();
  const { formatNumber } = useLocaleFormat();
  const { data: leads, isLoading, refetch } = useLeads();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const qualifyLeadMutation = useTriggerLeadQualification();
  const { setLeadModalOpen, searchQuery } = useUIStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);
  const [isBulkQualifying, setIsBulkQualifying] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Edit Lead state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<LeadStatus>('new');
  const [editScore, setEditScore] = useState(50);
  const [editJobTitle, setEditJobTitle] = useState('');

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditFirstName(lead.first_name || '');
    setEditLastName(lead.last_name || '');
    setEditEmail(lead.email || '');
    setEditStatus(lead.lead_status || 'new');
    setEditScore(lead.lead_score || 50);
    setEditJobTitle(lead.job_title || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      await updateLeadMutation.mutateAsync({
        id: editingLead.id,
        lead: {
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          lead_status: editStatus,
          lead_score: Number(editScore),
          job_title: editJobTitle,
        },
      });
      setEditingLead(null);
      await refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleQualify = async (lead: Lead) => {
    setQualifyingId(lead.id);
    try {
      await qualifyLeadMutation.mutateAsync({
        email: lead.email,
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email,
        job_title: lead.job_title || 'Executive',
        company: lead.company_name || 'Prospect Company',
      });
      await refetch();
    } finally {
      setQualifyingId(null);
    }
  };

  const handleBulkQualify = async () => {
    if (!leads || leads.length === 0) return;
    setIsBulkQualifying(true);
    try {
      for (const lead of leads.slice(0, 5)) {
        await qualifyLeadMutation.mutateAsync({
          email: lead.email,
          name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email,
          job_title: lead.job_title || 'Executive',
          company: lead.company_name || 'Prospect Company',
        });
      }
      await refetch();
    } finally {
      setIsBulkQualifying(false);
    }
  };

  const filteredLeads = (leads || []).filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || lead.lead_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            {t('leads.title', 'Lead Qualification Console')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('leads.subtitle', 'Enriched contact profiles scored automatically by LeadQualificationAgent')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkQualify} isLoading={isBulkQualifying}>
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{t('leads.run_fleet_qualification', 'Run AI Fleet Qualification')}</span>
          </Button>
          <Button onClick={() => setLeadModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>{t('leads.add_lead', 'Add Lead')}</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('common.status', 'Status')}:
            </span>
            {['all', 'qualified', 'contacted', 'new', 'unqualified'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-none text-xs font-medium transition-none ${
                  filterStatus === status
                    ? 'bg-brand-600 text-foreground shadow-md'
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground/70 font-mono">
            {filteredLeads.length} / {formatNumber(leads?.length || 0)}
          </span>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('leads.all_prospects', 'All Prospects')}</CardTitle>
        </CardHeader>
        <div className="pt-2">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground/70 text-sm">
              No leads match your filter criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.contact', 'Contact')}</TableHead>
                  <TableHead>{t('common.email', 'Email')}</TableHead>
                  <TableHead>{t('leads.lead_score', 'AI Score')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead>{t('leads.buying_signals', 'Buying Signals')}</TableHead>
                  <TableHead>{t('leads.routing', 'Routing')}</TableHead>
                  <TableHead>{t('leads.next_action', 'Next Action')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>
                          {lead.first_name || lead.last_name
                            ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                            : 'Prospect'}
                        </span>
                        {lead.lead_status === 'qualified' && (
                          <span className="px-1.5 py-0.5 rounded-none text-[9px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/40 uppercase tracking-wider flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            NEW AI QUALIFIED
                          </span>
                        )}
                      </div>
                      {lead.job_title && <div className="text-xs text-muted-foreground font-normal">{lead.job_title}</div>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground/90">{lead.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[80px]">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-brand-400" />
                          <span className={`text-xs font-bold ${getScoreColor(lead.lead_score).split(' ')[0]}`}>{lead.lead_score}/100</span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-none overflow-hidden">
                          <div
                            className={`h-full rounded-none ${lead.lead_score >= 70 ? 'bg-emerald-500' : lead.lead_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${lead.lead_score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge statusValue={lead.lead_status}>{lead.lead_status}</Badge>
                    </TableCell>
                    <TableCell>
                      {lead.buying_signals?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {lead.buying_signals.slice(0, 2).map((sig, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Zap className="w-2.5 h-2.5" />{sig}
                            </span>
                          ))}
                          {lead.buying_signals.length > 2 && (
                            <span className="text-[10px] text-muted-foreground/70">+{lead.buying_signals.length - 2}</span>
                          )}
                        </div>
                      ) : <span className="text-muted-foreground/60 text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      {lead.routing_team ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          <Target className="w-2.5 h-2.5" />{lead.routing_team}
                        </span>
                      ) : <span className="text-muted-foreground/60 text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      {lead.recommended_action ? (
                        <div className="flex items-start gap-1 max-w-[160px]">
                          <ArrowRight className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-foreground/90 leading-tight">{lead.recommended_action}</span>
                        </div>
                      ) : <span className="text-muted-foreground/60 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={qualifyingId === lead.id}
                          onClick={() => handleQualify(lead)}
                        >
                          <Bot className="w-3.5 h-3.5 text-brand-400" />
                          <span>Re-Qualify</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(lead)}
                          className="text-muted-foreground/70 hover:text-brand-400 p-1.5 h-8 w-8"
                          title="Edit Lead Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLeadMutation.mutate(lead.id)}
                          className="text-muted-foreground/70 hover:text-rose-400 p-1.5 h-8 w-8"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Edit Lead Modal */}
      {editingLead && (
        <Modal
          isOpen={Boolean(editingLead)}
          onClose={() => setEditingLead(null)}
          title="Edit Lead Details"
          description="Update contact profile, status, score, or job title."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Lead Status"
                options={STATUS_OPTIONS}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                required
              />
              <Input
                label="AI Qualification Score (0-100)"
                type="number"
                min={0}
                max={100}
                value={editScore}
                onChange={(e) => setEditScore(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Job Title / Role"
              value={editJobTitle}
              onChange={(e) => setEditJobTitle(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingLead(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateLeadMutation.isPending}>
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
