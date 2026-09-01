import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPresenters, createPresenter, updatePresenter, deletePresenter } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function PresentersManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', bio: '', profileImageUrl: '', socialLinks: '' });

  const { data: presenters, isLoading } = useQuery({ queryKey: ['presenters'], queryFn: fetchPresenters });

  const createMut = useMutation({
    mutationFn: createPresenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presenters'] });
      toast.success('Presenter created');
      setFormData({ name: '', slug: '', bio: '', profileImageUrl: '', socialLinks: '' });
      setEditing(null);
    }
  });

  const updateMut = useMutation({
    mutationFn: (args: { id: number, data: any }) => updatePresenter(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presenters'] });
      toast.success('Presenter updated');
      setEditing(null);
      setFormData({ name: '', slug: '', bio: '', profileImageUrl: '', socialLinks: '' });
    }
  });

  const deleteMut = useMutation({
    mutationFn: deletePresenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presenters'] });
      toast.success('Presenter deleted');
    }
  });

  const handlePresenterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, data: formData });
    } else {
      createMut.mutate(formData);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Presenter' : 'Add New Presenter'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePresenterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Presenter Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} required />
              <Input placeholder="Slug (optional)" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>
            <Input placeholder="Profile Image URL" value={formData.profileImageUrl} onChange={e => setFormData({...formData, profileImageUrl: e.target.value})} />
            <Textarea placeholder="Bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
            <Input placeholder='Social Links JSON e.g. {"twitter": "..."}' value={formData.socialLinks} onChange={e => setFormData({...formData, socialLinks: e.target.value})} />
            
            <div className="flex justify-end gap-2">
              {editing && <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>}
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                {editing ? 'Update Presenter' : <><Plus className="w-4 h-4 mr-2"/> Add Presenter</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presenters?.map((p: any) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {p.profileImageUrl && <img src={p.profileImageUrl} className="w-12 h-12 rounded-full object-cover" />}
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </div>
              </div>
              <p className="text-sm line-clamp-2 mt-2">{p.bio}</p>
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(p); setFormData(p); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => { if(confirm('Delete presenter?')) deleteMut.mutate(p.id) }}>
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
