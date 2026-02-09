import { api } from './config';
import { Goal, DayEntry } from '@/types/goals';

// Helper to parse timeBlocks from JSON if needed
const parseDayEntry = (entry: any): DayEntry => {
  return {
    ...entry,
    timeBlocks: typeof entry.timeBlocks === 'string' 
      ? JSON.parse(entry.timeBlocks) 
      : entry.timeBlocks || [],
  };
};

export const goalsApi = {
  // Goals
  getAll: async () => {
    const goals = await api.get<Goal[]>('/goals');
    return goals.map(goal => ({
      ...goal,
      dayEntries: goal.dayEntries?.map(parseDayEntry) || [],
    }));
  },
  getById: async (id: string) => {
    const goal = await api.get<Goal>(`/goals/${id}`);
    return {
      ...goal,
      dayEntries: goal.dayEntries?.map(parseDayEntry) || [],
    };
  },
  create: (goal: Omit<Goal, 'id' | 'createdAt'>) => api.post<Goal>('/goals', goal),
  update: (id: string, updates: Partial<Goal>) => api.put<Goal>(`/goals/${id}`, updates),
  delete: (id: string) => api.delete<void>(`/goals/${id}`),

  // Day Entries
  getEntriesByGoal: async (goalId: string) => {
    const entries = await api.get<DayEntry[]>(`/day-entries/goal/${goalId}`);
    return entries.map(parseDayEntry);
  },
  getEntryById: async (id: string) => {
    const entry = await api.get<DayEntry>(`/day-entries/${id}`);
    return parseDayEntry(entry);
  },
  getEntriesByDateRange: async (startDate: string, endDate: string) => {
    const entries = await api.get<DayEntry[]>(`/day-entries/date/${startDate}/${endDate}`);
    return entries.map(parseDayEntry);
  },
  upsertEntry: (entry: Omit<DayEntry, 'id'>) => api.post<DayEntry>('/day-entries', entry),
  updateEntry: (id: string, updates: Partial<DayEntry>) =>
    api.put<DayEntry>(`/day-entries/${id}`, updates),
  deleteEntry: (id: string) => api.delete<void>(`/day-entries/${id}`),
};
