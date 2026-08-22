import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sequenceApi } from '../api/sequenceApi';
import { SDRSequence } from '../types/sequence.types';
import {
  Users,
  X,
  Search,
  CheckCircle2,
  Building,
  Mail,
  UserCheck,
} from 'lucide-react';

interface EnrollLeadsModalProps {
  sequence: SDRSequence;
  onClose: () => void;
}

export function EnrollLeadsModal({ sequence, onClose }: EnrollLeadsModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enrolledSuccess, setEnrolledSuccess] = useState<string | null>(null);

  const { data: prospects, isLoading } = useQuery({
    queryKey: ['available-prospects'],
    queryFn: () => sequenceApi.getAvailableProspects(),
  });

  const enrollMutation = useMutation({
    mutationFn: () => sequenceApi.enrollContacts(sequence.id, selectedIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sdr-sequences'] });
      setEnrolledSuccess(data.message);
    },
  });

  const filtered = (prospects || []).filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md font-mono">
      <div className="bg-card border border-border rounded-none w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-none bg-background text-primary border border-border">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>ENROLL CRM CONTACTS IN CADENCE</span>
                <Badge variant="purple" className="text-[9px] uppercase font-mono">
                  {sequence.name}
                </Badge>
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
                SELECT TARGET PROSPECTS TO TRIGGER AUTONOMOUS OUTREACH.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-muted-foreground hover:text-foreground hover:bg-background transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 font-mono">
          {enrolledSuccess ? (
            <div className="p-6 rounded-none bg-background border border-primary text-center space-y-2">
              <div className="w-10 h-10 rounded-none bg-card text-primary border border-border flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-foreground uppercase">ENROLLMENT DISPATCHED</h3>
              <p className="text-[10px] text-foreground/80 uppercase">{enrolledSuccess}</p>
              <Button variant="primary" size="sm" onClick={onClose} className="mt-2 text-xs uppercase">
                RETURN TO SEQUENCES
              </Button>
            </div>
          ) : (
            <>
              {/* Search and Select All Bar */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH BY NAME, COMPANY, OR EMAIL..."
                    className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                  />
                </div>
                {filtered.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs h-7 px-2.5 shrink-0 uppercase"
                  >
                    {selectedIds.length === filtered.length ? 'DESELECT ALL' : 'SELECT ALL'}
                  </Button>
                )}
              </div>

              {/* Contacts List */}
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="p-6 text-center text-xs text-muted-foreground/60 uppercase">LOADING PROSPECTS...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground/60 uppercase">NO CONTACTS FOUND.</div>
                ) : (
                  filtered.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelect(p.id)}
                        className={`p-2.5 rounded-none border cursor-pointer flex items-center justify-between transition-none ${isSelected
                            ? 'bg-card border-primary text-foreground'
                            : 'bg-background border-border hover:border-slate-500 text-foreground/80'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="rounded-none border-border bg-background text-primary focus:ring-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-foreground flex items-center gap-1 uppercase">
                              <span>{p.name}</span>
                              <span className="text-[9px] text-muted-foreground font-normal">({p.title})</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 uppercase">
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-muted-foreground/60" />
                                {p.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground/60" />
                                {p.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Badge variant="default" className="text-[9px] font-mono uppercase">
                          SCORE: {p.score}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2.5 border-t border-border">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">
                  {selectedIds.length} CONTACT(S) SELECTED
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
                    CANCEL
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={() => enrollMutation.mutate()}
                    isLoading={enrollMutation.isPending}
                    className="text-xs uppercase"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    <span>ENROLL SELECTED ({selectedIds.length})</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
