import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRequests, updateRequest, deleteRequest } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

export function RequestsManager() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({ queryKey: ['requests'], queryFn: fetchRequests });

  const updateMut = useMutation({
    mutationFn: (args: { id: number, data: any }) => updateRequest(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request updated');
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request deleted');
    }
  });

  if (isLoading) return <div>Loading requests...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'Approved': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'Played': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Listener Requests</h2>
      </div>

      {requests?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">No requests found.</div>
      ) : (
        <div className="space-y-4">
          {requests?.map((req: any) => (
            <Card key={req.id}>
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{req.songTitle} - {req.artist}</h3>
                    <Badge variant="outline" className={getStatusColor(req.status)}>{req.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium text-foreground">From:</span> {req.listenerName}</p>
                    {req.dedication && <p><span className="font-medium text-foreground">Dedication:</span> {req.dedication}</p>}
                    {req.message && <p><span className="font-medium text-foreground">Message:</span> {req.message}</p>}
                    {req.contactInfo && <p><span className="font-medium text-foreground">Contact:</span> {req.contactInfo}</p>}
                  </div>
                  <div className="text-xs text-muted-foreground pt-2">
                    Submitted: {new Date(req.createdAt).toLocaleString()}
                    {req.playedAt && ` • Played: ${new Date(req.playedAt).toLocaleString()}`}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {req.status === 'Pending' && (
                    <>
                      <Button size="sm" onClick={() => updateMut.mutate({ id: req.id, data: { status: 'Approved' } })} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateMut.mutate({ id: req.id, data: { status: 'Rejected' } })} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {req.status === 'Approved' && (
                    <Button size="sm" onClick={() => updateMut.mutate({ id: req.id, data: { status: 'Played' } })} className="bg-green-600 hover:bg-green-700 text-white">
                      <Play className="w-4 h-4 mr-1" /> Mark Played
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { if(confirm('Delete request?')) deleteMut.mutate(req.id) }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
