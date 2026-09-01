import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBreakingNews, createBreakingNews, updateBreakingNews, deleteBreakingNews } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function BreakingNewsManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [breakingForm, setBreakingForm] = useState({ title: '', content: '', linkUrl: '', linkText: '', severity: 'info', isActive: false });

  const { data: newsItems, isLoading } = useQuery({ queryKey: ['breaking-news'], queryFn: fetchBreakingNews });

  const createMut = useMutation({
    mutationFn: createBreakingNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaking-news'] });
      toast.success('Alert created');
      setBreakingForm({ title: '', content: '', linkUrl: '', linkText: '', severity: 'info', isActive: false });
      setEditing(null);
    }
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: number, data: any }) => updateBreakingNews(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaking-news'] });
      toast.success('Alert updated');
      setEditing(null);
      setBreakingForm({ title: '', content: '', linkUrl: '', linkText: '', severity: 'info', isActive: false });
    }
  });

  const deleteMut = useMutation({
    mutationFn: deleteBreakingNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaking-news'] });
      toast.success('Alert deleted');
    }
  });

  const handleBreakingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, data: breakingForm });
    } else {
      createMut.mutate(breakingForm);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Alert' : 'Create Breaking News Alert'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBreakingSubmit} className="space-y-4">
            <Input placeholder="Headline" value={breakingForm.title} onChange={e => setBreakingForm({...breakingForm, title: e.target.value})} required />
            <Textarea placeholder="Details (optional)" value={breakingForm.content} onChange={e => setBreakingForm({...breakingForm, content: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Link URL (optional)" value={breakingForm.linkUrl} onChange={e => setBreakingForm({...breakingForm, linkUrl: e.target.value})} />
              <Input placeholder="Link Text (e.g. Read More)" value={breakingForm.linkText} onChange={e => setBreakingForm({...breakingForm, linkText: e.target.value})} />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="space-y-2">
                <Label>Severity</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={breakingForm.severity}
                  onChange={e => setBreakingForm({...breakingForm, severity: e.target.value})}
                >
                  <option value="info">Info (Blue)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="critical">Critical (Red)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch 
                  id="active-mode" 
                  checked={breakingForm.isActive}
                  onCheckedChange={(checked: boolean) => setBreakingForm({...breakingForm, isActive: checked})}
                />
                <Label htmlFor="active-mode">Active (Visible to users)</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setBreakingForm({ title: '', content: '', linkUrl: '', linkText: '', severity: 'info', isActive: false }); }}>Cancel</Button>}
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? 'Update Alert' : <><Plus className="w-4 h-4 mr-2"/> Publish Alert</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Past & Current Alerts</h3>
        {newsItems?.map((item: any) => (
          <Card key={item.id} className={item.isActive ? 'border-primary ring-1 ring-primary' : ''}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{item.title}</h4>
                  {item.isActive && <Badge variant="default" className="bg-primary animate-pulse">ACTIVE</Badge>}
                  <Badge variant="outline">{item.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.content}</p>
                <div className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => { setEditing(item); setBreakingForm(item); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { if(confirm('Delete alert?')) deleteMut.mutate(item.id) }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
