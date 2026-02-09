import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BacklogItem, BacklogCategory } from '@/types/backlog';
import { backlogApi } from '@/lib/api/backlog';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

export const useBacklog = () => {
  const queryClient = useQueryClient();

  // Fetch all backlog items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['backlog-items'],
    queryFn: () => backlogApi.getAll(),
  });

  // Auto-complete overdue items (client-side logic)
  const processedItems = items.map((item) => {
    if (!item.completedAt) {
      const today = startOfDay(new Date());
      if (isBefore(parseISO(item.tentativeStartDate), today)) {
        // Note: This is client-side only. In production, you might want to handle this server-side
        return { ...item, completedAt: new Date().toISOString() };
      }
    }
    return item;
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: backlogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-items'] });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BacklogItem> }) =>
      backlogApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-items'] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: backlogApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-items'] });
    },
  });

  // Complete item mutation
  const completeItemMutation = useMutation({
    mutationFn: backlogApi.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-items'] });
    },
  });

  // Uncomplete item mutation
  const uncompleteItemMutation = useMutation({
    mutationFn: backlogApi.uncomplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-items'] });
    },
  });

  const addItem = async (item: Omit<BacklogItem, 'id' | 'createdAt'>) => {
    return createItemMutation.mutateAsync(item);
  };

  const updateItem = async (id: string, updates: Partial<Omit<BacklogItem, 'id' | 'createdAt'>>) => {
    return updateItemMutation.mutateAsync({ id, updates });
  };

  const deleteItem = async (id: string) => {
    return deleteItemMutation.mutateAsync(id);
  };

  const completeItem = async (id: string) => {
    return completeItemMutation.mutateAsync(id);
  };

  const uncompleteItem = async (id: string) => {
    return uncompleteItemMutation.mutateAsync(id);
  };

  const getItemsByCategory = (category: BacklogCategory) => {
    return processedItems.filter((item) => item.category === category && !item.completedAt);
  };

  const getCompletedItems = () => {
    return processedItems
      .filter((item) => !!item.completedAt)
      .sort((a, b) => {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      });
  };

  // Reorder items (client-side only for now)
  const reorderItems = (category: BacklogCategory, draggedId: string, targetId: string) => {
    const categoryItems = processedItems.filter(
      (item) => item.category === category && !item.completedAt
    );
    const otherItems = processedItems.filter(
      (item) => item.category !== category || !!item.completedAt
    );

    const draggedIndex = categoryItems.findIndex((item) => item.id === draggedId);
    const targetIndex = categoryItems.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = categoryItems.splice(draggedIndex, 1);
    categoryItems.splice(targetIndex, 0, draggedItem);

    // Note: This doesn't persist order to backend. You'd need to add an order field to the schema.
    // For now, this is client-side only.
    queryClient.setQueryData(['backlog-items'], [...otherItems, ...categoryItems]);
  };

  return {
    items: processedItems,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    completeItem,
    uncompleteItem,
    getItemsByCategory,
    getCompletedItems,
    reorderItems,
  };
};
