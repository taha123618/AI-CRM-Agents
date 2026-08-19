import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  PhoneCall,
  Calendar,
  Mail,
  Briefcase,
  Layers,
  ArrowRight,
  X,
  FileText,
  Bot,
} from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';
import { settingsApi } from '@/features/settings/api';
import { SemanticSearchResult, RagAnswerResponse } from '@/features/settings/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function GlobalSearchModal() {
  const navigate = useNavigate();
  const { isGlobalSearchOpen, setGlobalSearchOpen, setActivePage } = useUIStore();
  const [mode, setMode] = useState<'search' | 'rag'>('search');
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [ragResult, setRagResult] = useState<RagAnswerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setGlobalSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isGlobalSearchOpen]);

  // Auto-search debounce for semantic search
  useEffect(() => {
    if (mode !== 'search' || query.trim().length < 2) {
      if (query.trim().length === 0) setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await settingsApi.searchSemantic({
          query: query.trim(),
          entity_filter: entityFilter,
          top_k: 6,
        });
        setResults(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to execute semantic vector search.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, entityFilter, mode]);

  // Execute RAG Question
  const handleRagAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsApi.askRag({
        question: query.trim(),
        top_k: 4,
      });
      setRagResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to synthesize RAG answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (type: string) => {
    setGlobalSearchOpen(false);
    switch (type) {
      case 'voice_call':
        setActivePage('voice-ai');
        navigate('/voice-ai');
        break;
      case 'meeting':
        setActivePage('meetings');
        navigate('/meetings');
        break;
      case 'email':
        setActivePage('emails');
        navigate('/emails');
        break;
      case 'deal':
        setActivePage('deals');
        navigate('/deals');
        break;
      default:
        setActivePage('dashboard');
        navigate('/dashboard');
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'voice_call':
        return <PhoneCall className="w-3.5 h-3.5 text-[#39FF14]" />;
      case 'meeting':
        return <Calendar className="w-3.5 h-3.5 text-cyan-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      case 'deal':
        return <Briefcase className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-start justify-center pt-16 sm:pt-20 p-4 font-mono">
      <div className="w-full max-w-2xl bg-[#1F2833] border border-[#3A4552] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header & Mode Switcher */}
        <div className="p-3 border-b border-[#3A4552] flex items-center justify-between bg-[#0B0C10] gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#1F2833] rounded-none border border-[#3A4552]">
            <button
              onClick={() => setMode('search')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-mono font-bold uppercase transition-none ${
                mode === 'search'
                  ? 'bg-[#39FF14] text-[#0B0C10]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>SEMANTIC SEARCH</span>
            </button>

            <button
              onClick={() => setMode('rag')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-mono font-bold uppercase transition-none ${
                mode === 'rag'
                  ? 'bg-[#39FF14] text-[#0B0C10]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>ASK CRM AI (RAG)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-[#0B0C10] border border-[#3A4552] rounded-none">
              ESC TO CLOSE
            </kbd>
            <button
              onClick={() => setGlobalSearchOpen(false)}
              className="p-1 rounded-none text-slate-400 hover:text-white hover:bg-[#0B0C10]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={mode === 'rag' ? handleRagAsk : (e) => e.preventDefault()}
          className="relative flex items-center px-3.5 py-2.5 border-b border-[#3A4552] bg-[#0B0C10]"
        >
          {mode === 'search' ? (
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          ) : (
            <Bot className="w-4 h-4 text-[#39FF14] shrink-0 mr-2.5" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'search'
                ? 'SEARCH TRANSCRIPTS, EMAILS, MEETINGS, DEALS...'
                : 'ASK CRM AI ANY QUERY...'
            }
            className="w-full bg-transparent text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none uppercase"
          />

          {isLoading && <LoadingSpinner size="sm" className="ml-2" />}

          {mode === 'rag' && query.trim() && !isLoading && (
            <Button type="submit" size="sm" variant="primary" className="ml-2 text-xs h-6 px-2.5 shrink-0">
              ASK
            </Button>
          )}
        </form>

        {/* Entity Filter Chips (Semantic Search Mode) */}
        {mode === 'search' && (
          <div className="px-3 py-1.5 border-b border-[#3A4552] bg-[#0B0C10] flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-[9px] text-slate-500 font-mono mr-1 uppercase">FILTER:</span>
            {[
              { id: 'all', label: 'ALL SOURCES' },
              { id: 'voice_call', label: 'VOICE CALLS' },
              { id: 'meeting', label: 'MEETINGS' },
              { id: 'email', label: 'EMAILS' },
              { id: 'deal', label: 'DEALS' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEntityFilter(f.id)}
                className={`px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase transition-none ${
                  entityFilter === f.id
                    ? 'bg-[#1F2833] text-[#39FF14] border border-[#39FF14]'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[220px] font-mono">
          {error && (
            <div className="p-2.5 rounded-none bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs font-mono">
              {error}
            </div>
          )}

          {/* SEMANTIC SEARCH RESULTS */}
          {mode === 'search' && (
            <>
              {results.length > 0 ? (
                results.map((res) => {
                  const scorePercent = Math.round(res.similarity_score * 100);
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleNavigate(res.entity_type)}
                      className="p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] hover:border-[#39FF14] hover:bg-[#161D26] transition-none cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {getEntityIcon(res.entity_type)}
                          <span className="text-xs font-bold font-mono text-white group-hover:text-[#39FF14] uppercase">
                            {res.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-[#39FF14]">
                            {scorePercent}% MATCH
                          </span>
                          <Badge variant="default" className="text-[8px] uppercase font-mono py-0">
                            {res.entity_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-mono">
                        {res.snippet}
                      </p>

                      <div className="mt-1.5 flex items-center justify-end text-[10px] text-[#39FF14] font-bold opacity-0 group-hover:opacity-100 transition-none uppercase">
                        <span>OPEN RECORD</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  );
                })
              ) : query.trim().length >= 2 && !isLoading ? (
                <div className="text-center py-10 text-slate-500 text-xs font-mono uppercase">
                  NO SEMANTIC KNOWLEDGE MATCHED &quot;{query}&quot;.
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs space-y-1 font-mono uppercase">
                  <Layers className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                  <p>INPUT QUERY FOR DENSE VECTOR SIMILARITY SEARCH.</p>
                  <p className="text-[9px] text-slate-600 font-mono">
                    SCANS TRANSCRIPTS, MEETING NOTES, EMAIL THREADS, PIPELINES.
                  </p>
                </div>
              )}
            </>
          )}

          {/* RAG Q&A RESPONSE */}
          {mode === 'rag' && (
            <>
              {ragResult ? (
                <div className="space-y-3 font-mono">
                  <div className="p-3 rounded-none bg-[#0B0C10] border border-[#39FF14]/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#39FF14] flex items-center gap-1.5 uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI SYNTHESIZED CRM ANSWER
                      </span>
                      <Badge variant="success" className="text-[9px] font-mono">
                        {Math.round(ragResult.confidence * 100)}% CONFIDENCE
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      {ragResult.answer}
                    </p>
                  </div>

                  {/* Sources & Citations */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      RETRIEVED GROUNDING SOURCES ({ragResult.sources.length})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ragResult.sources.map((src) => (
                        <div
                          key={src.id}
                          onClick={() => handleNavigate(src.entity_type)}
                          className="p-2 rounded-none bg-[#0B0C10] border border-[#3A4552] hover:border-[#39FF14] transition-none cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-4 h-4 rounded-none bg-[#1F2833] flex items-center justify-center text-[9px] font-mono text-[#39FF14] shrink-0">
                              {src.source_index}
                            </span>
                            <span className="text-xs text-slate-300 truncate font-mono uppercase">{src.title}</span>
                          </div>
                          <Badge variant="info" className="text-[8px] uppercase font-mono py-0 shrink-0">
                            {src.entity_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs space-y-1 font-mono uppercase">
                  <Bot className="w-6 h-6 mx-auto text-[#39FF14] mb-1" />
                  <p className="text-slate-300 font-bold">ASK NATURAL LANGUAGE CRM QUESTIONS</p>
                  <p className="text-[9px] text-slate-500 max-w-sm mx-auto">
                    RETRIEVES VECTOR EMBEDDINGS AND SYNTHESIZES GROUNDED RESPONSES.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-3 py-2 bg-[#0B0C10] border-t border-[#3A4552] flex items-center justify-between text-[9px] text-slate-500 font-mono uppercase">
          <div>DENSE VECTOR &amp; RAG ENGINE</div>
          <div>PGVECTOR / HIGH-DIMENSIONAL EMBEDDINGS</div>
        </div>
      </div>
    </div>
  );
}
