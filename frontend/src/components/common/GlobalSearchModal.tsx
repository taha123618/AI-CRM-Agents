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
        return <PhoneCall className="w-4 h-4 text-emerald-400" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-[#FF2A54]" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-400" />;
      case 'deal':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="w-full max-w-2xl bg-[#1A1F26] border border-[#252b36] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header & Mode Switcher */}
        <div className="p-4 border-b border-[#252b36] flex items-center justify-between bg-[#1A1F26] gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#0D0D0D] rounded-none border border-[#252b36]">
            <button
              onClick={() => setMode('search')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-mono font-semibold transition-none cursor-pointer ${
                mode === 'search'
                  ? 'bg-[#FF2A54] text-white shadow-[0_0_12px_rgba(255,42,84,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Semantic Search</span>
            </button>

            <button
              onClick={() => setMode('rag')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-mono font-semibold transition-none cursor-pointer ${
                mode === 'rag'
                  ? 'bg-[#FF2A54] text-white shadow-[0_0_12px_rgba(255,42,84,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask CRM AI (RAG)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-[#0D0D0D] border border-[#252b36] rounded-none">
              ESC to close
            </kbd>
            <button
              onClick={() => setGlobalSearchOpen(false)}
              className="p-1 rounded-none text-slate-400 hover:text-white hover:bg-[#252b36] transition-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={mode === 'rag' ? handleRagAsk : (e) => e.preventDefault()}
          className="relative flex items-center px-4 py-3 border-b border-[#252b36] bg-[#0D0D0D]"
        >
          {mode === 'search' ? (
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          ) : (
            <Bot className="w-5 h-5 text-[#FF2A54] shrink-0 mr-3 animate-pulse" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'search'
                ? 'Search transcripts, meetings, emails, deals by keyword or meaning...'
                : 'Ask CRM AI any question (e.g. "What objections were raised on recent calls?")...'
            }
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono text-xs"
          />

          {isLoading && <LoadingSpinner size="sm" className="ml-2" />}

          {mode === 'rag' && query.trim() && !isLoading && (
            <Button type="submit" size="sm" variant="primary" className="ml-2 text-xs h-7 px-3 shrink-0 rounded-none font-mono">
              Ask AI
            </Button>
          )}
        </form>

        {/* Entity Filter Chips (Semantic Search Mode) */}
        {mode === 'search' && (
          <div className="px-4 py-2 border-b border-[#252b36] bg-[#1A1F26] flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-[11px] text-slate-500 mr-1 uppercase">Filter:</span>
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'voice_call', label: 'Voice Calls' },
              { id: 'meeting', label: 'Meetings' },
              { id: 'email', label: 'Emails' },
              { id: 'deal', label: 'Deals' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEntityFilter(f.id)}
                className={`px-2.5 py-1 rounded-none text-[11px] font-mono transition-none cursor-pointer ${
                  entityFilter === f.id
                    ? 'bg-[#0D0D0D] text-[#FF2A54] border border-[#FF2A54]/50'
                    : 'text-slate-400 hover:text-white hover:bg-[#0D0D0D]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {error && (
            <div className="p-3 rounded-none bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-mono">
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
                      className="p-3.5 rounded-none bg-[#0D0D0D] border border-[#252b36] hover:border-[#FF2A54]/50 transition-none cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {getEntityIcon(res.entity_type)}
                          <span className="text-xs font-bold text-white group-hover:text-[#FF2A54] transition-none font-mono">
                            {res.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400">
                            {scorePercent}% match
                          </span>
                          <Badge variant="default" className="text-[9px] uppercase font-mono py-0">
                            {res.entity_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                        {res.snippet}
                      </p>

                      <div className="mt-2 flex items-center justify-end text-[11px] text-[#FF2A54] font-mono font-medium opacity-0 group-hover:opacity-100 transition-none">
                        <span>Open Record</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  );
                })
              ) : query.trim().length >= 2 && !isLoading ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  No semantic knowledge matched &quot;{query}&quot;. Try broadening your terms.
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs space-y-1">
                  <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-mono">Type a search query to activate dense vector similarity search.</p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    Scans sales transcripts, meeting notes, email threads, and pipeline deals.
                  </p>
                </div>
              )}
            </>
          )}

          {/* RAG Q&A RESPONSE */}
          {mode === 'rag' && (
            <>
              {ragResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-none bg-[#0D0D0D] border border-[#252b36] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FF2A54] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-[#FF2A54]" />
                        AI Synthesized CRM Answer
                      </span>
                      <Badge variant="purple" className="text-[10px] font-mono">
                        {Math.round(ragResult.confidence * 100)}% Confidence
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                      {ragResult.answer}
                    </p>
                  </div>

                  {/* Sources & Citations */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Retrieved Grounding Sources ({ragResult.sources.length})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ragResult.sources.map((src) => (
                        <div
                          key={src.id}
                          onClick={() => handleNavigate(src.entity_type)}
                          className="p-2.5 rounded-none bg-[#0D0D0D] border border-[#252b36] hover:border-[#FF2A54]/50 transition-none cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-5 h-5 rounded-none bg-[#1A1F26] border border-[#252b36] flex items-center justify-center text-[10px] font-mono text-[#FF2A54] shrink-0">
                              {src.source_index}
                            </span>
                            <span className="text-xs text-slate-300 truncate font-mono">{src.title}</span>
                          </div>
                          <Badge variant="info" className="text-[9px] uppercase font-mono py-0 shrink-0">
                            {src.entity_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                  <Bot className="w-8 h-8 mx-auto text-[#FF2A54] mb-2" />
                  <p className="text-slate-300 font-semibold font-mono uppercase">Ask any natural language question across your CRM</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-sans">
                    The RAG engine retrieves relevant vector embeddings and synthesizes a grounded answer with citations.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-[#0D0D0D] border-t border-[#252b36] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Powered by Dense Vector &amp; RAG Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Pgvector / High-Dimensional Embeddings</span>
          </div>
        </div>
      </div>
    </div>
  );
}

