import { useState, useEffect } from 'react';
import { BacklogItem, BacklogCategory } from '@/types/backlog';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, addMonths, subMonths, parseISO, isBefore, startOfDay } from 'date-fns';

const STORAGE_KEY = 'ruthless-execution-backlog';

const generateSeedData = (): BacklogItem[] => {
  const today = new Date();
  return [
    // Certifications
    { id: uuidv4(), title: 'AWS Solutions Architect', description: 'Professional certification exam prep', category: 'certifications', priority: 'high', tentativeStartDate: format(addDays(today, 14), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Kubernetes CKA', description: 'Certified Kubernetes Administrator', category: 'certifications', priority: 'medium', tentativeStartDate: format(subMonths(today, 2), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Google Cloud Professional', category: 'certifications', priority: 'low', tentativeStartDate: format(addMonths(today, 2), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    // Udemy
    { id: uuidv4(), title: 'React - Complete Guide', description: 'Maximilian course', category: 'udemy', priority: 'high', tentativeStartDate: format(subMonths(today, 1), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'System Design Masterclass', category: 'udemy', priority: 'medium', tentativeStartDate: format(addDays(today, 7), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    // Books
    { id: uuidv4(), title: 'Designing Data-Intensive Apps', description: 'Martin Kleppmann', category: 'books', priority: 'high', tentativeStartDate: format(today, 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Clean Architecture', description: 'Robert C. Martin', category: 'books', priority: 'medium', tentativeStartDate: format(addMonths(today, 1), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'The Pragmatic Programmer', category: 'books', priority: 'low', tentativeStartDate: format(subMonths(today, 3), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    // Interview
    { id: uuidv4(), title: 'LeetCode - Hard Problems', description: 'Complete 50 hard problems', category: 'interview', priority: 'high', tentativeStartDate: format(addDays(today, 3), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'System Design Practice', category: 'interview', priority: 'medium', tentativeStartDate: format(subMonths(today, 1), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    // Concepts
    { id: uuidv4(), title: 'Event Sourcing & CQRS', description: 'Deep dive into patterns', category: 'concepts', priority: 'medium', tentativeStartDate: format(addMonths(today, 1), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'GraphQL Federation', category: 'concepts', priority: 'low', tentativeStartDate: format(addDays(today, 21), 'yyyy-MM-dd'), createdAt: new Date().toISOString() },
  ];
};

export const useBacklog = () => {
  const [items, setItems] = useState<BacklogItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: BacklogItem[] = JSON.parse(stored);
      // Auto-complete overdue items (past tentativeStartDate and not already completed)
      const today = startOfDay(new Date());
      let changed = false;
      const updated = parsed.map(item => {
        if (!item.completedAt && isBefore(parseISO(item.tentativeStartDate), today)) {
          changed = true;
          return { ...item, completedAt: new Date().toISOString() };
        }
        return item;
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      setItems(updated);
    } else {
      const seedData = generateSeedData();
      // Auto-complete overdue seed items too
      const today = startOfDay(new Date());
      const seeded = seedData.map(item => {
        if (isBefore(parseISO(item.tentativeStartDate), today)) {
          return { ...item, completedAt: new Date().toISOString() };
        }
        return item;
      });
      setItems(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
  }, []);

  const saveItems = (newItems: BacklogItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const addItem = (item: Omit<BacklogItem, 'id' | 'createdAt'>) => {
    const newItem: BacklogItem = {
      ...item,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    saveItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<Omit<BacklogItem, 'id' | 'createdAt'>>) => {
    saveItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter(item => item.id !== id));
  };

  const completeItem = (id: string) => {
    saveItems(items.map(item => item.id === id ? { ...item, completedAt: new Date().toISOString() } : item));
  };

  const uncompleteItem = (id: string) => {
    saveItems(items.map(item => item.id === id ? { ...item, completedAt: undefined } : item));
  };

  const getItemsByCategory = (category: BacklogCategory) => {
    return items.filter(item => item.category === category && !item.completedAt);
  };

  const getCompletedItems = () => {
    return items.filter(item => !!item.completedAt).sort((a, b) => {
      return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
    });
  };

  const reorderItems = (category: BacklogCategory, draggedId: string, targetId: string) => {
    const categoryItems = items.filter(item => item.category === category && !item.completedAt);
    const otherItems = items.filter(item => item.category !== category || !!item.completedAt);
    
    const draggedIndex = categoryItems.findIndex(item => item.id === draggedId);
    const targetIndex = categoryItems.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const [draggedItem] = categoryItems.splice(draggedIndex, 1);
    categoryItems.splice(targetIndex, 0, draggedItem);
    
    saveItems([...otherItems, ...categoryItems]);
  };

  return {
    items,
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
