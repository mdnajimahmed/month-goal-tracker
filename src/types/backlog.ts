export type BacklogCategory = 'certifications' | 'udemy' | 'books' | 'interview' | 'concepts';
export type BacklogPriority = 'high' | 'medium' | 'low';

export interface BacklogItem {
  id: string;
  title: string;
  description?: string;
  category: BacklogCategory;
  priority: BacklogPriority;
  tentativeStartDate: string; // "2025-03-15" format
  createdAt: string;
  completedAt?: string; // ISO date string when item was completed
}

export const BACKLOG_CATEGORIES: { key: BacklogCategory; label: string }[] = [
  { key: 'certifications', label: 'Certifications' },
  { key: 'udemy', label: 'Udemy Course' },
  { key: 'books', label: 'Books' },
  { key: 'interview', label: 'Interview' },
  { key: 'concepts', label: 'Concepts/Others' },
];

export const BACKLOG_PRIORITIES: { key: BacklogPriority; label: string; color: string }[] = [
  { key: 'high', label: 'High', color: 'bg-red-500' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { key: 'low', label: 'Low', color: 'bg-blue-500' },
];
