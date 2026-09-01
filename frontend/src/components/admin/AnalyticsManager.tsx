import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsStats } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, BarChart2 } from 'lucide-react';

export function AnalyticsManager() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['analytics-stats'], queryFn: fetchAnalyticsStats, refetchInterval: 30000 });

  if (isLoading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Listener Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary animate-pulse" />
              Active Listeners Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-primary">{stats?.activeNow || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Listeners connected in the last 2 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              Total Sessions (All Time)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique listening sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <BarChart2 className="w-4 h-4 mr-2" />
              Total Events Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Play, pause, interactions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
