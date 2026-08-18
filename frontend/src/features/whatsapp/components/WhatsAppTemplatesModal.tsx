import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  FileText,
  Upload,
  CheckCircle2,
  RefreshCw,
  X,
  Paperclip,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface WhatsAppTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: any) => void;
}

export function WhatsAppTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: WhatsAppTemplatesModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'templates' | 'media'>('templates');
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('document');
  const [filename, setFilename] = useState('Enterprise_Proposal_2026.pdf');

  const { data: templates, isLoading, isRefetching } = useQuery({
    queryKey: ['whatsapp-meta-templates'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/whatsapp/templates');
      return data;
    },
    enabled: isOpen,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/whatsapp/templates/sync');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-meta-templates'] });
    },
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/whatsapp/media/upload', {
        media_type: mediaType,
        filename: filename,
        file_size_bytes: 1048576,
      });
      return data;
    },
    onSuccess: (data) => {
      setUploadedMediaId(data.media_id);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Meta WhatsApp Cloud API Connector Studio</h3>
                <Badge variant="success" className="text-[10px] font-mono">
                  Cloud API v20.0
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Pre-approved Business Manager broadcast templates and media message uploads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || isRefetching}
              className="border-slate-800 bg-slate-900/80 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Sync Meta Templates</span>
            </Button>

            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/60 pb-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pre-Approved Templates ({templates?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'media'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Meta Media Uploads</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'templates' ? (
            isLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl: any) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="success" className="text-[9px] font-mono py-0">
                          {tpl.status}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-mono capitalize">
                          {tpl.category.toLowerCase()} • {tpl.language}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white font-mono">{tpl.name}</h4>
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-sans">
                        {tpl.body_text}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {tpl.variables?.map((v: string) => (
                          <span
                            key={v}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-emerald-400 font-mono border border-slate-800"
                          >
                            {v}
                          </span>
                        ))}
                      </div>

                      {onSelectTemplate && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onSelectTemplate(tpl);
                            onClose();
                          }}
                          className="h-7 text-xs text-emerald-400 hover:bg-emerald-950/40"
                        >
                          Use Template
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No templates synced yet. Click &quot;Sync Meta Templates&quot; above.
              </div>
            )
          ) : (
            <div className="max-w-md mx-auto space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload Media to Meta Cloud Storage
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="document">PDF / Document File</option>
                    <option value="image">Image (JPEG / PNG)</option>
                    <option value="audio">Voice Audio Note (AAC / MP3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Filename / Asset Name</label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <Button
                  size="sm"
                  variant="orange"
                  onClick={() => uploadMediaMutation.mutate()}
                  disabled={uploadMediaMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl"
                >
                  {uploadMediaMutation.isPending ? 'Uploading to Meta Cloud...' : 'Upload & Generate Media ID'}
                </Button>

                {uploadedMediaId && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold block flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Uploaded Successfully
                    </span>
                    <span className="text-slate-300 font-mono text-[11px] block">
                      Meta Media ID: <span className="text-white">{uploadedMediaId}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
