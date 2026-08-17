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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Enroll CRM Contacts in Cadence</span>
                <Badge variant="purple" className="text-[10px] bg-purple-500/20 text-purple-300">
                  {sequence.name}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select target prospects to trigger multi-touch outreach steps.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 scrollbar-thin">
          {enrolledSuccess ? (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Enrollment Successful</h3>
              <p className="text-xs text-slate-300">{enrolledSuccess}</p>
              <Button variant="primary" size="sm" onClick={onClose} className="mt-2">
                Return to Sequences
              </Button>
            </div>
          ) : (
            <>
              {/* Search and Select All Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, company, or email..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                {filtered.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="text-xs h-8 px-3 shrink-0 border-slate-800"
                  >
                    {selectedIds.length === filtered.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              {/* Contacts List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading prospects...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">No contacts found.</div>
                ) : (
                  filtered.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelect(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-purple-500/15 border-purple-500 text-white'
                            : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-700 text-purple-600 focus:ring-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({p.title})</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-500" />
                                {p.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {p.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Badge variant="default" className="text-[10px] font-mono">
                          Score: {p.score}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  {selectedIds.length} contact(s) selected
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={selectedIds.length === 0}
                    onClick={() => enrollMutation.mutate()}
                    isLoading={enrollMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    <span>Enroll Selected ({selectedIds.length})</span>
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
