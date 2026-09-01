import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, volume, setVolume } = useAudioPlayer();
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [waveHeights, setWaveHeights] = useState<number[]>([10, 20, 15, 30, 10, 25, 10, 15, 20]);

  // Simulate audio waveform animation when playing
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 30) + 5));
      }, 150);
    } else {
      setWaveHeights([10, 20, 15, 30, 10, 25, 10, 15, 20]);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleVolumeChange = (value: number[]) => {
    const v = value[0];
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume > 0 ? prevVolume : 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-card border-t border-border z-50 flex items-center px-4 md:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] glassmorphism">
      <div className="container mx-auto flex items-center justify-between h-full max-w-7xl">
        
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/3 min-w-[200px]">
          <div className="h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center relative">
             {currentTrack.imageUrl ? (
               <img src={currentTrack.imageUrl} alt={currentTrack.title} className="object-cover w-full h-full" />
             ) : (
               <Radio className="w-6 h-6 text-muted-foreground" />
             )}
             {currentTrack.isLive && (
               <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             )}
          </div>
          <div className="flex flex-col truncate">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm md:text-base truncate text-foreground">{currentTrack.title}</span>
              {currentTrack.isLive && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">On Air</Badge>}
            </div>
            <span className="text-xs text-muted-foreground truncate">{currentTrack.presenter}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center space-x-6">
            <Button
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </Button>
          </div>
          
          {/* Waveform */}
          <div className="flex items-end justify-center h-6 space-x-1 mt-2">
            {waveHeights.map((h, i) => (
              <div 
                key={i} 
                className={`w-1 rounded-t-sm transition-all duration-150 ease-in-out ${isPlaying ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                style={{ height: `${h}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="flex items-center justify-end space-x-4 w-1/3">
          <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <div className="w-24 hidden md:block">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
