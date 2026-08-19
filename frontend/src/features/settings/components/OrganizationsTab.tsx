import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, CheckCircle2, Globe, Copy, Check } from 'lucide-react';
import { settingsApi } from '../api';
import { Organization } from '../types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function OrganizationsTab() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [planTier, setPlanTier] = useState<'starter' | 'growth' | 'enterprise'>('enterprise');
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: settingsApi.getOrganizations,
  });

  const createMutation = useMutation({
    mutationFn: settingsApi.createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations-list'] });
      setIsCreateModalOpen(false);
      setName('');
      setSlug('');
      setDomain('');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.detail || err?.message || 'Failed to create workspace.');
    },
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Workspace name is required.');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      slug: slug.trim() || undefined,
      domain: domain.trim() || undefined,
      plan_tier: planTier,
    });
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none bg-[#1F2833] border border-[#3A4552]">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">MULTI-TENANT WORKSPACES &amp; ORGANIZATIONS</h2>
            <Badge variant="purple" className="text-[9px] uppercase font-mono">
              MULTI-TENANCY
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
            ISOLATE CONTACTS, DEALS, CUSTOMER INTERACTIONS, AND AGENT EXECUTIONS WITHIN SECURE BOUNDARIES.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)} className="text-xs h-7 uppercase font-bold flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-[#0B0C10]" />
          <span>NEW WORKSPACE</span>
        </Button>
      </div>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
          {orgs?.map((org: Organization) => (
            <div
              key={org.id}
              className="p-4 rounded-none bg-[#1F2833] border border-[#3A4552] hover:border-[#39FF14] transition-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-none bg-[#0B0C10] border border-[#3A4552] flex items-center justify-center text-[#39FF14] font-bold text-xs font-mono">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <Badge variant={org.plan_tier === 'enterprise' ? 'purple' : 'info'} className="text-[9px] uppercase font-mono">
                    {org.plan_tier}
                  </Badge>
                </div>

                <h3 className="text-xs font-bold text-white uppercase tracking-wide">{org.name}</h3>
                <p className="text-[10px] font-mono text-[#39FF14] mt-0.5">SLUG: {org.slug}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-[10px] uppercase">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>{org.domain || 'INTERNAL WORKSPACE'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase">
                    <CheckCircle2 className="w-3 h-3 text-[#39FF14]" />
                    <span>STATUS: {org.is_active ? 'ACTIVE' : 'SUSPENDED'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#3A4552] flex items-center justify-between text-xs">
                <span className="font-mono text-[9px] text-slate-500 truncate max-w-[120px]">{org.id}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(org.id)}
                  className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-white uppercase"
                >
                  {copiedId === org.id ? <Check className="w-3 h-3 text-[#39FF14]" /> : <Copy className="w-3 h-3" />}
                  <span className="ml-1">{copiedId === org.id ? 'COPIED' : 'COPY ID'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md bg-[#1F2833] border border-[#3A4552] rounded-none p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-[#39FF14]" />
                CREATE ORGANIZATION WORKSPACE
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs rounded-none uppercase font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">ORGANIZATION NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. APEX GLOBAL VENTURES"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">IDENTIFIER SLUG (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="E.G. APEX-GLOBAL"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">COMPANY DOMAIN</label>
                <input
                  type="text"
                  placeholder="E.G. APEXGLOBAL.COM"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">SUBSCRIPTION PLAN TIER</label>
                <select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] uppercase font-mono"
                >
                  <option value="starter">STARTER (SMALL BUSINESS)</option>
                  <option value="growth">GROWTH (SCALE-UP)</option>
                  <option value="enterprise">ENTERPRISE (UNLIMITED AGENTS)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#3A4552]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={createMutation.isPending} className="text-xs uppercase font-bold">
                  {createMutation.isPending ? 'PROVISIONING...' : 'CREATE WORKSPACE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
