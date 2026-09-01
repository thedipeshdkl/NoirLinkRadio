import { Calendar, Clock, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { fetchSchedule, fetchPrograms } from '@/api';
import { getStationTime, isProgramActive, parseTime } from '@/lib/time';

export default function Schedule() {
  const days = ["सोमबार", "मंगलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार", "आइतबार"];
  const dayNamesToNum: Record<string, number> = { "आइतबार": 0, "सोमबार": 1, "मंगलबार": 2, "बुधबार": 3, "बिहिबार": 4, "शुक्रबार": 5, "शनिबार": 6 };
  
  const { data: scheduleDataRaw = [], isLoading: scheduleLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: fetchSchedule
  });

  const { data: programsData = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms
  });

  if (scheduleLoading || programsLoading) {
    return <div className="container mx-auto py-12 text-center text-xl">Loading schedule...</div>;
  }

  // Determine current time to mark "LIVE NOW" or "UP NEXT"
  const stationTime = getStationTime();
  const currentDay = stationTime.getDay();
  const currentHourMinutes = stationTime.getHours() * 60 + stationTime.getMinutes();

  const scheduleData = scheduleDataRaw.map((s: any) => {
    const program = programsData.find((p: any) => p.id === s.programId);
    
    let status = 'UPCOMING';
    
    if (isProgramActive(s, stationTime)) {
      status = 'LIVE NOW';
    } else {
      const startMins = parseTime(s.startTime);
      if (s.dayOfWeek === currentDay && currentHourMinutes < startMins) {
        status = 'UP NEXT'; // Approximate "next" indicator
      } else if (s.dayOfWeek === currentDay && currentHourMinutes >= startMins) {
        status = 'COMPLETED';
      } else if (s.dayOfWeek < currentDay) {
        status = 'COMPLETED';
      }
    }

    return {
      ...s,
      title: program?.name || 'Unknown Program',
      presenter: program?.presenter || 'Unknown Presenter',
      status
    };
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12">
      <div className="flex flex-col space-y-8">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center md:justify-start mb-4">
            <Calendar className="w-8 h-8 mr-3 text-primary" />
            कार्यक्रम तालिका
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            तपाईँका मनपर्ने प्रस्तोता र कार्यक्रमहरू कहिले प्रसारण हुन्छन्, थाहा पाउनुहोस्।
          </p>
        </div>

        {/* Schedule Tabs */}
        <Tabs defaultValue="सोमबार" className="w-full">
          <ScrollArea className="w-full whitespace-nowrap mb-8 border-b border-border/50">
            <TabsList className="w-max bg-transparent space-x-2 h-14 p-0">
              {days.map((day) => (
                <TabsTrigger 
                  key={day} 
                  value={day}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-6 text-base font-semibold text-muted-foreground"
                >
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>

          {days.map((day) => (
            <TabsContent key={day} value={day} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-4">
                {scheduleData.filter((s: any) => s.dayOfWeek === dayNamesToNum[day]).map((prog: any) => (
                  <Card 
                    key={prog.id} 
                    className={`border-border/50 transition-all duration-300 hover:border-primary/30 ${
                      prog.status === 'LIVE NOW' ? 'bg-primary/5 border-primary/50 shadow-lg shadow-primary/5 scale-[1.01]' : 'bg-card'
                    }`}
                  >
                    <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      <div className="flex items-start md:items-center space-x-6 w-full md:w-1/3">
                        <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-lg p-3 min-w-[120px]">
                          <span className="text-sm font-bold text-foreground flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-primary"/> {prog.startTime}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">to {prog.endTime}</span>
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 space-y-1">
                        <h3 className={`text-2xl font-bold ${prog.status === 'LIVE NOW' ? 'text-primary' : ''}`}>
                          {prog.title}
                        </h3>
                        <p className="text-muted-foreground text-lg">with {prog.presenter}</p>
                      </div>

                      <div className="w-full md:w-1/6 flex justify-start md:justify-end">
                        {prog.status === 'LIVE NOW' && (
                          <Badge variant="destructive" className="animate-pulse px-4 py-1 text-sm font-bold shadow-lg shadow-red-500/20">
                            <Radio className="w-4 h-4 mr-2" /> LIVE NOW
                          </Badge>
                        )}
                        {prog.status === 'UP NEXT' && (
                          <Badge variant="secondary" className="px-4 py-1 text-sm font-bold text-primary border-primary/20">
                            UP NEXT
                          </Badge>
                        )}
                        {prog.status === 'COMPLETED' && (
                          <span className="text-sm font-medium text-muted-foreground/50">Completed</span>
                        )}
                        {prog.status === 'UPCOMING' && (
                          <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

      </div>
    </div>
  );
}
