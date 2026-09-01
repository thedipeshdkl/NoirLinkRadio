export const STATION_TIMEZONE = 'Asia/Kathmandu';

export const getStationTime = () => {
  // Convert current time to station timezone
  const dateStr = new Date().toLocaleString("en-US", { timeZone: STATION_TIMEZONE });
  return new Date(dateStr);
};

export const parseTime = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const isProgramActive = (schedule: any, stationTime: Date) => {
  let scheduleDay = schedule.dayOfWeek;
  const currentDay = stationTime.getDay();
  const currentHourMinutes = stationTime.getHours() * 60 + stationTime.getMinutes();
  
  const startMins = parseTime(schedule.startTime);
  const endMins = parseTime(schedule.endTime);
  
  // If the program goes past midnight (e.g., 23:00 to 01:00)
  if (endMins < startMins) {
    if (currentDay === scheduleDay && currentHourMinutes >= startMins) return true;
    
    // Check if it's the next day and we are in the early morning part of the program
    let nextDay = (scheduleDay + 1) % 7;
    if (currentDay === nextDay && currentHourMinutes < endMins) return true;
    
    return false;
  }
  
  // Normal program
  if (scheduleDay !== currentDay) return false;
  return currentHourMinutes >= startMins && currentHourMinutes < endMins;
};
