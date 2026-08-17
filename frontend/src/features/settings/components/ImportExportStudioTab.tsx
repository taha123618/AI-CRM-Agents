import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { settingsApi } from '../api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const SAMPLE_LEADS_CSV = `Email,First Name,Last Name,Job Title,Lead Score
jordan.vance@techscale.io,Jordan,Vance,VP Engineering,94
elena.rostova@hypercloud.com,Elena,Rostova,Chief Architect,88
marcus.sterling@apexcapital.co,Marcus,Sterling,Managing Director,91`;

export function ImportExportStudioTab() {
  const [csvInput, setCsvInput] = useState(SAMPLE_LEADS_CSV);
  const [importType, setImportType] = useState<'leads' | 'deals'>('leads');
  const [importResult, setImportResult] = useState<{
    success: boolean;
    created_count: number;
    updated_count?: number;
    errors?: string[];
  } | null>(null);

  const importLeadsMutation = useMutation({
    mutationFn: settingsApi.importLeadsCsv,
    onSuccess: (data) => setImportResult(data),
  });

  const importDealsMutation = useMutation({
    mutationFn: settingsApi.importDealsCsv,
    onSuccess: (data) => setImportResult(data),
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;
    if (importType === 'leads') {
      importLeadsMutation.mutate(csvInput);
    } else {
      importDealsMutation.mutate(csvInput);
    }
  };

  const handleDownload = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* 1-Click Exporters */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-brand-400" />
            1-Click Data Exporters
          </h2>
          <p className="text-sm text-slate-400">
            Export CRM records and compliance audit trails directly into CSV format.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card border border-slate-800/80 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                All Contacts & Leads
              </div>
              <p className="text-xs text-slate-400">
                Full directory of enriched contacts, lead scores, and status tags.
              </p>
            </div>
            <Button
              onClick={() => handleDownload('/api/import-export/export/leads', 'crm_leads_export.csv')}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs border-slate-700 hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Download Leads CSV
            </Button>
          </Card>

          <Card className="glass-card border border-slate-800/80 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-orange-400" />
                Active Deals Pipeline
              </div>
              <p className="text-xs text-slate-400">
                Deal valuations, pipeline stages, health scores, and close probabilities.
              </p>
            </div>
            <Button
              onClick={() => handleDownload('/api/import-export/export/deals', 'crm_deals_export.csv')}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs border-slate-700 hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Download Deals CSV
            </Button>
          </Card>

          <Card className="glass-card border border-slate-800/80 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                Compliance Audit Trail
              </div>
              <p className="text-xs text-slate-400">
                GDPR & SOC2 compliance logs with actors, timestamps, and IP addresses.
              </p>
            </div>
            <Button
              onClick={() => handleDownload('/api/import-export/export/audit-logs', 'compliance_audit_logs.csv')}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs border-slate-700 hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit CSV
            </Button>
          </Card>
        </div>
      </div>

      {/* CSV Importer */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-400" />
            Bulk CSV Ingestion Studio
          </h2>
          <p className="text-sm text-slate-400">
            Import legacy data from Salesforce, HubSpot, or spreadsheets with case-insensitive column matching.
          </p>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-slate-300">Target Entity:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportType('leads')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  importType === 'leads'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Contacts & Leads
              </button>
              <button
                type="button"
                onClick={() => setImportType('deals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  importType === 'deals'
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Sales Deals
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Paste CSV Content or Template:</span>
              <button
                type="button"
                onClick={() => setCsvInput(SAMPLE_LEADS_CSV)}
                className="text-brand-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Reset Sample Data
              </button>
            </div>
            <textarea
              rows={7}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-brand-500"
              placeholder="Paste raw CSV with header row here..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              disabled={importLeadsMutation.isPending || importDealsMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-brand-500/20"
            >
              <Upload className="w-4 h-4" />
              {importLeadsMutation.isPending || importDealsMutation.isPending
                ? 'Processing Import...'
                : `Run Bulk Import (${importType.toUpperCase()})`}
            </Button>
          </div>
        </form>

        {importResult && (
          <Card className="glass-card border border-slate-800/80 p-4 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {importResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              Import Completed: {importResult.created_count} records created, {importResult.updated_count || 0} updated.
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-1 text-xs text-rose-400 pt-2 border-t border-slate-800">
                <span className="font-semibold">Import Warnings:</span>
                {importResult.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
