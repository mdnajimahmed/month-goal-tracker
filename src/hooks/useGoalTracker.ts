import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Goal,
  DayEntry,
  MonthData,
  DayStatus,
  TimeBlock,
  GoalAnalytics,
  MonthAnalytics,
  isGoalActiveOnDay,
} from '@/types/goals';
import { goalsApi } from '@/lib/api/goals';

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

const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const useGoalTracker = () => {
  const queryClient = useQueryClient();
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // Fetch all goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll(),
  });

  // Fetch entries for current month
  const startDate = formatDate(currentYear, currentMonth, 1);
  const endDate = formatDate(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));
  
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['day-entries', startDate, endDate],
    queryFn: () => goalsApi.getEntriesByDateRange(startDate, endDate),
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      goalsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['day-entries'] });
    },
  });

  // Upsert entry mutation
  const upsertEntryMutation = useMutation({
    mutationFn: goalsApi.upsertEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-entries'] });
    },
  });

  // Update entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DayEntry> }) =>
      goalsApi.updateEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-entries'] });
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: goalsApi.deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-entries'] });
    },
  });

  // Filter goals for current month (based on creation date or target month)
  // For now, we'll show all goals and let the user filter by month if needed
  // In a real app, you might want to add a month field to goals
  const monthGoals = goals;

  const monthEntries = entries.filter((entry) => {
    const entryYear = parseInt(entry.date.split('-')[0]);
    const entryMonth = parseInt(entry.date.split('-')[1]) - 1;
    return entryYear === currentYear && entryMonth === currentMonth;
  });

  const monthData: MonthData = {
    year: currentYear,
    month: currentMonth,
    goals: monthGoals,
    entries: monthEntries,
    nonOfficeDays: getWeekendDays(currentYear, currentMonth),
  };

  // Goal CRUD
  const addGoal = useCallback(
    async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
      return createGoalMutation.mutateAsync(goal);
    },
    [createGoalMutation]
  );

  const updateGoal = useCallback(
    async (goalId: string, updates: Partial<Goal>) => {
      return updateGoalMutation.mutateAsync({ id: goalId, updates });
    },
    [updateGoalMutation]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      return deleteGoalMutation.mutateAsync(goalId);
    },
    [deleteGoalMutation]
  );

  // Entry CRUD
  const getEntry = useCallback(
    (goalId: string, date: string): DayEntry | undefined => {
      return monthEntries.find((e) => e.goalId === goalId && e.date === date);
    },
    [monthEntries]
  );

  const updateEntry = useCallback(
    async (goalId: string, date: string, updates: Partial<DayEntry>) => {
      const existingEntry = getEntry(goalId, date);
      
      if (existingEntry) {
        // Update existing entry
        return updateEntryMutation.mutateAsync({
          id: existingEntry.id,
          updates,
        });
      } else {
        // Create new entry
        const newEntry: Omit<DayEntry, 'id'> = {
          goalId,
          date,
          status: 'miss',
          actualMinutes: 0,
          comment: '',
          timeBlocks: [],
          ...updates,
        };
        return upsertEntryMutation.mutateAsync(newEntry);
      }
    },
    [getEntry, updateEntryMutation, upsertEntryMutation]
  );

  const toggleDayStatus = useCallback(
    async (goalId: string, date: string) => {
      const entry = getEntry(goalId, date);
      const currentStatus: DayStatus = entry?.status || 'miss';
      const statusOrder: DayStatus[] = ['hit', 'partial', 'miss'];
      const nextIndex = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
      await updateEntry(goalId, date, { status: statusOrder[nextIndex] });
    },
    [getEntry, updateEntry]
  );

  // Time blocks
  const addTimeBlock = useCallback(
    async (goalId: string, date: string, block: Omit<TimeBlock, 'id'>) => {
      const entry = getEntry(goalId, date);
      const newBlock: TimeBlock = { ...block, id: crypto.randomUUID() };
      const timeBlocks = [...(entry?.timeBlocks || []), newBlock];
      await updateEntry(goalId, date, { timeBlocks });
    },
    [getEntry, updateEntry]
  );

  const removeTimeBlock = useCallback(
    async (goalId: string, date: string, blockId: string) => {
      const entry = getEntry(goalId, date);
      if (entry) {
        const timeBlocks = entry.timeBlocks.filter((b) => b.id !== blockId);
        await updateEntry(goalId, date, { timeBlocks });
      }
    },
    [getEntry, updateEntry]
  );

  // Non-office days (stored locally for now, can be moved to backend later)
  const [nonOfficeDays, setNonOfficeDays] = useState<number[]>(() =>
    getWeekendDays(currentYear, currentMonth)
  );

  // Update non-office days when month changes
  useEffect(() => {
    setNonOfficeDays(getWeekendDays(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  const toggleNonOfficeDay = useCallback(
    (day: number) => {
      setNonOfficeDays((prev) => {
        const isNonOffice = prev.includes(day);
        return isNonOffice
          ? prev.filter((d) => d !== day)
          : [...prev, day].sort((a, b) => a - b);
      });
    },
    []
  );

  // Month navigation
  const goToMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setNonOfficeDays(getWeekendDays(year, month));
  }, []);

  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  // Carry forward goals to next month
  const carryForwardGoals = useCallback(async () => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    // Create copies of current goals for next month
    for (const goal of monthGoals) {
      const { id, createdAt, ...goalData } = goal;
      await addGoal(goalData);
    }

    // Navigate to next month
    goToMonth(nextYear, nextMonth);
  }, [currentMonth, currentYear, monthGoals, addGoal, goToMonth]);

  // Analytics
  const calculateGoalAnalytics = useCallback(
    (goalId: string): GoalAnalytics => {
      const goal = monthGoals.find((g) => g.id === goalId);
      const goalEntries = monthEntries.filter((e) => e.goalId === goalId);
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const today = new Date();
      const isCurrentMonth =
        today.getFullYear() === currentYear && today.getMonth() === currentMonth;
      const lastDay = isCurrentMonth
        ? Math.min(today.getDate(), daysInMonth)
        : daysInMonth;

      // For scoped goals, only count active days
      const isWeekendGoal = goal?.isWeekendGoal || false;
      const isWeekdayGoal = goal?.isWeekdayGoal || false;
      let effectiveDays = 0;
      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        if (goal && !isGoalActiveOnDay(goal, dayOfWeek)) continue;
        effectiveDays++;
      }

      const hitDays = goalEntries.filter((e) => e.status === 'hit').length;
      const missDays = goalEntries.filter((e) => e.status === 'miss').length;
      const partialDays = goalEntries.filter((e) => e.status === 'partial').length;

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        if (goal && !isGoalActiveOnDay(goal, dayOfWeek)) continue;

        const dateStr = formatDate(currentYear, currentMonth, day);
        const entry = goalEntries.find((e) => e.date === dateStr);
        if (entry?.status === 'hit') {
          tempStreak++;
          if (day === lastDay) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Missed reason breakdown
      const missedReasonBreakdown: Record<string, number> = {};
      goalEntries.forEach((e) => {
        if (e.status === 'miss' && e.missedReason) {
          missedReasonBreakdown[e.missedReason] =
            (missedReasonBreakdown[e.missedReason] || 0) + 1;
        }
      });

      const totalActualMinutes = goalEntries.reduce(
        (sum, e) => sum + e.actualMinutes,
        0
      );
      const totalAllocatedMinutes = effectiveDays * (goal?.allocatedMinutes || 0);

      return {
        goalId,
        totalDays: effectiveDays,
        hitDays,
        missDays,
        partialDays,
        currentStreak,
        longestStreak,
        completionRate: effectiveDays > 0 ? (hitDays / effectiveDays) * 100 : 0,
        totalAllocatedMinutes,
        totalActualMinutes,
        missedReasonBreakdown,
      };
    },
    [monthGoals, monthEntries, currentYear, currentMonth]
  );

  const calculateMonthAnalytics = useCallback((): MonthAnalytics => {
    const goalAnalytics = monthGoals.map((g) => calculateGoalAnalytics(g.id));
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // Overall completion rate
    const totalHits = goalAnalytics.reduce((sum, ga) => sum + ga.hitDays, 0);
    const totalDays = goalAnalytics.reduce((sum, ga) => sum + ga.totalDays, 0);
    const overallCompletionRate =
      totalDays > 0 ? (totalHits / totalDays) * 100 : 0;

    // Best/worst performing goals
    const sortedByRate = [...goalAnalytics].sort(
      (a, b) => b.completionRate - a.completionRate
    );
    const bestPerformingGoal = sortedByRate[0]?.goalId || null;
    const worstPerformingGoal =
      sortedByRate[sortedByRate.length - 1]?.goalId || null;

    // Most frequent missed reasons
    const reasonCounts: Record<string, number> = {};
    goalAnalytics.forEach((ga) => {
      Object.entries(ga.missedReasonBreakdown).forEach(([reason, count]) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + count;
      });
    });
    const mostFrequentMissedReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily hit rate
    const dailyHitRate: { date: string; rate: number }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentYear, currentMonth, day);
      const dayEntries = monthEntries.filter((e) => e.date === dateStr);
      const hits = dayEntries.filter((e) => e.status === 'hit').length;
      const rate = monthGoals.length > 0 ? (hits / monthGoals.length) * 100 : 0;
      dailyHitRate.push({ date: dateStr, rate });
    }

    return {
      totalGoals: monthGoals.length,
      overallCompletionRate,
      bestPerformingGoal,
      worstPerformingGoal,
      mostFrequentMissedReasons,
      dailyHitRate,
      goalAnalytics,
    };
  }, [monthGoals, monthEntries, currentYear, currentMonth, calculateGoalAnalytics]);

  return {
    // State
    currentYear,
    currentMonth,
    monthData: {
      ...monthData,
      nonOfficeDays,
    },
    daysInMonth: getDaysInMonth(currentYear, currentMonth),
    isLoading: goalsLoading || entriesLoading,

    // Goal operations
    addGoal,
    updateGoal,
    deleteGoal,

    // Entry operations
    getEntry,
    updateEntry,
    toggleDayStatus,

    // Time blocks
    addTimeBlock,
    removeTimeBlock,

    // Non-office days
    toggleNonOfficeDay,

    // Navigation
    goToMonth,
    goToPreviousMonth,
    goToNextMonth,
    carryForwardGoals,

    // Analytics
    calculateGoalAnalytics,
    calculateMonthAnalytics,
  };
};
