import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function SiteSettingsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'homepage' | 'contact'>('general');
  const [formData, setFormData] = useState<any>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSiteSettings'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const json = await res.json();
      return json.data;
    }
  });

  useEffect(() => {
    if (settings && settings[activeTab]) {
      setFormData(settings[activeTab]);
    } else {
      setFormData({});
    }
  }, [settings, activeTab]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/settings/${activeTab}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update settings');
      return json;
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminSiteSettings'] });
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] }); // Public query
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar navigation for settings */}
      <div className="col-span-1 flex flex-col space-y-2">
        <Button 
          variant={activeTab === 'general' ? 'default' : 'ghost'} 
          className="justify-start"
          onClick={() => setActiveTab('general')}
        >
          General Settings
        </Button>
        <Button 
          variant={activeTab === 'homepage' ? 'default' : 'ghost'} 
          className="justify-start"
          onClick={() => setActiveTab('homepage')}
        >
          Homepage
        </Button>
        <Button 
          variant={activeTab === 'contact' ? 'default' : 'ghost'} 
          className="justify-start"
          onClick={() => setActiveTab('contact')}
        >
          Contact Info
        </Button>
      </div>

      <div className="col-span-1 md:col-span-3">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="capitalize">{activeTab} Settings</CardTitle>
            <CardDescription>Update the public information displayed on your website.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {activeTab === 'general' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" name="siteName" value={formData.siteName || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" name="tagline" value={formData.tagline || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">SEO Description</Label>
                    <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} />
                  </div>
                </>
              )}

              {activeTab === 'homepage' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input id="heroTitle" name="heroTitle" value={formData.heroTitle || ''} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input id="heroSubtitle" name="heroSubtitle" value={formData.heroSubtitle || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Call to Action (Button) Text</Label>
                    <Input id="ctaText" name="ctaText" value={formData.ctaText || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">Call to Action (Button) Link</Label>
                    <Input id="ctaLink" name="ctaLink" value={formData.ctaLink || ''} onChange={handleInputChange} placeholder="/radio or https://..." />
                  </div>
                </>
              )}

              {activeTab === 'contact' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Public Email</Label>
                    <Input id="email" type="email" name="email" value={formData.email || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" value={formData.address || ''} onChange={handleInputChange} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook URL</Label>
                    <Input id="facebook" name="facebook" value={formData.facebook || ''} onChange={handleInputChange} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input id="twitter" name="twitter" value={formData.twitter || ''} onChange={handleInputChange} placeholder="https://..." />
                  </div>
                </>
              )}

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
