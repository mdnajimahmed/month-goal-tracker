import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Goal,
  DayEntry,
  MonthData,
  DayStatus,
  TimeBlock,
  GoalAnalytics,
  MonthAnalytics,
} from '@/types/goals';

const STORAGE_KEY = 'goal-tracker-data';

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

export const useGoalTracker = () => {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [allMonthData, setAllMonthData] = useState<Record<string, MonthData>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });

  const monthKey = getMonthKey(currentYear, currentMonth);

  const monthData: MonthData = allMonthData[monthKey] || {
    year: currentYear,
    month: currentMonth,
    goals: [],
    entries: [],
    nonOfficeDays: getWeekendDays(currentYear, currentMonth),
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMonthData));
  }, [allMonthData]);

  const updateMonthData = useCallback((updater: (data: MonthData) => MonthData) => {
    setAllMonthData((prev) => ({
      ...prev,
      [monthKey]: updater(prev[monthKey] || {
        year: currentYear,
        month: currentMonth,
        goals: [],
        entries: [],
        nonOfficeDays: getWeekendDays(currentYear, currentMonth),
      }),
    }));
  }, [monthKey, currentYear, currentMonth]);

  // Goal CRUD
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    updateMonthData((data) => ({
      ...data,
      goals: [...data.goals, newGoal],
    }));
    return newGoal;
  }, [updateMonthData]);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    updateMonthData((data) => ({
      ...data,
      goals: data.goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)),
    }));
  }, [updateMonthData]);

  const deleteGoal = useCallback((goalId: string) => {
    updateMonthData((data) => ({
      ...data,
      goals: data.goals.filter((g) => g.id !== goalId),
      entries: data.entries.filter((e) => e.goalId !== goalId),
    }));
  }, [updateMonthData]);

  // Entry CRUD
  const getEntry = useCallback((goalId: string, date: string): DayEntry | undefined => {
    return monthData.entries.find((e) => e.goalId === goalId && e.date === date);
  }, [monthData.entries]);

  const updateEntry = useCallback((goalId: string, date: string, updates: Partial<DayEntry>) => {
    updateMonthData((data) => {
      const existingIndex = data.entries.findIndex(
        (e) => e.goalId === goalId && e.date === date
      );

      if (existingIndex >= 0) {
        const newEntries = [...data.entries];
        newEntries[existingIndex] = { ...newEntries[existingIndex], ...updates };
        return { ...data, entries: newEntries };
      } else {
        const newEntry: DayEntry = {
          id: uuidv4(),
          goalId,
          date,
          status: 'pending',
          actualMinutes: 0,
          comment: '',
          timeBlocks: [],
          ...updates,
        };
        return { ...data, entries: [...data.entries, newEntry] };
      }
    });
  }, [updateMonthData]);

  const toggleDayStatus = useCallback((goalId: string, date: string) => {
    const entry = getEntry(goalId, date);
    const currentStatus: DayStatus = entry?.status || 'pending';
    const statusOrder: DayStatus[] = ['pending', 'hit', 'partial', 'miss'];
    const nextIndex = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    updateEntry(goalId, date, { status: statusOrder[nextIndex] });
  }, [getEntry, updateEntry]);

  // Time blocks
  const addTimeBlock = useCallback((goalId: string, date: string, block: Omit<TimeBlock, 'id'>) => {
    const entry = getEntry(goalId, date);
    const newBlock: TimeBlock = { ...block, id: uuidv4() };
    const timeBlocks = [...(entry?.timeBlocks || []), newBlock];
    updateEntry(goalId, date, { timeBlocks });
  }, [getEntry, updateEntry]);

  const removeTimeBlock = useCallback((goalId: string, date: string, blockId: string) => {
    const entry = getEntry(goalId, date);
    if (entry) {
      const timeBlocks = entry.timeBlocks.filter((b) => b.id !== blockId);
      updateEntry(goalId, date, { timeBlocks });
    }
  }, [getEntry, updateEntry]);

  // Non-office days
  const toggleNonOfficeDay = useCallback((day: number) => {
    updateMonthData((data) => {
      const isNonOffice = data.nonOfficeDays.includes(day);
      return {
        ...data,
        nonOfficeDays: isNonOffice
          ? data.nonOfficeDays.filter((d) => d !== day)
          : [...data.nonOfficeDays, day].sort((a, b) => a - b),
      };
    });
  }, [updateMonthData]);

  // Month navigation
  const goToMonth = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
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
  const carryForwardGoals = useCallback(() => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const nextKey = getMonthKey(nextYear, nextMonth);

    setAllMonthData((prev) => {
      const existingNextMonth = prev[nextKey];
      const goalsToCarry = monthData.goals.map((g) => ({
        ...g,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      }));

      return {
        ...prev,
        [nextKey]: {
          year: nextYear,
          month: nextMonth,
          goals: existingNextMonth ? [...existingNextMonth.goals, ...goalsToCarry] : goalsToCarry,
          entries: existingNextMonth?.entries || [],
          nonOfficeDays: existingNextMonth?.nonOfficeDays || getWeekendDays(nextYear, nextMonth),
        },
      };
    });

    // Navigate to next month
    goToMonth(nextYear, nextMonth);
  }, [currentMonth, currentYear, monthData.goals, goToMonth]);

  // Analytics
  const calculateGoalAnalytics = useCallback((goalId: string): GoalAnalytics => {
    const goal = monthData.goals.find((g) => g.id === goalId);
    const entries = monthData.entries.filter((e) => e.goalId === goalId);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
    const effectiveDays = isCurrentMonth ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

    const hitDays = entries.filter((e) => e.status === 'hit').length;
    const missDays = entries.filter((e) => e.status === 'miss').length;
    const partialDays = entries.filter((e) => e.status === 'partial').length;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let day = 1; day <= effectiveDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = entries.find((e) => e.date === dateStr);
      if (entry?.status === 'hit') {
        tempStreak++;
        if (day === effectiveDays) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Missed reason breakdown
    const missedReasonBreakdown: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.status === 'miss' && e.missedReason) {
        missedReasonBreakdown[e.missedReason] = (missedReasonBreakdown[e.missedReason] || 0) + 1;
      }
    });

    const totalActualMinutes = entries.reduce((sum, e) => sum + e.actualMinutes, 0);
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
  }, [monthData, currentYear, currentMonth]);

  const calculateMonthAnalytics = useCallback((): MonthAnalytics => {
    const goalAnalytics = monthData.goals.map((g) => calculateGoalAnalytics(g.id));
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // Overall completion rate
    const totalHits = goalAnalytics.reduce((sum, ga) => sum + ga.hitDays, 0);
    const totalDays = goalAnalytics.reduce((sum, ga) => sum + ga.totalDays, 0);
    const overallCompletionRate = totalDays > 0 ? (totalHits / totalDays) * 100 : 0;

    // Best/worst performing goals
    const sortedByRate = [...goalAnalytics].sort((a, b) => b.completionRate - a.completionRate);
    const bestPerformingGoal = sortedByRate[0]?.goalId || null;
    const worstPerformingGoal = sortedByRate[sortedByRate.length - 1]?.goalId || null;

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
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = monthData.entries.filter((e) => e.date === dateStr);
      const hits = dayEntries.filter((e) => e.status === 'hit').length;
      const rate = monthData.goals.length > 0 ? (hits / monthData.goals.length) * 100 : 0;
      dailyHitRate.push({ date: dateStr, rate });
    }

    return {
      totalGoals: monthData.goals.length,
      overallCompletionRate,
      bestPerformingGoal,
      worstPerformingGoal,
      mostFrequentMissedReasons,
      dailyHitRate,
      goalAnalytics,
    };
  }, [monthData, currentYear, currentMonth, calculateGoalAnalytics]);

  return {
    // State
    currentYear,
    currentMonth,
    monthData,
    daysInMonth: getDaysInMonth(currentYear, currentMonth),

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
