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
    <div className="space-y-4 font-mono">
      {/* 1-Click Exporters */}
      <div className="space-y-3">
        <div className="p-4 rounded-none bg-card border border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <Download className="w-4 h-4 text-primary" />
            1-CLICK DATA EXPORTERS
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
            EXPORT CRM RECORDS AND COMPLIANCE AUDIT TRAILS DIRECTLY INTO CSV FORMAT WITH SANITIZED OUTPUT.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-card border-border p-4 space-y-3 hover:border-primary transition-none flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                ALL CONTACTS &amp; LEADS
              </div>
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed">
                FULL DIRECTORY OF ENRICHED CONTACTS, LEAD SCORES, AND STATUS TAGS.
              </p>
            </div>
            <Button
              onClick={() => handleDownload('/api/import-export/export/leads', 'crm_leads_export.csv')}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1.5 text-xs h-7 uppercase font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD LEADS CSV
            </Button>
          </Card>

          <Card className="bg-card border-border p-4 space-y-3 hover:border-primary transition-none flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                ACTIVE DEALS PIPELINE
              </div>
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed">
                DEAL VALUATIONS, PIPELINE STAGES, HEALTH SCORES, AND CLOSE PROBABILITIES.
              </p>
            </div>
            <Button
              onClick={() => handleDownload('/api/import-export/export/deals', 'crm_deals_export.csv')}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1.5 text-xs h-7 uppercase font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD DEALS CSV
            </Button>
          </Card>

          <Card className="bg-card border-border p-4 space-y-3 hover:border-primary transition-none flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                COMPLIANCE AUDIT TRAIL
              </div>
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed">
                GDPR &amp; SOC2 COMPLIANCE LOGS WITH ACTORS, TIMESTAMPS, AND IP ADDRESSES.
              </p>
            </div>
            <Button
              onClick={() => handleDownload('/api/import-export/export/audit-logs', 'compliance_audit_logs.csv')}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1.5 text-xs h-7 uppercase font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD AUDIT CSV
            </Button>
          </Card>
        </div>
      </div>

      {/* CSV Importer */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="p-4 rounded-none bg-card border border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <Upload className="w-4 h-4 text-primary" />
            BULK CSV INGESTION STUDIO
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
            IMPORT LEGACY DATA FROM SALESFORCE, HUBSPOT, OR SPREADSHEETS WITH COLUMN MATCHING.
          </p>
        </div>

        <form onSubmit={handleImport} className="p-4 rounded-none bg-card border border-border space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold text-foreground/80 uppercase tracking-wider">TARGET ENTITY:</label>
            <div className="flex items-center gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => setImportType('leads')}
                className={`px-3 py-1 rounded-none text-xs font-bold uppercase transition-none ${importType === 'leads'
                    ? 'bg-primary text-primary-foreground border border-primary'
                    : 'bg-background text-muted-foreground border border-border hover:text-foreground'
                  }`}
              >
                CONTACTS &amp; LEADS
              </button>
              <button
                type="button"
                onClick={() => setImportType('deals')}
                className={`px-3 py-1 rounded-none text-xs font-bold uppercase transition-none ${importType === 'deals'
                    ? 'bg-primary text-primary-foreground border border-primary'
                    : 'bg-background text-muted-foreground border border-border hover:text-foreground'
                  }`}
              >
                SALES DEALS
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase">
              <span>PASTE CSV CONTENT OR USE SAMPLE:</span>
              <button
                type="button"
                onClick={() => setCsvInput(SAMPLE_LEADS_CSV)}
                className="text-primary hover:underline flex items-center gap-1 font-bold"
              >
                <Sparkles className="w-3 h-3" />
                RESET SAMPLE DATA
              </button>
            </div>
            <textarea
              rows={7}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full font-mono text-xs bg-background border border-border rounded-none p-3 text-foreground focus:outline-none focus:border-primary"
              placeholder="PASTE RAW CSV WITH HEADER ROW HERE..."
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={importLeadsMutation.isPending || importDealsMutation.isPending}
              className="flex items-center gap-2 text-xs uppercase font-bold h-8 px-4"
            >
              <Upload className="w-3.5 h-3.5 text-primary-foreground" />
              {importLeadsMutation.isPending || importDealsMutation.isPending
                ? 'PROCESSING INGESTION...'
                : `RUN BULK INGESTION (${importType.toUpperCase()})`}
            </Button>
          </div>
        </form>

        {importResult && (
          <Card className="bg-background border border-primary p-3.5 space-y-2 animate-in fade-in font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase">
              {importResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              IMPORT COMPLETED: {importResult.created_count} CREATED, {importResult.updated_count || 0} UPDATED.
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-0.5 text-[10px] text-destructive pt-2 border-t border-border uppercase font-mono">
                <span className="font-bold">IMPORT WARNINGS:</span>
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
