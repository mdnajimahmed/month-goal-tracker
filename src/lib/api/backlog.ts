import { api } from './config';
import { BacklogItem, BacklogCategory } from '@/types/backlog';

export const backlogApi = {
  getAll: (params?: { category?: BacklogCategory; priority?: string; completed?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.completed !== undefined) searchParams.append('completed', String(params.completed));
    const query = searchParams.toString();
    return api.get<BacklogItem[]>(`/backlog${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<BacklogItem>(`/backlog/${id}`),
  create: (item: Omit<BacklogItem, 'id' | 'createdAt'>) =>
    api.post<BacklogItem>('/backlog', item),
  update: (id: string, updates: Partial<BacklogItem>) =>
    api.put<BacklogItem>(`/backlog/${id}`, updates),
  complete: (id: string) => api.post<BacklogItem>(`/backlog/${id}/complete`),
  uncomplete: (id: string) => api.post<BacklogItem>(`/backlog/${id}/uncomplete`),
  delete: (id: string) => api.delete<void>(`/backlog/${id}`),
};
