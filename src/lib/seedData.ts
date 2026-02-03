import { v4 as uuidv4 } from 'uuid';
import { Goal, DayEntry, MonthData, DayStatus, MissedReason, MISSED_REASONS } from '@/types/goals';

const getMonthKey = (year: number, month: number) => `${year}-${month}`;

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getWeekendDays = (year: number, month: number): number[] => {
  const days: number[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      days.push(day);
    }
  }
  return days;
};

const randomStatus = (): DayStatus => {
  const rand = Math.random();
  if (rand < 0.6) return 'hit';
  if (rand < 0.8) return 'partial';
  return 'miss';
};

const randomMissedReason = (): MissedReason => {
  const reasons: MissedReason[] = ['Meeting', 'Fatigue', 'Travel', 'Emergency', 'Laziness', 'Blocked', 'Priority Shift', 'Overslept'];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

const createGoal = (title: string, startTime: string, endTime: string, allocatedMinutes: number, tags: string[]): Goal => ({
  id: uuidv4(),
  title,
  startTime,
  endTime,
  allocatedMinutes,
  tags,
  createdAt: new Date().toISOString(),
});

const createEntries = (goalId: string, year: number, month: number, upToDay?: number): DayEntry[] => {
  const entries: DayEntry[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const maxDay = upToDay || (isCurrentMonth ? today.getDate() : daysInMonth);

  for (let day = 1; day <= maxDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    
    // Skip some weekend days randomly
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.3) continue;

    const status = randomStatus();
    const entry: DayEntry = {
      id: uuidv4(),
      goalId,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status,
      actualMinutes: status === 'hit' ? Math.floor(Math.random() * 20) + 25 : 
                     status === 'partial' ? Math.floor(Math.random() * 15) + 10 : 
                     Math.floor(Math.random() * 10),
      comment: status === 'hit' ? 'Good session!' : 
               status === 'partial' ? 'Interrupted' : 
               status === 'miss' ? 'Could not complete' : '',
      missedReason: status === 'miss' ? randomMissedReason() : undefined,
      timeBlocks: status === 'hit' || status === 'partial' ? [
        {
          id: uuidv4(),
          startTime: '07:00',
          endTime: status === 'hit' ? '07:30' : '07:15',
          type: 'executed' as const,
          note: 'Morning session',
        },
      ] : [],
    };
    entries.push(entry);
  }

  return entries;
};

export const generateSeedData = (): Record<string, MonthData> => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Define 10 sample goals
  const goalTemplates = [
    { title: 'Morning Meditation', startTime: '06:00', endTime: '06:20', allocatedMinutes: 20, tags: ['wellness', 'mindfulness'] },
    { title: 'LeetCode Practice', startTime: '07:00', endTime: '07:45', allocatedMinutes: 45, tags: ['coding', 'interview-prep'] },
    { title: 'Read Technical Book', startTime: '08:00', endTime: '08:30', allocatedMinutes: 30, tags: ['learning', 'reading'] },
    { title: 'Side Project Coding', startTime: '19:00', endTime: '20:00', allocatedMinutes: 60, tags: ['coding', 'side-project'] },
    { title: 'Exercise/Gym', startTime: '17:30', endTime: '18:30', allocatedMinutes: 60, tags: ['fitness', 'health'] },
    { title: 'System Design Study', startTime: '12:30', endTime: '13:00', allocatedMinutes: 30, tags: ['learning', 'interview-prep'] },
    { title: 'Language Learning', startTime: '21:00', endTime: '21:30', allocatedMinutes: 30, tags: ['learning', 'personal'] },
    { title: 'Code Review Practice', startTime: '10:00', endTime: '10:30', allocatedMinutes: 30, tags: ['coding', 'skills'] },
    { title: 'Journal Writing', startTime: '22:00', endTime: '22:15', allocatedMinutes: 15, tags: ['wellness', 'reflection'] },
    { title: 'Open Source Contribution', startTime: '20:30', endTime: '21:00', allocatedMinutes: 30, tags: ['coding', 'community'] },
  ];

  const data: Record<string, MonthData> = {};

  // Previous month - 6 goals with full month data
  const prevGoals = goalTemplates.slice(0, 6).map(g => createGoal(g.title, g.startTime, g.endTime, g.allocatedMinutes, g.tags));
  const prevEntries = prevGoals.flatMap(goal => createEntries(goal.id, prevYear, prevMonth));
  data[getMonthKey(prevYear, prevMonth)] = {
    year: prevYear,
    month: prevMonth,
    goals: prevGoals,
    entries: prevEntries,
    nonOfficeDays: getWeekendDays(prevYear, prevMonth),
  };

  // Current month - 8 goals with data up to today
  const currentGoals = goalTemplates.slice(0, 8).map(g => createGoal(g.title, g.startTime, g.endTime, g.allocatedMinutes, g.tags));
  const currentEntries = currentGoals.flatMap(goal => createEntries(goal.id, currentYear, currentMonth));
  data[getMonthKey(currentYear, currentMonth)] = {
    year: currentYear,
    month: currentMonth,
    goals: currentGoals,
    entries: currentEntries,
    nonOfficeDays: getWeekendDays(currentYear, currentMonth),
  };

  // Next month - 4 goals with just a few entries (planning ahead)
  const nextGoals = goalTemplates.slice(0, 4).map(g => createGoal(g.title, g.startTime, g.endTime, g.allocatedMinutes, g.tags));
  const nextEntries = nextGoals.flatMap(goal => createEntries(goal.id, nextYear, nextMonth, 3)); // Only first 3 days
  data[getMonthKey(nextYear, nextMonth)] = {
    year: nextYear,
    month: nextMonth,
    goals: nextGoals,
    entries: nextEntries,
    nonOfficeDays: getWeekendDays(nextYear, nextMonth),
  };

  return data;
};
