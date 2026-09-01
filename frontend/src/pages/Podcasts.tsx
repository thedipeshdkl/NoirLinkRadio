import { Play, Headphones, Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useQuery } from '@tanstack/react-query';
import { fetchPodcasts, fetchPodcastEpisodes } from '@/api';

export default function Podcasts() {
  const { playPodcast } = useAudioPlayer();

  const categories = ["All", "News", "Politics", "Technology", "Entertainment", "Sports", "Interviews", "Society", "Business"];

  const { data: podcasts = [], isLoading: podcastsLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: fetchPodcasts
  });

  const { data: episodes = [], isLoading: episodesLoading } = useQuery({
    queryKey: ['all-episodes'],
    queryFn: async () => {
      // For a real app we might fetch these per podcast or have an endpoint for latest episodes
      // Since this is a demo, let's fetch all episodes for all podcasts we have
      const allEpisodes = [];
      for (const p of podcasts) {
        try {
          const ep = await fetchPodcastEpisodes(p.id);
          allEpisodes.push(...ep);
        } catch(e) {}
      }
      return allEpisodes;
    },
    enabled: podcasts.length > 0
  });

  if (podcastsLoading || (podcasts.length > 0 && episodesLoading)) {
    return <div className="container mx-auto py-12 text-center text-xl">Loading podcasts...</div>;
  }

  const handlePlayPodcast = (podcast: any, episode: any) => {
    if (!episode) return;
    playPodcast({
      title: episode.title,
      presenter: podcast.title,
      isLive: false,
      audioUrl: episode.audioUrl,
      imageUrl: podcast.imageUrl
    });
  };

  const getLatestEpisode = (podcastId: number) => {
    const eps = episodes.filter((e: any) => e.podcastId === podcastId);
    return eps.length > 0 ? eps[0] : null;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground flex items-center">
            <Headphones className="w-8 h-8 mr-3 text-primary" />
            पोडकास्टहरू
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            हाम्रा मौलिक शृङ्खला, दैनिक समाचार अपडेट र तपाईंलाई चासो लाग्ने विषयहरूको विस्तृत विश्लेषण सुन्नुहोस्।
          </p>
        </div>

        {/* Categories */}
        <div className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-2">
              {categories.map((category) => (
                <Button 
                  key={category}
                  variant={category === "All" ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Featured Podcast */}
        {podcasts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Featured</h2>
          <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 h-64 md:h-auto relative">
                <img 
                  src={podcasts[0].imageUrl || "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&q=80"} 
                  alt={podcasts[0].title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <Badge className="mb-4">{podcasts[0].category}</Badge>
                  <h3 className="text-3xl font-extrabold mb-2">{podcasts[0].title}</h3>
                  <p className="text-muted-foreground text-lg mb-4">{podcasts[0].description}</p>
                  <p className="text-sm font-medium mb-6">Hosted by {podcasts[0].host}</p>
                </div>
                
                {getLatestEpisode(podcasts[0].id) && (
                <div className="bg-secondary/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between border border-border/50">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Latest Episode</p>
                    <p className="font-semibold">{getLatestEpisode(podcasts[0].id).title}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
                      <span className="flex items-center"><CalendarIcon className="w-3 h-3 mr-1"/> {new Date(getLatestEpisode(podcasts[0].id).publishedAt).toLocaleDateString()}</span>
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {Math.floor(getLatestEpisode(podcasts[0].id).duration / 60)} min</span>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handlePlayPodcast(podcasts[0], getLatestEpisode(podcasts[0].id))}
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" /> Play Episode
                  </Button>
                </div>
                )}
              </div>
            </div>
          </Card>
        </section>
        )}

        {/* Podcast Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center justify-between">
            Latest Series
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.slice(1).map((podcast: any) => {
              const latestEp = getLatestEpisode(podcast.id);
              return (
              <Card key={podcast.id} className="overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-colors group cursor-pointer flex flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={podcast.imageUrl || "https://images.unsplash.com/photo-1555529902-5261145633bf?w=800&q=80"} 
                    alt={podcast.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" className="w-14 h-14 rounded-full bg-primary hover:bg-primary text-white" onClick={(e) => { e.stopPropagation(); handlePlayPodcast(podcast, latestEp); }}>
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </Button>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-background/90 text-foreground hover:bg-background/90 border-none backdrop-blur-md">
                    {podcast.category}
                  </Badge>
                </div>
                <CardContent className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{podcast.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{podcast.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-medium text-muted-foreground">Host: {podcast.host}</p>
                    
                    {latestEp && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Latest</p>
                      <p className="font-semibold text-sm truncate">{latestEp.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-3">
                        <span className="flex items-center"><CalendarIcon className="w-3 h-3 mr-1"/> {new Date(latestEp.publishedAt).toLocaleDateString()}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {Math.floor(latestEp.duration / 60)} min</span>
                      </div>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
