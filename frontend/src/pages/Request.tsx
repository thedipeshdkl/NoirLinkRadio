import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createRequest } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Music, MessageSquare } from 'lucide-react';

export default function Request() {
  const [formData, setFormData] = useState({
    listenerName: '',
    songTitle: '',
    artist: '',
    message: '',
    dedication: '',
    contactInfo: ''
  });

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      toast.success('Your song request has been submitted successfully!');
      setFormData({
        listenerName: '',
        songTitle: '',
        artist: '',
        message: '',
        dedication: '',
        contactInfo: ''
      });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit request');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="container py-12 space-y-8 max-w-3xl">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-3">
          <Music className="w-8 h-8 text-primary" /> Request a Song
        </h1>
        <p className="text-xl text-muted-foreground">
          Want to hear your favorite track on air? Send us a request!
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="listenerName">Your Name/Nickname *</Label>
              <Input 
                id="listenerName" 
                required 
                placeholder="e.g. DJ Spark"
                value={formData.listenerName}
                onChange={e => setFormData({...formData, listenerName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info (Optional)</Label>
              <Input 
                id="contactInfo" 
                placeholder="Email or phone"
                value={formData.contactInfo}
                onChange={e => setFormData({...formData, contactInfo: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="songTitle">Song Title *</Label>
              <Input 
                id="songTitle" 
                required 
                placeholder="e.g. Bohemian Rhapsody"
                value={formData.songTitle}
                onChange={e => setFormData({...formData, songTitle: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input 
                id="artist" 
                required 
                placeholder="e.g. Queen"
                value={formData.artist}
                onChange={e => setFormData({...formData, artist: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dedication">Dedication (Optional)</Label>
            <Input 
              id="dedication" 
              placeholder="e.g. To my best friend..."
              value={formData.dedication}
              onChange={e => setFormData({...formData, dedication: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message for the Presenter (Optional)</Label>
            <Textarea 
              id="message" 
              placeholder="Tell us why you want to hear this song..."
              rows={4}
              value={formData.message}
              onChange={(e: any) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting...' : <><MessageSquare className="w-5 h-5 mr-2" /> Send Request</>}
          </Button>
          
        </form>
      </div>
    </div>
  );
}
