import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPolls, createPoll, updatePoll, deletePoll, fetchEvents, createEvent, updateEvent, deleteEvent } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Calendar, Radio } from 'lucide-react';
import { toast } from 'sonner';

export function PollsEventsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'polls' | 'events'>('polls');

  // --- Polls State ---
  const [pollEditing, setPollEditing] = useState<any>(null);
  const [pollForm, setPollForm] = useState({ question: '', isActive: false, options: ['', ''] });

  const { data: polls, isLoading: loadingPolls } = useQuery({ queryKey: ['polls'], queryFn: fetchPolls });

  const createPollMut = useMutation({
    mutationFn: createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll created');
      setPollForm({ question: '', isActive: false, options: ['', ''] });
      setPollEditing(null);
    }
  });

  const updatePollMut = useMutation({
    mutationFn: (args: { id: number, data: any }) => updatePoll(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll updated');
      setPollEditing(null);
      setPollForm({ question: '', isActive: false, options: ['', ''] });
    }
  });

  const deletePollMut = useMutation({
    mutationFn: deletePoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll deleted');
    }
  });

  const handlePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pollEditing) {
      updatePollMut.mutate({ id: pollEditing.id, data: { question: pollForm.question, isActive: pollForm.isActive } });
    } else {
      createPollMut.mutate({ ...pollForm, options: pollForm.options.filter(o => o.trim() !== '') });
    }
  };

  // --- Events State ---
  const [eventEditing, setEventEditing] = useState<any>(null);
  const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', imageUrl: '' });

  const { data: events, isLoading: loadingEvents } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  const createEventMut = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created');
      setEventForm({ title: '', description: '', startDate: '', endDate: '', location: '', imageUrl: '' });
      setEventEditing(null);
    }
  });

  const updateEventMut = useMutation({
    mutationFn: (args: { id: number, data: any }) => updateEvent(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated');
      setEventEditing(null);
      setEventForm({ title: '', description: '', startDate: '', endDate: '', location: '', imageUrl: '' });
    }
  });

  const deleteEventMut = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted');
    }
  });

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventEditing) {
      updateEventMut.mutate({ id: eventEditing.id, data: eventForm });
    } else {
      createEventMut.mutate(eventForm);
    }
  };

  if (loadingPolls || loadingEvents) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <Button variant={activeTab === 'polls' ? 'default' : 'outline'} onClick={() => setActiveTab('polls')}>
          <Radio className="w-4 h-4 mr-2" /> Manage Polls
        </Button>
        <Button variant={activeTab === 'events' ? 'default' : 'outline'} onClick={() => setActiveTab('events')}>
          <Calendar className="w-4 h-4 mr-2" /> Manage Events
        </Button>
      </div>

      {activeTab === 'polls' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{pollEditing ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePollSubmit} className="space-y-4">
                <Input placeholder="Poll Question" value={pollForm.question} onChange={e => setPollForm({...pollForm, question: e.target.value})} required />
                
                {!pollEditing && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {pollForm.options.map((opt, i) => (
                      <Input 
                        key={i} 
                        placeholder={`Option ${i+1}`} 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...pollForm.options];
                          newOpts[i] = e.target.value;
                          setPollForm({...pollForm, options: newOpts});
                        }} 
                      />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setPollForm({...pollForm, options: [...pollForm.options, '']})}>
                      Add Option
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="poll-active" 
                    checked={pollForm.isActive}
                    onCheckedChange={(checked: boolean) => setPollForm({...pollForm, isActive: checked})}
                  />
                  <Label htmlFor="poll-active">Active (Visible to users)</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  {pollEditing && <Button type="button" variant="outline" onClick={() => setPollEditing(null)}>Cancel</Button>}
                  <Button type="submit" disabled={createPollMut.isPending || updatePollMut.isPending}>
                    {pollEditing ? 'Update Poll' : 'Create Poll'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {polls?.map((poll: any) => (
              <Card key={poll.id} className={poll.isActive ? 'border-primary' : ''}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {poll.question} {poll.isActive && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
                    </h3>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      {poll.options?.map((opt: any) => (
                        <div key={opt.id}>- {opt.text} ({opt.votes || 0} votes)</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setPollEditing(poll); setPollForm({ question: poll.question, isActive: poll.isActive, options: [] }); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { if(confirm('Delete poll?')) deletePollMut.mutate(poll.id) }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{eventEditing ? 'Edit Event' : 'Create New Event'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <Input placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required />
                <Textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date/Time</Label>
                    <Input type="datetime-local" value={eventForm.startDate ? new Date(eventForm.startDate).toISOString().slice(0, 16) : ''} onChange={(e: any) => setEventForm({...eventForm, startDate: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date/Time (Optional)</Label>
                    <Input type="datetime-local" value={eventForm.endDate ? new Date(eventForm.endDate).toISOString().slice(0, 16) : ''} onChange={(e: any) => setEventForm({...eventForm, endDate: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Location" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                  <Input placeholder="Image URL (optional)" value={eventForm.imageUrl} onChange={e => setEventForm({...eventForm, imageUrl: e.target.value})} />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  {eventEditing && <Button type="button" variant="outline" onClick={() => setEventEditing(null)}>Cancel</Button>}
                  <Button type="submit" disabled={createEventMut.isPending || updateEventMut.isPending}>
                    {eventEditing ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {events?.map((event: any) => (
              <Card key={event.id}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                    <div className="text-xs mt-2 text-muted-foreground flex gap-4">
                      <span>{new Date(event.startDate).toLocaleString()}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEventEditing(event); setEventForm(event); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { if(confirm('Delete event?')) deleteEventMut.mutate(event.id) }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
