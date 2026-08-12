import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Brain, ExternalLink, Loader2 } from 'lucide-react';
import { getRegulations, searchRegulations } from '../services/api';

const sourceColors: Record<string, string> = {
  NAAC: 'badge-blue',
  AICTE: 'badge-medium',
  UGC: 'badge-low',
  NIRF: 'badge-gray',
};

const SAMPLE_QUERIES = [
  'barrier-free access ramp disability',
  'fire extinguisher certificate safety',
  'student faculty ratio AISHE',
  'laboratory infrastructure AICTE',
  'library books reading resources',
];

const RegulationsPage: React.FC = () => {
  const [regulations, setRegulations] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    getRegulations().then(r => { setRegulations(r); setLoading(false); });
  }, []);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const res = await searchRegulations(q);
      setResults(res);
    } finally {
      setSearching(false);
    }
  };

  const displayed = searched ? results : regulations;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="section-title text-2xl">Regulation Intelligence</h1>
            <div className="ai-label"><Brain size={12} />RAG Search</div>
          </div>
          <p className="section-subtitle">Search NAAC, AICTE, UGC, and NIRF regulatory references</p>
        </div>
      </div>

      {/* Search box */}
      <div className="card p-5 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-9"
              placeholder='Try: "What regulation applies to barrier-free access?"'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={searching}
            className="btn btn-primary"
          >
            {searching ? <Loader2 size={16} className="animate-spin-slow" /> : <Search size={16} />}
            Search
          </button>
          {searched && (
            <button
              onClick={() => { setSearched(false); setResults([]); setQuery(''); }}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sample queries */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 mr-1">Try:</span>
          {SAMPLE_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => { setQuery(q); handleSearch(q); }}
              className="badge badge-gray text-xs cursor-pointer hover:badge-blue transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* AI RAG disclaimer */}
      <div className="disclaimer mb-5">
        ⚠️ <strong>Demo reference only.</strong> Regulatory text shown is for demonstration purposes.
        Always verify against the applicable current official NAAC/AICTE/UGC/NIRF manual.
        In a real deployment, this would use a RAG system with sentence-transformers and a vector database indexed from official regulatory documents.
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={20} className="text-slate-400 animate-spin-slow" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayed.map(reg => (
            <div key={reg.id} className="card p-5 animate-fade-in">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${sourceColors[reg.source] || 'badge-gray'}`}>{reg.source}</span>
                  {reg.relevance_score && (
                    <span className="badge badge-blue text-xs">
                      Relevance: {Math.round(reg.relevance_score * 100)}%
                    </span>
                  )}
                </div>
                <BookOpen size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
              </div>

              <div className="text-xs text-slate-400 mb-1 font-medium">{reg.section}</div>
              <h3 className="font-bold text-slate-900 text-base mb-3">{reg.title}</h3>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                <p className="text-sm text-slate-700 leading-relaxed">{reg.excerpt}</p>
              </div>

              <div className="text-xs text-slate-500 italic mb-3">{reg.document}</div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {JSON.parse(reg.tags || '[]').slice(0, 5).map((tag: string) => (
                  <span key={tag} className="badge badge-gray text-xs">{tag}</span>
                ))}
              </div>
            </div>
          ))}

          {searched && results.length === 0 && !searching && (
            <div className="col-span-2 card p-12 text-center">
              <Search size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No regulations found matching your query</p>
              <p className="text-slate-400 text-sm mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegulationsPage;
