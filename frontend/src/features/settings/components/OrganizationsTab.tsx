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
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Multi-Tenant Workspaces &amp; Organizations</h2>
            <Badge variant="purple" className="text-[10px]">
              Multi-Tenancy
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Isolate contacts, deals, customer interactions, and agent executions within secure organization boundaries.
          </p>
        </div>

        <Button size="sm" variant="orange" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </Button>
      </div>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs?.map((org: Organization) => (
            <div
              key={org.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <Badge variant={org.plan_tier === 'enterprise' ? 'purple' : 'info'} className="text-[10px] uppercase font-mono">
                    {org.plan_tier}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{org.name}</h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">slug: {org.slug}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{org.domain || 'Internal Workspace'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status: {org.is_active ? 'Active' : 'Suspended'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{org.id}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(org.id)}
                  className="h-7 px-2 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedId === org.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="ml-1">{copiedId === org.id ? 'Copied' : 'Copy ID'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-400" />
                Create Organization Workspace
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Ventures"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Identifier Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. apex-global"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Domain</label>
                <input
                  type="text"
                  placeholder="e.g. apexglobal.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan Tier</label>
                <select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="starter">Starter (Small Business)</option>
                  <option value="growth">Growth (Scale-up)</option>
                  <option value="enterprise">Enterprise (Unlimited Agents)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="orange" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Provisioning...' : 'Create Workspace'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
