import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Search, UserCheck, Filter, RotateCcw } from 'lucide-react';
import { settingsApi } from '../api';
import { AuditLogEntry } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TablePagination } from './TablePagination';

export function AuditTrailTab() {
  const [filterQuery, setFilterQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: logs = [], isLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['compliance-audit-logs'],
    queryFn: settingsApi.getAuditLogs,
    refetchInterval: 5000,
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('register')) return 'success';
    if (action.includes('delete') || action.includes('suspend')) return 'danger';
    if (action.includes('update') || action.includes('role')) return 'warning';
    return 'info';
  };

  // Distinct Entity Types
  const availableEntityTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.entity_type).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  // Filtered & Paginated Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = filterQuery.toLowerCase();
      const matchesSearch =
        !filterQuery.trim() ||
        log.entity_type.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        (log.entity_id && log.entity_id.toLowerCase().includes(q)) ||
        (log.ip_address && log.ip_address.toLowerCase().includes(q));

      const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
      const matchesAction =
        actionFilter === 'all' ||
        (actionFilter === 'write' && (log.action.includes('create') || log.action.includes('update') || log.action.includes('delete'))) ||
        (actionFilter === 'auth' && (log.action.includes('login') || log.action.includes('logout') || log.action.includes('sso') || log.action.includes('register')));

      return matchesSearch && matchesEntity && matchesAction;
    });
  }, [logs, filterQuery, entityFilter, actionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  const hasActiveFilters = filterQuery !== '' || entityFilter !== 'all' || actionFilter !== 'all';

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
            <History className="w-5 h-5 text-brand-400" />
            Compliance Audit Trail & Forensic Ledger
          </h2>
          <p className="text-sm text-slate-400">
            Immutable write-ahead audit entries capturing actor IDs, IP addresses, entity mutations, and authentication events.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="glass-card border border-slate-800/80 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => {
                  setFilterQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search entity, actor, action, IP..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Entity Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 uppercase font-mono"
              >
                <option value="all">All Entities</option>
                {availableEntityTypes.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Actions</option>
              <option value="write">Mutations & Writes</option>
              <option value="auth">Auth & Session Events</option>
            </select>

            {/* Reset */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilterQuery('');
                  setEntityFilter('all');
                  setActionFilter('all');
                  setPage(1);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
            {filteredLogs.length} audit entries matched
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="glass-card border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Entity</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Details Summary</th>
                <th className="px-6 py-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-3.5 text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-brand-400 uppercase font-medium">
                      {log.entity_type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {log.actor}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-400 max-w-xs truncate">
                    {JSON.stringify(log.details || {})}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-500">
                    {log.ip_address || 'internal'}
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {hasActiveFilters
                      ? 'No compliance logs match the filter criteria.'
                      : 'No compliance logs registered yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Log Pagination */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredLogs.length}
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
  );
}
