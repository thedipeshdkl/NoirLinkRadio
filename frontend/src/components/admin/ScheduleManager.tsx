import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSchedule, createSchedule, updateSchedule, deleteSchedule, fetchPrograms } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ScheduleManager() {
  const queryClient = useQueryClient();
  const { data: schedule = [], isLoading: isLoadingSchedule } = useQuery({ queryKey: ['schedule'], queryFn: fetchSchedule });
  const { data: programs = [], isLoading: isLoadingPrograms } = useQuery({ queryKey: ['programs'], queryFn: fetchPrograms });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ programId: '', dayOfWeek: 1, startTime: '', endTime: '' });

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: any }) => updateSchedule(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      programId: parseInt(formData.programId),
      dayOfWeek: parseInt(formData.dayOfWeek.toString()),
      startTime: formData.startTime,
      endTime: formData.endTime,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const editItem = (item: any) => {
    setEditingId(item.id);
    setFormData({
      programId: item.programId.toString(),
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ programId: programs[0]?.id?.toString() || '', dayOfWeek: 1, startTime: '', endTime: '' });
  };

  if (isLoadingSchedule || isLoadingPrograms) return <div>Loading schedule...</div>;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Timeslot' : 'Add New Timeslot'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="programId">Program</Label>
                <select 
                  id="programId" 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.programId} 
                  onChange={e => setFormData({...formData, programId: e.target.value})} 
                  required
                >
                  <option value="" disabled>Select a program</option>
                  {programs.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <select 
                  id="dayOfWeek" 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.dayOfWeek} 
                  onChange={e => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})} 
                  required
                >
                  {days.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time (HH:MM)</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (HH:MM)</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Current Schedule</h3>
        {schedule.map((item: any) => {
          const program = programs.find((p: any) => p.id === item.programId);
          return (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-semibold">{program?.title || 'Unknown Program'}</h4>
                  <p className="text-sm text-muted-foreground">{days[item.dayOfWeek]} • {item.startTime} - {item.endTime}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => editItem(item)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(item.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
