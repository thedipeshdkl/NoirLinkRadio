import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSearch } from '../api';
import { Input } from '../components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2
  });

  return (
    <div className="container py-12 space-y-8 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold text-center">Global Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search news, programs, presenters, podcasts..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-lg rounded-full"
            autoFocus
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12">
        {isLoading && debouncedQuery.length >= 2 && (
          <div className="text-center text-muted-foreground animate-pulse">Searching...</div>
        )}

        {!isLoading && debouncedQuery.length >= 2 && results?.length === 0 && (
          <div className="text-center text-muted-foreground">
            <h3 className="text-xl font-semibold mb-2">No results found for "{debouncedQuery}"</h3>
            <p>Try different keywords or check your spelling.</p>
          </div>
        )}

        {!isLoading && results && results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-6 text-muted-foreground">
              Showing {results.length} results for "{debouncedQuery}"
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((item: any, i: number) => (
                <Link to={item.url} key={`${item.type}-${item.id}-${i}`} className="block border rounded-lg p-4 bg-card hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg leading-tight group-hover:text-primary">{item.title}</h4>
                    <Badge variant="outline" className="capitalize shrink-0 ml-2">{item.type}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}...</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
