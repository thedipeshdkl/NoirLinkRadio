import { Mic2, Radio, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchPrograms } from '@/api';
import { Link } from 'react-router-dom';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

export default function Programs() {
  const { playLive } = useAudioPlayer();
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms
  });

  if (isLoading) {
    return <div className="container mx-auto py-12 text-center text-xl">Loading programs...</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col space-y-12">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center md:justify-start mb-4">
            <Mic2 className="w-8 h-8 mr-3 text-primary" />
            हाम्रा कार्यक्रम र प्रस्तोताहरू
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            माइक्रोफोन पछाडिका आवाजहरू सुन्नुहोस् र हाम्रा विविध कार्यक्रमहरू बारे जान्नुहोस्।
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program: any) => (
            <Link to={`/programs/${program.id}`} key={program.id} className="block group">
              <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm h-full">
                <div className="flex flex-col h-full">
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={program.imageUrl || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80"} 
                      alt={program.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 md:bg-gradient-to-r md:from-transparent md:to-black/40 via-transparent to-transparent z-10"></div>
                    <Badge className="absolute top-4 left-4 z-20 bg-background/90 text-foreground border-none backdrop-blur-md">
                      {program.category || "Radio Show"}
                    </Badge>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                    <div>
                      <h2 className="text-3xl font-extrabold mb-3 group-hover:text-primary transition-colors">{program.title}</h2>
                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                        {program.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-foreground/80 mb-6 bg-secondary/50 inline-flex px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4 mr-2 text-primary" /> {program.startTime && program.endTime ? `${program.startTime} - ${program.endTime}` : 'Schedule TBD'}
                      </div>
                    </div>
                    
                    {/* Presenter Footer */}
                    <div className="flex flex-col items-start gap-4 border-t border-border/50 pt-6 mt-2">
                      <div className="flex items-center space-x-4 min-w-0">
                        <img 
                          src={program.presenterImage || "/dipesh.jpg"} 
                          alt={program.presenter} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/50"
                        />
                        <div>
                          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-0.5">प्रस्तुतकर्ता</p>
                          <p className="font-bold text-lg">{program.presenter}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3 shrink-0 mt-4 w-full">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            playLive({ title: program.title, presenter: program.presenter, imageUrl: program.imageUrl });
                          }}
                        >
                          <Radio className="w-4 h-4 mr-2" /> Listen Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
