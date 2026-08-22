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
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-none bg-card border border-border">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-primary" />
            UNIVERSAL OUTBOUND WEBHOOKS &amp; INGESTION ENGINE
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
            DISPATCH CRYPTOGRAPHICALLY SIGNED HMAC-SHA256 PAYLOADS TO THIRD-PARTY ENDPOINTS.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 text-xs h-7 uppercase font-bold"
        >
          <Plus className="w-3.5 h-3.5 text-primary-foreground" />
          <span>ADD WEBHOOK ENDPOINT</span>
        </Button>
      </div>

      {feedback && (
        <div className="p-3 bg-background border border-primary text-primary text-xs flex items-center gap-2 uppercase animate-in fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Endpoints List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">REGISTERED DESTINATION ENDPOINTS</h3>

        {webhooks.map((ep) => (
          <Card key={ep.id} className="bg-card border-border p-4 space-y-3 font-mono">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-foreground">{ep.url}</span>
                  <Badge variant={ep.is_active ? 'success' : 'default'} className="text-[9px] uppercase">
                    {ep.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                {ep.description && (
                  <p className="text-[10px] text-muted-foreground uppercase">{ep.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testMutation.mutate(ep.id)}
                  disabled={testMutation.isPending}
                  className="flex items-center gap-1.5 text-xs h-7 uppercase"
                >
                  <Play className="w-3 h-3 text-primary" />
                  <span>TEST PING</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(ep.id)}
                  className="text-muted-foreground hover:text-destructive h-7 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">SUBSCRIBED EVENTS:</span>
              {(ep.events || []).map((ev) => (
                <Badge key={ev} variant="info" className="text-[9px] font-mono uppercase">
                  {ev}
                </Badge>
              ))}

              <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded-none border border-border">
                <span>SECRET: ••••••••••••</span>
                <button
                  onClick={() => handleCopySecret(ep.secret, ep.id)}
                  className="hover:text-primary"
                  title="Copy Signing Secret"
                >
                  {copiedId === ep.id ? (
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}

        {webhooks.length === 0 && (
          <Card className="p-8 text-center bg-card/50 border border-border text-muted-foreground/60 text-xs uppercase">
            NO OUTBOUND WEBHOOKS CONFIGURED YET. REGISTER A DESTINATION ENDPOINT ABOVE.
          </Card>
        )}
      </div>

      {/* Deliveries Audit Stream */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              DELIVERY RECEIPTS &amp; DISPATCHES
            </h3>
            <span className="text-[9px] text-muted-foreground uppercase font-mono">LIVE AUTO-REFRESH (5S)</span>
          </div>

          {/* Delivery Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-2.5" />
              <input
                type="text"
                value={deliverySearch}
                onChange={(e) => {
                  setDeliverySearch(e.target.value);
                  setPage(1);
                }}
                placeholder="SEARCH EVENT, PAYLOAD..."
                className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground/60" />
              <select
                value={deliveryStatusFilter}
                onChange={(e) => {
                  setDeliveryStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="bg-background border border-border text-xs text-foreground rounded-none px-2 py-1 focus:outline-none focus:border-primary uppercase font-mono"
              >
                <option value="all">ALL DELIVERIES</option>
                <option value="success">SUCCESS ONLY</option>
                <option value="failed">FAILED / ERRORS</option>
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
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground uppercase flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                RESET
              </Button>
            )}
          </div>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground/80 font-mono">
              <thead className="bg-background text-muted-foreground uppercase font-bold text-[10px] border-b border-border">
                <tr>
                  <th className="px-3 py-2.5">EVENT TYPE</th>
                  <th className="px-3 py-2.5">STATUS</th>
                  <th className="px-3 py-2.5">PAYLOAD SUMMARY</th>
                  <th className="px-3 py-2.5">RESPONSE</th>
                  <th className="px-3 py-2.5 text-right">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-background transition-none">
                    <td className="px-3 py-2 font-mono text-primary font-bold uppercase text-[11px]">
                      {d.event_type}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={d.success ? 'success' : 'danger'} className="text-[9px] uppercase">
                        {d.response_status ? `HTTP ${d.response_status}` : 'ERR'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground truncate max-w-xs text-[10px]">
                      {JSON.stringify(d.payload?.data || d.payload || {})}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground truncate max-w-xs text-[10px]">
                      {d.response_body || (d.success ? 'Delivered successfully' : 'No response')}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground/60 text-[10px]">
                      {d.created_at ? new Date(d.created_at).toLocaleTimeString() : 'RECENT'}
                    </td>
                  </tr>
                ))}
                {paginatedDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground/60 uppercase">
                      {hasActiveFilters
                        ? 'NO WEBHOOK DELIVERIES MATCH THE FILTER CRITERIA.'
                        : 'NO WEBHOOK DELIVERIES DISPATCHED YET.'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm font-mono">
          <div className="w-full max-w-lg bg-card border border-border rounded-none shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Globe className="w-4 h-4 text-primary" />
                REGISTER WEBHOOK ENDPOINT
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 font-mono">
              <div>
                <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                  DESTINATION URL (HTTPS RECOMMENDED)
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/crm-events"
                  className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                  DESCRIPTION / SERVICE NAME
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.G. ZAPIER LEAD NOTIFICATION PIPELINE"
                  className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                  EVENT SUBSCRIPTIONS
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-2 bg-background rounded-none border border-border">
                  <label className="flex items-center gap-2 text-xs text-foreground/80 p-1.5 rounded-none hover:bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes('*')}
                      onChange={() => handleToggleEvent('*')}
                      className="rounded-none border-border text-primary accent-primary"
                    />
                    <span className="font-mono text-primary font-bold text-[11px]">* (ALL EVENTS)</span>
                  </label>
                  {AVAILABLE_EVENTS.map((ev) => (
                    <label
                      key={ev}
                      className="flex items-center gap-2 text-xs text-foreground/80 p-1.5 rounded-none hover:bg-card cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev)}
                        onChange={() => handleToggleEvent(ev)}
                        disabled={selectedEvents.includes('*')}
                        className="rounded-none border-border text-primary accent-primary"
                      />
                      <span className="font-mono text-[11px] uppercase">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={createMutation.isPending} className="text-xs uppercase font-bold">
                  {createMutation.isPending ? 'REGISTERING...' : 'REGISTER ENDPOINT'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
