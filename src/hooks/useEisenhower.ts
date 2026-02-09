import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EisenhowerTask, EisenhowerQuadrant } from '@/types/eisenhower';
import { eisenhowerApi } from '@/lib/api/eisenhower';

export const useEisenhower = () => {
  const queryClient = useQueryClient();

  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['eisenhower-tasks'],
    queryFn: () => eisenhowerApi.getAll(),
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: eisenhowerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower-tasks'] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EisenhowerTask> }) =>
      eisenhowerApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower-tasks'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: eisenhowerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower-tasks'] });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: eisenhowerApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower-tasks'] });
    },
  });

  // Uncomplete task mutation
  const uncompleteTaskMutation = useMutation({
    mutationFn: eisenhowerApi.uncomplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower-tasks'] });
    },
  });

  // Move task mutation
  const moveTaskMutation = useMutation({
    mutationFn: ({ id, quadrant }: { id: string; quadrant: EisenhowerQuadrant }) =>
      eisenhowerApi.move(id, quadrant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eisenhower-tasks'] });
    },
  });

  const addTask = async (task: Omit<EisenhowerTask, 'id' | 'createdAt'>) => {
    return createTaskMutation.mutateAsync(task);
  };

  const updateTask = async (id: string, updates: Partial<Omit<EisenhowerTask, 'id' | 'createdAt'>>) => {
    return updateTaskMutation.mutateAsync({ id, updates });
  };

  const deleteTask = async (id: string) => {
    return deleteTaskMutation.mutateAsync(id);
  };

  const completeTask = async (id: string) => {
    return completeTaskMutation.mutateAsync(id);
  };

  const uncompleteTask = async (id: string) => {
    return uncompleteTaskMutation.mutateAsync(id);
  };

  const moveTask = async (id: string, newQuadrant: EisenhowerQuadrant) => {
    return moveTaskMutation.mutateAsync({ id, quadrant: newQuadrant });
  };

  const getTasksByQuadrant = (quadrant: EisenhowerQuadrant) => {
    return tasks.filter((t) => t.quadrant === quadrant && !t.completedAt);
  };

  const getCompletedTasks = () => {
    return tasks
      .filter((t) => !!t.completedAt)
      .sort((a, b) => {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      });
  };

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    moveTask,
    getTasksByQuadrant,
    getCompletedTasks,
  };
};
