import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
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
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-4xl bg-card border border-border rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-background border border-primary/50 text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">WHATSAPP CLOUD API STUDIO</h3>
                <Badge variant="success" className="text-[8px] font-mono">
                  CLOUD API V20.0
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase">
                PRE-APPROVED BROADCAST TEMPLATES AND MEDIA UPLOADS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending || isRefetching}
              className="text-xs h-7"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span>SYNC META</span>
            </Button>

            <button onClick={onClose} className="p-1 rounded-none text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border bg-background px-4 font-mono">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-2 text-xs font-mono font-bold uppercase transition-none border-b-2 ${activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            APPROVED TEMPLATES ({templates?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 py-2 text-xs font-mono font-bold uppercase transition-none border-b-2 ${activeTab === 'media'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            MEDIA UPLOAD &amp; ASSETS
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 font-mono">
          {activeTab === 'templates' && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates?.map((tpl: any) => (
                    <div
                      key={tpl.id}
                      className="p-3.5 rounded-none bg-background border border-border hover:border-primary transition-none space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground uppercase">{tpl.name}</h4>
                          <Badge variant="success" className="text-[8px]">
                            {tpl.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground uppercase">
                          <span>LANG: {tpl.language}</span>
                          <span>•</span>
                          <span>CAT: {tpl.category}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap">
                          {tpl.body_text}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            if (onSelectTemplate) onSelectTemplate(tpl);
                            onClose();
                          }}
                          className="text-xs h-6 px-2"
                        >
                          USE TEMPLATE
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="max-w-lg mx-auto space-y-4 py-4 font-mono">
              <div className="p-4 rounded-none bg-background border border-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>UPLOAD OUTBOUND MEDIA ATTACHMENT</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-foreground font-bold uppercase mb-1">MEDIA TYPE</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-none bg-card border border-border text-foreground text-xs font-mono"
                    >
                      <option value="document">PDF DOCUMENT</option>
                      <option value="image">PNG / JPEG IMAGE</option>
                      <option value="audio">VOICE / AUDIO CLIP</option>
                      <option value="video">MP4 VIDEO BRIEFING</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-foreground font-bold uppercase mb-1">FILENAME</label>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-none bg-card border border-border text-foreground text-xs font-mono uppercase"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => uploadMediaMutation.mutate()}
                    disabled={uploadMediaMutation.isPending}
                    className="w-full text-xs h-8"
                  >
                    <Paperclip className="w-3.5 h-3.5 mr-1" />
                    <span>{uploadMediaMutation.isPending ? 'UPLOADING...' : 'GENERATE MEDIA ID'}</span>
                  </Button>
                </div>
              </div>

              {uploadedMediaId && (
                <div className="p-3 bg-background border border-primary text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>MEDIA ATTACHMENT READY</span>
                  </div>
                  <p className="text-[10px] text-foreground">MEDIA ID: {uploadedMediaId}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
