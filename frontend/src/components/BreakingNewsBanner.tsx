import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchActiveBreakingNews } from '@/api';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BreakingNewsBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const queryClient = useQueryClient();

  const { data: activeNews, isLoading } = useQuery({ 
    queryKey: ['breaking-news', 'active'], 
    queryFn: fetchActiveBreakingNews,
    refetchInterval: 60000 // Fallback polling every minute
  });

  useEffect(() => {
    // SSE setup for real-time breaking news updates
    const eventSource = new EventSource('/api/stream/breaking-news');
    
    eventSource.addEventListener('breaking-news', (e) => {
      try {
        const news = JSON.parse(e.data);
        if (news) {
          queryClient.setQueryData(['breaking-news', 'active'], news);
          setIsVisible(true);
        } else {
          queryClient.setQueryData(['breaking-news', 'active'], null);
        }
      } catch (err) {
        console.error('Failed to parse breaking news SSE', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  if (isLoading || !activeNews || !isVisible) return null;

  const bgColors = {
    info: 'bg-blue-600',
    warning: 'bg-amber-600',
    critical: 'bg-red-600'
  };
  
  const bgColor = bgColors[activeNews.severity as keyof typeof bgColors] || 'bg-primary';

  return (
    <div className={`${bgColor} text-white px-4 py-3 shadow-md relative z-50 animate-in slide-in-from-top`}>
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-center text-sm md:text-base font-medium relative pr-8 text-center md:text-left gap-2 md:gap-4">
        <div className="flex items-center gap-2 whitespace-nowrap uppercase tracking-wider font-bold">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          BREAKING NEWS
        </div>
        
        <div className="hidden md:block w-px h-4 bg-white/30" />
        
        <div className="flex-1 max-w-2xl truncate">
          <span className="font-bold mr-2">{activeNews.title}</span>
          {activeNews.content && <span className="opacity-90 font-normal">{activeNews.content}</span>}
        </div>

        {activeNews.linkUrl && (
          <Link to={activeNews.linkUrl} className="shrink-0 underline underline-offset-4 hover:opacity-80 transition-opacity">
            {activeNews.linkText || 'Read more'}
          </Link>
        )}
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
