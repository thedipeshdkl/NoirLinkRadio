import { useEffect, useState } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Play, Pause, Volume2, Radio, Loader2, AlertCircle } from 'lucide-react';
import { Slider } from '../components/ui/slider';
import { fetchSchedule, fetchPrograms } from '../api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getStationTime, isProgramActive } from '@/lib/time';

export default function LiveRadio() {
  const { isPlaying, isBuffering, error, togglePlay, volume, setVolume, playLive, currentTrack } = useAudioPlayer();
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  
  useEffect(() => {
    const loadCurrentProgram = async () => {
      try {
        const [programs, schedule] = await Promise.all([
          fetchPrograms(),
          fetchSchedule()
        ]);
        
        const stationTime = getStationTime();
        const activeSchedule = schedule.find((s: any) => isProgramActive(s, stationTime)) || schedule[0];
        
        if (activeSchedule) {
          const active = programs.find((p: any) => p.id === activeSchedule.programId) || programs[0];
          if (active) {
            setCurrentProgram(active);
            
            if (!currentTrack) {
              playLive({
                title: active.title || active.name,
                presenter: active.presenter,
                imageUrl: active.imageUrl || '/dipesh.jpg'
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load schedule", err);
      }
    };
    
    loadCurrentProgram();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
        Live Radio
      </h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur shadow-2xl">
        <div className="md:flex">
          <div className="md:w-1/2 relative bg-muted">
            <img 
              src={currentTrack?.imageUrl || '/dipesh.jpg'} 
              alt="Live Radio" 
              className="w-full h-[400px] object-cover"
            />
            {isPlaying && !isBuffering && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
                <Radio className="w-4 h-4" /> ON AIR
              </div>
            )}
            {isBuffering && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            )}
          </div>
          
          <CardContent className="md:w-1/2 p-8 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentTrack?.title || 'NoirLink Live'}</h2>
                <p className="text-xl text-muted-foreground">{currentTrack?.presenter || 'Live Broadcast'}</p>
              </div>

              <div className="pt-8 flex flex-col gap-6">
                <Button 
                  size="lg" 
                  className={`w-full h-16 text-lg rounded-xl shadow-xl transition-all ${
                    isPlaying 
                      ? 'bg-primary/20 hover:bg-primary/30 text-primary border-2 border-primary/50' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02]'
                  }`}
                  onClick={() => {
                    if (!currentTrack) {
                      playLive();
                    } else {
                      togglePlay();
                    }
                  }}
                >
                  {isBuffering ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Buffering...</>
                  ) : isPlaying ? (
                    <><Pause className="w-6 h-6 mr-3 fill-current" /> Pause</>
                  ) : (
                    <><Play className="w-6 h-6 mr-3 fill-current" /> Play Live Stream</>
                  )}
                </Button>

                <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-border/50">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={(vals) => setVolume(vals[0] / 100)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
      
      {currentProgram && (
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Up Next</h3>
          <p className="text-muted-foreground">Stay tuned for more great programs throughout the day.</p>
        </div>
      )}
    </div>
  );
}
