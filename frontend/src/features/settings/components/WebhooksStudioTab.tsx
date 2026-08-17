import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Plus, Play, Trash2, CheckCircle2, Copy, RefreshCw, Search, Filter, RotateCcw } from 'lucide-react';
import { settingsApi } from '../api';
import { WebhookEndpoint, WebhookDelivery } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TablePagination } from './TablePagination';

const AVAILABLE_EVENTS = [
  'lead.created',
  'lead.qualified',
  'deal.created',
  'deal.stage_changed',
  'deal.won',
  'intervention.triggered',
  'sequence.step_sent',
  'test.ping',
];

export function WebhooksStudioTab() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['*']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Delivery Filter & Pagination State
  const [deliverySearch, setDeliverySearch] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: webhooks = [], isLoading } = useQuery<WebhookEndpoint[]>({
    queryKey: ['webhooks-list'],
    queryFn: settingsApi.getWebhooks,
  });

  const { data: deliveries = [] } = useQuery<WebhookDelivery[]>({
    queryKey: ['webhook-deliveries'],
    queryFn: settingsApi.getDeliveries,
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: settingsApi.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks-list'] });
      setIsCreateOpen(false);
      setUrl('');
      setDescription('');
      setSelectedEvents(['*']);
      setFeedback('Webhook endpoint registered successfully.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks-list'] });
      setFeedback('Webhook endpoint removed.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const testMutation = useMutation({
    mutationFn: settingsApi.testWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
      setFeedback('Test ping dispatched with HMAC signature.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const handleCopySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleEvent = (ev: string) => {
    if (ev === '*') {
      setSelectedEvents(['*']);
      return;
    }
    const filtered = selectedEvents.filter((e) => e !== '*');
    if (filtered.includes(ev)) {
      const next = filtered.filter((e) => e !== ev);
      setSelectedEvents(next.length === 0 ? ['*'] : next);
    } else {
      setSelectedEvents([...filtered, ev]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    createMutation.mutate({ url, description, events: selectedEvents });
  };

  // Filtered & Paginated Deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch =
        !deliverySearch.trim() ||
        d.event_type?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
        d.response_body?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
        JSON.stringify(d.payload || {}).toLowerCase().includes(deliverySearch.toLowerCase());

      const matchesStatus =
        deliveryStatusFilter === 'all' ||
        (deliveryStatusFilter === 'success' && d.success) ||
        (deliveryStatusFilter === 'failed' && !d.success);

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, deliverySearch, deliveryStatusFilter]);

  const totalPages = Math.ceil(filteredDeliveries.length / pageSize) || 1;
  const paginatedDeliveries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDeliveries.slice(start, start + pageSize);
  }, [filteredDeliveries, page, pageSize]);

  const hasActiveFilters = deliverySearch !== '' || deliveryStatusFilter !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-400" />
            Universal Outbound Webhooks & Ingestion Engine
          </h2>
          <p className="text-sm text-slate-400">
            Dispatch cryptographically signed HMAC-SHA256 payloads to third-party endpoints (Zapier, Make, Slack, Customer Data Platforms).
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Webhook Endpoint
        </Button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Endpoints List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Registered Destination Endpoints</h3>

        {webhooks.map((ep) => (
          <Card key={ep.id} className="glass-card border border-slate-800/80 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-white">{ep.url}</span>
                  <Badge variant={ep.is_active ? 'success' : 'default'}>
                    {ep.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {ep.description && (
                  <p className="text-xs text-slate-400">{ep.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testMutation.mutate(ep.id)}
                  disabled={testMutation.isPending}
                  className="flex items-center gap-1.5 text-xs text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                >
                  <Play className="w-3.5 h-3.5" />
                  Test Ping
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(ep.id)}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-xs text-slate-400 font-semibold">Subscribed Events:</span>
              {(ep.events || []).map((ev) => (
                <Badge key={ev} variant="info" className="text-[10px] font-mono">
                  {ev}
                </Badge>
              ))}

              <div className="ml-auto flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                <span>Secret: ••••••••••••</span>
                <button
                  onClick={() => handleCopySecret(ep.secret, ep.id)}
                  className="hover:text-brand-400"
                  title="Copy Signing Secret"
                >
                  {copiedId === ep.id ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}

        {webhooks.length === 0 && (
          <Card className="p-8 text-center glass-card border border-slate-800/80 text-slate-500">
            No outbound webhooks configured yet. Register a destination endpoint above.
          </Card>
        )}
      </div>

      {/* Deliveries Audit Stream */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-brand-400" />
              Delivery Receipts & Dispatches
            </h3>
            <span className="text-xs text-slate-400">Live Auto-Refresh (5s)</span>
          </div>

          {/* Delivery Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={deliverySearch}
                onChange={(e) => {
                  setDeliverySearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search event, payload..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deliveryStatusFilter}
                onChange={(e) => {
                  setDeliveryStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Deliveries</option>
                <option value="success">Success Only</option>
                <option value="failed">Failed / Errors</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDeliverySearch('');
                  setDeliveryStatusFilter('all');
                  setPage(1);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <Card className="glass-card border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800/80">
                <tr>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payload Summary</th>
                  <th className="px-4 py-3">Response</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/20">
                    <td className="px-4 py-2.5 font-mono text-brand-400 font-medium">
                      {d.event_type}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={d.success ? 'success' : 'danger'}>
                        {d.response_status ? `HTTP ${d.response_status}` : 'ERR'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-400 truncate max-w-xs">
                      {JSON.stringify(d.payload?.data || d.payload || {})}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 truncate max-w-xs">
                      {d.response_body || (d.success ? 'Delivered successfully' : 'No response')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-400">
                      {d.created_at ? new Date(d.created_at).toLocaleTimeString() : 'Recent'}
                    </td>
                  </tr>
                ))}
                {paginatedDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      {hasActiveFilters
                        ? 'No webhook deliveries match the filter criteria.'
                        : 'No webhook deliveries dispatched yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Delivery Table Pagination */}
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredDeliveries.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </Card>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-400" />
                Register Webhook Endpoint
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination URL (HTTPS Recommended)
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/crm-events"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Service Name
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Zapier Lead Notification Pipeline"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Event Subscriptions
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-300 p-2 rounded hover:bg-slate-800/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes('*')}
                      onChange={() => handleToggleEvent('*')}
                      className="rounded border-slate-700 text-brand-500 focus:ring-0"
                    />
                    <span className="font-mono text-amber-400 font-bold">* (All Events)</span>
                  </label>
                  {AVAILABLE_EVENTS.map((ev) => (
                    <label
                      key={ev}
                      className="flex items-center gap-2 text-xs text-slate-300 p-2 rounded hover:bg-slate-800/40 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev)}
                        onChange={() => handleToggleEvent(ev)}
                        disabled={selectedEvents.includes('*')}
                        className="rounded border-slate-700 text-brand-500 focus:ring-0"
                      />
                      <span className="font-mono">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Registering...' : 'Register Endpoint'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
