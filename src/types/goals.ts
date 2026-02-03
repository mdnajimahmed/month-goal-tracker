export interface Goal {
  id: string;
  title: string;
  startTime: string; // "07:00" format
  endTime: string; // "07:30" format
  allocatedMinutes: number;
  tags: string[];
  createdAt: string;
  targetEndDate?: string; // "2025-03-15" format - when goal should be completed
}

export type DayStatus = 'hit' | 'miss' | 'partial' | 'pending';

export interface DayEntry {
  id: string;
  goalId: string;
  date: string; // "2025-01-15" format
  status: DayStatus;
  actualMinutes: number;
  comment: string;
  missedReason?: string;
  timeBlocks: TimeBlock[];
}

export interface TimeBlock {
  id: string;
  startTime: string; // "07:00" format
  endTime: string; // "07:25" format
  type: 'executed' | 'blocked';
  note?: string;
}

export interface MonthData {
  year: number;
  month: number; // 0-11
  goals: Goal[];
  entries: DayEntry[];
  nonOfficeDays: number[]; // Array of day numbers (1-31) that are non-office days
}

export const MISSED_REASONS = [
  'Meeting',
  'Fatigue',
  'Travel',
  'Emergency',
  'Laziness',
  'Blocked',
  'Sick',
  'Family',
  'Technical Issues',
  'Priority Shift',
  'Late Wakeup',
  'Early Sleep',
  'Late Office Return',
  'Overslept',
  'Vacation',
  'Holiday',
  'Training',
  'Deadline',
  'Interview',
  'Networking',
  'Client Call',
  'Team Event',
  'Personal',
  'Weather',
  'Commute',
  'Equipment Failure',
  'Power Outage',
  'Internet Issues',
  'Mental Health',
  'Physical Health',
  'Forgot',
  'Procrastination',
  'Burnout',
  'No Motivation',
  'Distracted',
  'Social Event',
  'Gym',
  'Errands',
  'Other',
] as const;

export type MissedReason = typeof MISSED_REASONS[number];

export interface GoalAnalytics {
  goalId: string;
  totalDays: number;
  hitDays: number;
  missDays: number;
  partialDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalAllocatedMinutes: number;
  totalActualMinutes: number;
  missedReasonBreakdown: Record<string, number>;
}

export interface MonthAnalytics {
  totalGoals: number;
  overallCompletionRate: number;
  bestPerformingGoal: string | null;
  worstPerformingGoal: string | null;
  mostFrequentMissedReasons: { reason: string; count: number }[];
  dailyHitRate: { date: string; rate: number }[];
  goalAnalytics: GoalAnalytics[];
}

export type ViewMode = 'grid' | 'daily' | 'analytics';
