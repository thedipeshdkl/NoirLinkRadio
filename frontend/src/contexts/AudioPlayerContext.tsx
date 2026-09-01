import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { config } from '../config';
import { trackEvent, heartbeatSession } from '../api';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

type AudioPlayerContextType = {
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  volume: number;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  currentTrack: TrackInfo | null;
  playLive: (metadata?: Partial<TrackInfo>) => void;
  playPodcast: (podcast: TrackInfo) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

export type TrackInfo = {
  title: string;
  presenter: string;
  isLive: boolean;
  audioUrl: string;
  imageUrl?: string;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const { user } = useAuth();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);

  // Heartbeat session
  useEffect(() => {
    if (isPlaying) {
      const sendHeartbeat = async () => {
        try {
          const res = await heartbeatSession({
            sessionId: sessionId,
            userId: user?.id,
            platform: 'web',
            deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
          });
          if (res?.sessionId) setSessionId(res.sessionId);
        } catch (e) {
          console.error('Heartbeat failed', e);
        }
      };
      
      sendHeartbeat();
      heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, 60000); // Every minute
    } else {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    }

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [isPlaying, sessionId, user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    setError(null);
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      
      // Track analytics
      if (currentTrack) {
        trackEvent({
          eventType: currentTrack.isLive ? 'play_live' : 'play_podcast',
          entityType: currentTrack.isLive ? 'program' : 'podcast',
          entityId: 0, // Would need actual ID
          metadata: JSON.stringify({ title: currentTrack.title }),
          userId: user?.id
        }).catch(console.error);
      }
    } catch (e) {
      console.error("Playback failed", e);
      setError("Failed to play audio.");
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      handlePlay();
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
  };

  const playLive = (metadata?: Partial<TrackInfo>) => {
    const streamUrl = metadata?.audioUrl || config.RADIO_STREAM_URL;
    if (!streamUrl) {
      toast.error('Radio stream not configured for production use.');
      return;
    }

    const liveTrack: TrackInfo = {
      title: metadata?.title || 'NoirLink Live',
      presenter: metadata?.presenter || 'Live Broadcast',
      isLive: true,
      audioUrl: streamUrl,
      imageUrl: metadata?.imageUrl || '/dipesh.jpg'
    };
    setCurrentTrack(liveTrack);
    setIsPlaying(true);
  };

  const playPodcast = (podcast: TrackInfo) => {
    setCurrentTrack(podcast);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      if (isPlaying) {
        handlePlay();
      }
      
      // Update Media Session API
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title || 'Live Stream',
          artist: currentTrack.presenter || 'NoirLink Radio',
          album: 'NoirLink Radio 107.2 MHz',
          artwork: [
            { src: currentTrack.imageUrl || '/vite.svg', sizes: '512x512', type: 'image/png' },
            { src: currentTrack.imageUrl || '/vite.svg', sizes: '192x192', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          if (audioRef.current) audioRef.current.play();
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack]);

  return (
    <AudioPlayerContext.Provider value={{
      isPlaying, isBuffering, error, volume, togglePlay, setVolume, currentTrack, playLive, playPodcast, audioRef
    }}>
      {children}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
          setIsBuffering(false);
          setError("Stream error. Reconnecting...");
          setIsPlaying(false);
        }}
      />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
