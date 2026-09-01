import { Video, Radio, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchNews, fetchSchedule, fetchPrograms } from '@/api';
import { getStationTime, isProgramActive } from '@/lib/time';
import { useSettings } from '@/hooks/useSettings';

export default function Home() {
  const { playLive } = useAudioPlayer();
  const { data: settings } = useSettings();

  const { data: news = [] } = useQuery({ queryKey: ['news'], queryFn: fetchNews });
  const { data: scheduleRaw = [] } = useQuery({ queryKey: ['schedule'], queryFn: fetchSchedule });
  const { data: programs = [] } = useQuery({ queryKey: ['programs'], queryFn: fetchPrograms });

  const breakingNews = news.filter((n: any) => n.isBreaking).map((n: any) => n.title);

  // Compute current program
  const stationTime = getStationTime();
  let activeSchedule = scheduleRaw.find((s: any) => isProgramActive(s, stationTime));

  // Fallback to first schedule item if nothing is currently live
  if (!activeSchedule && scheduleRaw.length > 0) {
    activeSchedule = scheduleRaw[0];
  }

  const activeProgram = activeSchedule ? programs.find((p: any) => p.id === activeSchedule.programId) : null;

  const currentProgram = {
    name: activeProgram?.name || 'Auto DJ / Music Mix',
    presenter: activeProgram?.presenter || 'Various Artists',
    startTime: activeSchedule?.startTime || '00:00',
    endTime: activeSchedule?.endTime || '23:59',
    imageUrl: activeProgram?.imageUrl || 'https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?w=800&q=80',
  };

  return (
    <div className="flex flex-col">
      
      {/* Breaking News Ticker */}
      <div className="bg-destructive text-destructive-foreground py-2 overflow-hidden flex items-center relative z-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 flex items-center">
          <Badge variant="outline" className="bg-black/20 border-black/10 text-white hover:bg-black/20 uppercase font-bold mr-4 flex-shrink-0">
            Breaking News
          </Badge>
          <div className="overflow-hidden flex-grow relative h-6">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center space-x-12">
              {(breakingNews.length > 0 ? breakingNews : ["Welcome to NoirLink Radio 107.2 MHz - Your Voice, Your Station!"]).map((news: string, i: number) => (
                <span key={i} className="font-medium text-sm">
                  {news}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
            alt="Radio Studio" 
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="w-full md:w-3/5 space-y-8 text-center md:text-left">
            <Badge variant="secondary" className="px-3 py-1 bg-secondary/80 backdrop-blur-md border-primary/20 text-primary uppercase tracking-widest font-bold">
              Broadcasting Live 24/7
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              {settings?.homepage?.heroTitle || 'Welcome to NoirLink Radio'}
              <span className="block mt-2 md:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                {settings?.homepage?.heroSubtitle || 'Live 24/7 Music & News'}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed">
              {settings?.general?.description || 'Your daily dose of news, talk, and entertainment. Tune in to catch the latest updates and engaging discussions with Dipesh Dhakal.'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => {
                  if (settings?.homepage?.ctaLink && settings.homepage.ctaLink.startsWith('http')) {
                    window.location.href = settings.homepage.ctaLink;
                  } else if (settings?.homepage?.ctaLink) {
                    window.location.href = settings.homepage.ctaLink; // or use react-router navigate if preferred
                  } else {
                    playLive();
                  }
                }}
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_40px_rgba(255,0,0,0.4)] transition-all hover:scale-105"
              >
                <Radio className="w-5 h-5 mr-2 animate-pulse" /> {settings?.homepage?.ctaText || 'Listen Live'}
              </Button>
              <Link to="/video" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-14 px-8 text-lg font-bold rounded-full border-2 hover:bg-secondary transition-all"
                >
                  <Video className="w-5 h-5 mr-2" /> Watch Studio
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-2/5">
            <Card className="border-border/50 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-3xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:z-0">
              <div className="absolute top-0 right-0 p-4 z-20">
                <Badge variant="destructive" className="animate-pulse shadow-lg font-bold uppercase tracking-wider">
                  <Radio className="w-3 h-3 mr-1" /> On Air
                </Badge>
              </div>
              <CardContent className="p-0 relative z-10">
                <img 
                  src={currentProgram.imageUrl} 
                  alt={currentProgram.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-8">
                  <p className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Now Playing</p>
                  <h3 className="text-3xl font-extrabold mb-1">{currentProgram.name}</h3>
                  <p className="text-muted-foreground text-lg mb-6">with {currentProgram.presenter}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {currentProgram.startTime} - {currentProgram.endTime}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                      Schedule <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* Program Details Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Programs</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Explore our diverse range of shows, designed to keep you informed and entertained throughout the day.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.slice(0, 6).map((program: any) => (
              <Card key={program.id} className="border-border/50 bg-card hover:shadow-xl transition-all hover:-translate-y-1">
                <img 
                  src={program.imageUrl || '/dipesh.jpg'} 
                  alt={program.title} 
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{program.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-primary">with {program.presenter}</span>
                    <Link to="/programs" className="text-muted-foreground hover:text-foreground flex items-center">
                      View details <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/schedule">
              <Button size="lg" variant="outline" className="px-8 font-bold border-2">
                View Full Schedule
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
