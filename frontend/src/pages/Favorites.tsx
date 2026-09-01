import { useQuery } from '@tanstack/react-query';
import { fetchFavorites, fetchHistory } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Clock, Heart } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Favorites() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { data: favorites, isLoading: loadingFavs } = useQuery({ 
    queryKey: ['favorites'], 
    queryFn: fetchFavorites,
    enabled: isAuthenticated 
  });

  const { data: history, isLoading: loadingHistory } = useQuery({ 
    queryKey: ['history'], 
    queryFn: fetchHistory,
    enabled: isAuthenticated 
  });

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="container py-12 max-w-5xl space-y-12 min-h-screen">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary" /> My Favorites
        </h1>
        <p className="text-muted-foreground">Your saved programs and podcasts.</p>
        
        {loadingFavs ? (
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        ) : favorites?.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            You haven't saved any favorites yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {favorites?.map((fav: any) => (
              <Card key={fav.id} className="overflow-hidden hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Music className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{fav.programId ? `Program #${fav.programId}` : `Podcast #${fav.podcastId}`}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Added {new Date(fav.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8 border-t">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" /> Listening History
        </h1>
        <p className="text-muted-foreground">Recently played episodes.</p>
        
        {loadingHistory ? (
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-16 bg-muted rounded-xl" />
            <div className="h-16 bg-muted rounded-xl" />
          </div>
        ) : history?.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            No listening history available.
          </div>
        ) : (
          <div className="space-y-3 pt-4">
            {history?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 bg-card border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                <div className="bg-muted w-12 h-12 rounded flex items-center justify-center shrink-0">
                  <Music className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">Episode #{item.episodeId || item.podcastId}</h3>
                  <p className="text-sm text-muted-foreground">Played on {new Date(item.listenedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
