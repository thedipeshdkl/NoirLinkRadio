import { LayoutDashboard, Radio, FileText, Calendar, Users, BarChart2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewsManager } from '@/components/admin/NewsManager';
import { ProgramsManager } from '@/components/admin/ProgramsManager';
import { PodcastsManager } from '@/components/admin/PodcastsManager';
import { ScheduleManager } from '@/components/admin/ScheduleManager';
import { PresentersManager } from '@/components/admin/PresentersManager';
import { RequestsManager } from '@/components/admin/RequestsManager';
import { BreakingNewsManager } from '@/components/admin/BreakingNewsManager';
import { AnalyticsManager } from '@/components/admin/AnalyticsManager';
import { PollsEventsManager } from '@/components/admin/PollsEventsManager';
import { SystemHealthManager } from '@/components/admin/SystemHealthManager';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import { useQuery } from '@tanstack/react-query';
import { fetchNews, fetchPrograms, fetchPodcasts, fetchAuditLogs } from '@/api';

export default function AdminDashboard() {
  const newsQuery = useQuery({ queryKey: ['news'], queryFn: fetchNews });
  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: fetchPrograms });
  const podcastsQuery = useQuery({ queryKey: ['podcasts'], queryFn: fetchPodcasts });
  
  const logsQuery = useQuery({
    queryKey: ['audit-logs'],
    queryFn: fetchAuditLogs
  });
  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your station's content and schedule.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center"><LayoutDashboard className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="news" className="flex items-center"><FileText className="w-4 h-4 mr-2" /> News</TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center"><Radio className="w-4 h-4 mr-2" /> Programs</TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Schedule</TabsTrigger>
            <TabsTrigger value="presenters" className="flex items-center"><Users className="w-4 h-4 mr-2" /> Presenters</TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center"><Radio className="w-4 h-4 mr-2" /> Requests</TabsTrigger>
            <TabsTrigger value="breaking-news" className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Alerts</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center"><BarChart2 className="w-4 h-4 mr-2" /> Analytics</TabsTrigger>
            <TabsTrigger value="events" className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Events</TabsTrigger>
            <TabsTrigger value="podcasts" className="flex items-center"><Users className="w-4 h-4 mr-2" /> Podcasts</TabsTrigger>
            <TabsTrigger value="health" className="flex items-center"><ShieldAlert className="w-4 h-4 mr-2" /> System Health</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center"><LayoutDashboard className="w-4 h-4 mr-2" /> Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold">{programsQuery.data?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total active programs</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Published News</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold">{newsQuery.data?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Articles available</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Podcasts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold">{podcastsQuery.data?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available series</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logsQuery.data?.length === 0 ? (
                    <p className="text-muted-foreground">No recent activity.</p>
                  ) : (
                    logsQuery.data?.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-semibold">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.entity} ID: {log.entityId}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <NewsManager />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramsManager />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleManager />
          </TabsContent>

          <TabsContent value="presenters">
            <PresentersManager />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsManager />
          </TabsContent>

          <TabsContent value="breaking-news">
            <BreakingNewsManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsManager />
          </TabsContent>

          <TabsContent value="events">
            <PollsEventsManager />
          </TabsContent>

          <TabsContent value="podcasts">
            <PodcastsManager />
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
