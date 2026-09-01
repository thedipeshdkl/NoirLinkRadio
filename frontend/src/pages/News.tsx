import { Calendar, Clock, ArrowRight, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '@/api';

export default function News() {
  const categories = ["All News", "World", "Politics", "Business", "Tech", "Science", "Health", "Sports", "Entertainment"];

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews
  });

  const trendingNews = news.filter((n: any) => n.isBreaking);
  const latestNews = news.filter((n: any) => !n.isBreaking);

  if (isLoading) {
    return <div className="container mx-auto py-12 text-center text-xl">Loading news...</div>;
  }

  // Fallbacks if data is missing for layout
  const topStory = trendingNews.length > 0 ? trendingNews[0] : (latestNews.length > 0 ? latestNews[0] : null);

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col space-y-8">
        
        {/* Header & Categories */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight">News</h1>
          <div className="w-full">
            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex w-max space-x-2">
                {categories.map((category) => (
                  <Button 
                    key={category}
                    variant={category === "All News" ? "default" : "secondary"}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Featured Article */}
            {topStory && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Badge variant="destructive" className="mr-2 animate-pulse">BREAKING</Badge>
                Top Story
              </h2>
              <Card className="overflow-hidden border-border/50 group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={topStory.imageUrl} 
                    alt={topStory.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <Badge className="mb-3 bg-primary text-white border-none">{topStory.category}</Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight group-hover:text-primary-foreground transition-colors">
                      {topStory.title}
                    </h3>
                    <div className="flex items-center text-white/70 text-sm space-x-4">
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {new Date(topStory.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
            )}

            {/* Latest News List */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Latest News</h2>
              <div className="space-y-6">
                {latestNews.map((article: any) => (
                  <div key={article.id} className="group cursor-pointer grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border-b border-border/50 pb-6 last:border-0">
                    <div className="relative aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden sm:col-span-1">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1"/> {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium">By {article.author}</span>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-transform">
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Trending */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  Trending Now
                </h3>
                <div className="space-y-6">
                  {trendingNews.map((news: any, index: number) => (
                    <div key={news.id} className="flex space-x-4 group cursor-pointer">
                      <div className="text-4xl font-extrabold text-muted-foreground/30 group-hover:text-primary/30 transition-colors">
                        0{index + 1}
                      </div>
                      <div className="space-y-1 mt-1">
                        <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">
                          {news.title}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground space-x-2">
                          <span className="text-primary font-medium">{news.category}</span>
                          <span>•</span>
                          <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="border-border/50 bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-lg">Daily Briefing</h4>
                <p className="text-sm text-muted-foreground">Get the day's top stories delivered directly to your inbox.</p>
                <div className="flex w-full max-w-sm items-center space-x-2 pt-2">
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button type="submit">Subscribe</Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
