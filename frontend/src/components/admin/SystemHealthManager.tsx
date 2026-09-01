import { useQuery } from '@tanstack/react-query';
import { fetchSystemHealth, fetchAuditLogs } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Database, Clock, HardDrive, ShieldAlert } from 'lucide-react';

export function SystemHealthManager() {
  const { data: health, isLoading: loadingHealth } = useQuery({ 
    queryKey: ['system-health'], 
    queryFn: fetchSystemHealth,
    refetchInterval: 30000 // refresh every 30s
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({ 
    queryKey: ['audit-logs'], 
    queryFn: fetchAuditLogs 
  });

  if (loadingHealth || loadingLogs) return <div>Loading System Data...</div>;

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">System Status</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${health?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
              {health?.status?.toUpperCase() || 'UNKNOWN'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.uptime ? formatUptime(health.uptime) : 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.memory?.rss || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Heap Used: {health?.memory?.heapUsed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${health?.database === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
              {health?.database || 'UNKNOWN'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5" /> Security & Audit Logs
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">User ID</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Entity</th>
                    <th className="px-6 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs?.slice(0, 15).map((log: any) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-6 py-4">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">{log.userId}</td>
                      <td className="px-6 py-4 font-mono">{log.action}</td>
                      <td className="px-6 py-4 text-muted-foreground">{log.entityType} ({log.entityId})</td>
                      <td className="px-6 py-4 font-mono text-xs">{log.ipAddress}</td>
                    </tr>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No audit logs available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
