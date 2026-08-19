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
    queryFn: () => settingsApi.getAuditLogs(),
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
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-none bg-[#121212] border border-[#3A4552]">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <History className="w-4 h-4 text-[#FFB800]" />
            COMPLIANCE AUDIT TRAIL &amp; FORENSIC LEDGER
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
            IMMUTABLE WRITE-AHEAD AUDIT ENTRIES CAPTURING ACTOR IDS, IP ADDRESSES, AND ENTITY MUTATIONS.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-[#121212] border-[#3A4552] p-3 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => {
                  setFilterQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="SEARCH ENTITY, ACTOR, ACTION, IP..."
                className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
              />
            </div>

            {/* Entity Filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#0B0C10] border border-[#3A4552] text-xs text-slate-200 rounded-none px-2 py-1 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
              >
                <option value="all">ALL ENTITIES</option>
                {availableEntityTypes.map((et) => (
                  <option key={et} value={et}>
                    {et.toUpperCase()}
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
              className="bg-[#0B0C10] border border-[#3A4552] text-xs text-slate-200 rounded-none px-2 py-1 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
            >
              <option value="all">ALL ACTIONS</option>
              <option value="write">MUTATIONS &amp; WRITES</option>
              <option value="auth">AUTH &amp; SESSION EVENTS</option>
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
                className="text-xs h-7 px-2 text-slate-400 hover:text-white uppercase flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                RESET
              </Button>
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-mono self-end sm:self-center uppercase">
            {filteredLogs.length} AUDIT ENTRIES MATCHED
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-[#121212] border-[#3A4552] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-[#0B0C10] text-slate-400 uppercase font-bold text-[10px] border-b border-[#3A4552]">
              <tr>
                <th className="px-3 py-2.5">TIMESTAMP</th>
                <th className="px-3 py-2.5">ENTITY</th>
                <th className="px-3 py-2.5">ACTION</th>
                <th className="px-3 py-2.5">ACTOR</th>
                <th className="px-3 py-2.5">DETAILS SUMMARY</th>
                <th className="px-3 py-2.5 text-right">IP ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4552]">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#0B0C10] transition-none">
                  <td className="px-3 py-2 text-slate-400 whitespace-nowrap text-[10px]">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-[#FFB800] uppercase font-bold text-[11px]">
                      {log.entity_type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={getActionBadgeVariant(log.action)} className="text-[9px] uppercase font-mono">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-bold text-white flex items-center gap-1.5 uppercase text-[11px]">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    {log.actor}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-400 max-w-xs truncate text-[10px]">
                    {JSON.stringify(log.details || {})}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500 text-[10px]">
                    {log.ip_address || 'internal'}
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 uppercase">
                    {hasActiveFilters
                      ? 'NO COMPLIANCE LOGS MATCH THE FILTER CRITERIA.'
                      : 'NO COMPLIANCE LOGS REGISTERED YET.'}
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
