import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { search, type SearchResults } from '../../services/searchService';

// The search-first header (CLAUDE.md 4.3): find a run, test or failure
// signature from one wide bar at the top of the app.
export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      search(query.trim())
        .then((r) => {
          setResults(r);
          setIsOpen(true);
        })
        .catch(() => setResults(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const go = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults =
    results && (results.runs.length > 0 || results.test_cases.length > 0 || results.failure_groups.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-iv-text-2"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setIsOpen(true)}
        placeholder="Search runs, tests, failure signatures..."
        aria-label="Search runs, tests, failure signatures"
        className="w-full rounded-full border border-iv-border bg-white py-2 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-iv-blue focus:ring-2 focus:ring-iv-blue/20"
      />

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-auto rounded-md border border-iv-border bg-white shadow-sm">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-muted">No matches.</p>
          ) : (
            <>
              {results!.runs.length > 0 && (
                <div>
                  <p className="px-4 pt-3 text-xs font-medium uppercase text-muted">Runs</p>
                  {results!.runs.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => go(`/runs/${r.id}`)}
                      className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-iv-blue-50"
                    >
                      {r.external_run_id}
                    </button>
                  ))}
                </div>
              )}
              {results!.test_cases.length > 0 && (
                <div>
                  <p className="px-4 pt-3 text-xs font-medium uppercase text-muted">Tests</p>
                  {results!.test_cases.map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => go(`/runs/${tc.run_id}/tests/${tc.id}`)}
                      className="block w-full px-4 py-2 text-left text-sm text-ink hover:bg-iv-blue-50"
                    >
                      {tc.name}
                    </button>
                  ))}
                </div>
              )}
              {results!.failure_groups.length > 0 && (
                <div>
                  <p className="px-4 pt-3 text-xs font-medium uppercase text-muted">Failure signatures</p>
                  {results!.failure_groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => go('/groups')}
                      className="block w-full px-4 py-2 pb-3 text-left text-sm text-ink hover:bg-iv-blue-50"
                    >
                      {g.title}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
