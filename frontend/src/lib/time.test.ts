import { describe, it, expect } from 'vitest';
import { parseTime, isProgramActive } from './time';

describe('Time utilities', () => {
  it('parses time correctly', () => {
    expect(parseTime('00:00')).toBe(0);
    expect(parseTime('12:30')).toBe(12 * 60 + 30);
    expect(parseTime('23:59')).toBe(23 * 60 + 59);
  });

  it('checks active programs accurately', () => {
    const mockSchedule = {
      dayOfWeek: 1, // Monday
      startTime: '10:00',
      endTime: '12:00'
    };

    // Monday 11:00 AM (Should be active)
    let stationTime = new Date('2023-10-09T11:00:00'); // 2023-10-09 is a Monday
    expect(isProgramActive(mockSchedule, stationTime)).toBe(true);

    // Monday 09:59 AM (Should be inactive)
    stationTime = new Date('2023-10-09T09:59:00');
    expect(isProgramActive(mockSchedule, stationTime)).toBe(false);

    // Tuesday 11:00 AM (Should be inactive)
    stationTime = new Date('2023-10-10T11:00:00');
    expect(isProgramActive(mockSchedule, stationTime)).toBe(false);
  });
});
