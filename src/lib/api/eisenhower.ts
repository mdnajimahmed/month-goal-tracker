import { api } from './config';
import { EisenhowerTask, EisenhowerQuadrant } from '@/types/eisenhower';

export const eisenhowerApi = {
  getAll: (params?: { quadrant?: EisenhowerQuadrant; completed?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.quadrant) searchParams.append('quadrant', params.quadrant);
    if (params?.completed !== undefined) searchParams.append('completed', String(params.completed));
    const query = searchParams.toString();
    return api.get<EisenhowerTask[]>(`/eisenhower${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get<EisenhowerTask>(`/eisenhower/${id}`),
  create: (task: Omit<EisenhowerTask, 'id' | 'createdAt'>) =>
    api.post<EisenhowerTask>('/eisenhower', task),
  update: (id: string, updates: Partial<EisenhowerTask>) =>
    api.put<EisenhowerTask>(`/eisenhower/${id}`, updates),
  complete: (id: string) => api.post<EisenhowerTask>(`/eisenhower/${id}/complete`),
  uncomplete: (id: string) => api.post<EisenhowerTask>(`/eisenhower/${id}/uncomplete`),
  move: (id: string, quadrant: EisenhowerQuadrant) =>
    api.post<EisenhowerTask>(`/eisenhower/${id}/move`, { quadrant }),
  delete: (id: string) => api.delete<void>(`/eisenhower/${id}`),
};
