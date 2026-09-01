import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { config } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchLiveVideo } from '@/api';
import { LiveChat } from '@/components/LiveChat';

export default function LiveVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: schedule = [] } = useQuery({
    queryKey: ['live-video'],
    queryFn: fetchLiveVideo
  });

  useEffect(() => {
    let hls: Hls;

    if (videoRef.current) {
      const video = videoRef.current;
      const url = config.LIVE_VIDEO_URL;

      if (!url) return;

      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS loaded");
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Video Section */}
        <div className="lg:w-2/3 space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Video className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-extrabold tracking-tight">Live Studio</h1>
            <Badge variant="destructive" className="ml-4 animate-pulse">LIVE NOW</Badge>
          </div>

          <Card className="overflow-hidden border-border/50 shadow-2xl bg-black">
            <CardContent className="p-0 relative aspect-video flex items-center justify-center">
              {!config.LIVE_VIDEO_URL ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white p-4 text-center">
                  <p>Live video stream is not configured for production use.</p>
                </div>
              ) : (
                <video 
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  poster="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop"
                />
              )}
              {!isPlaying && config.LIVE_VIDEO_URL && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <div className="bg-primary/90 text-white p-4 rounded-full">
                    <Video className="w-8 h-8" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">Breaking News / Live Broadcast</h2>
            <p className="text-muted-foreground">Join our presenters in the studio as they discuss today's most important headlines and stories.</p>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="lg:w-1/3 space-y-6">
          <h3 className="text-2xl font-bold flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-primary" /> Today's Live Programs
          </h3>
          
          <div className="space-y-4">
            {schedule.map((prog: any, index: number) => (
              <Card key={index} className={`border-border/50 transition-colors ${prog.isLive ? 'bg-secondary/50 border-primary/50' : ''}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary font-bold">{new Date(prog.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="font-semibold text-lg">{prog.title}</p>
                  </div>
                  <div>
                    {prog.isLive ? (
                      <Badge variant="destructive" className="animate-pulse">🔴 LIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Upcoming</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="p-6 text-center space-y-4">
              <h4 className="font-bold">Want to join the conversation?</h4>
              <p className="text-sm text-muted-foreground">Call our studio directly to share your thoughts on air.</p>
              <Button className="w-full" variant="outline">Call Studio: 555-0199</Button>
            </CardContent>
          </Card>
          
          <LiveChat />
        </div>

      </div>
    </div>
  );
}
