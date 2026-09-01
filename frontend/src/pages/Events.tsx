import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, fetchPolls, votePoll } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Radio } from 'lucide-react';
import { toast } from 'sonner';

export default function Events() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [votedPolls, setVotedPolls] = useState<Record<number, boolean>>({});

  const { data: events, isLoading: loadingEvents } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  const { data: polls } = useQuery({ queryKey: ['polls'], queryFn: fetchPolls });

  const voteMut = useMutation({
    mutationFn: (args: { pollId: number, optionId: number }) => votePoll(args.pollId, args.optionId, user?.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      setVotedPolls(prev => ({ ...prev, [variables.pollId]: true }));
      toast.success('Vote recorded!');
    }
  });

  const activePolls = polls?.filter((p: any) => p.isActive) || [];

  return (
    <div className="container py-12 max-w-5xl space-y-12 min-h-screen">
      
      {activePolls.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-extrabold tracking-tight">Active Polls</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePolls.map((poll: any) => {
              const totalVotes = poll.options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 0;
              const hasVoted = votedPolls[poll.id];

              return (
                <Card key={poll.id} className="border-primary ring-1 ring-primary/20">
                  <CardHeader>
                    <CardTitle>{poll.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {poll.options?.map((opt: any) => {
                      const percent = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                      return (
                        <div key={opt.id} className="space-y-1">
                          <Button 
                            variant="outline" 
                            className="w-full justify-between h-auto py-3 px-4 relative overflow-hidden group"
                            onClick={() => !hasVoted && voteMut.mutate({ pollId: poll.id, optionId: opt.id })}
                            disabled={hasVoted || voteMut.isPending}
                          >
                            {hasVoted && (
                              <div 
                                className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-1000" 
                                style={{ width: `${percent}%` }}
                              />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                              {opt.text}
                            </span>
                            {hasVoted && (
                              <span className="relative z-10 font-bold">{percent}%</span>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                    <div className="text-sm text-muted-foreground text-center pt-2">
                      {totalVotes} total votes
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6 pt-8 border-t">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight">Upcoming Events</h1>
        </div>

        {loadingEvents ? (
          <div className="animate-pulse space-y-4 pt-4">
            <div className="h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        ) : events?.length === 0 ? (
          <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
            No upcoming events right now. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pt-4">
            {events?.map((event: any) => (
              <Card key={event.id} className="hover:border-primary transition-colors">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.title} className="w-full md:w-48 h-32 object-cover rounded-md" />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold">{event.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm font-medium">
                      {event.startDate && (
                        <span className="flex items-center gap-1 text-primary">
                          <Calendar className="w-4 h-4" /> {new Date(event.startDate).toLocaleString()}
                        </span>
                      )}
                      {event.location && (
                        <span className="text-muted-foreground">📍 {event.location}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
