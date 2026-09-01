import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNews, createNews, updateNews, deleteNews } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NewsManager() {
  const queryClient = useQueryClient();
  const { data: news = [], isLoading } = useQuery({ queryKey: ['news'], queryFn: fetchNews });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', summary: '', content: '', category: '', imageUrl: '' });

  const createMutation = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: any }) => updateNews(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
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
      summary: item.summary || '',
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', summary: '', content: '', category: '', imageUrl: '' });
  };

  if (isLoading) return <div>Loading news...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit News Article' : 'Add New Article'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea 
                id="content" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
                required 
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
        <h3 className="text-xl font-bold">Published News</h3>
        {news.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.category} • {new Date(item.publishedAt).toLocaleDateString()}</p>
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
