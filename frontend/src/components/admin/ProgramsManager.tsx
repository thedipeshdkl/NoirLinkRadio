import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPrograms, createProgram, updateProgram, deleteProgram } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProgramsManager() {
  const queryClient = useQueryClient();
  const { data: programs = [], isLoading } = useQuery({ queryKey: ['programs'], queryFn: fetchPrograms });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', host: '', description: '', imageUrl: '' });

  const createMutation = useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: any }) => updateProgram(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const editItem = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      host: item.host,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', host: '', description: '', imageUrl: '' });
  };

  if (isLoading) return <div>Loading programs...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Program' : 'Add New Program'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Program Title</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input id="host" value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Current Programs</h3>
        {programs.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">Hosted by {item.host}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => editItem(item)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(item.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
