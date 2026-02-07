import { useState } from 'react';
import { BacklogItem, BacklogCategory } from '@/types/backlog';
import { BacklogCard } from './BacklogCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BacklogColumnProps {
  title: string;
  category: BacklogCategory;
  items: BacklogItem[];
  onUpdate: (id: string, updates: Partial<Omit<BacklogItem, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onReorder: (category: BacklogCategory, draggedId: string, targetId: string) => void;
}

export const BacklogColumn = ({ title, category, items, onUpdate, onDelete, onComplete, onReorder }: BacklogColumnProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      onReorder(category, sourceId, targetId);
    }
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px] flex-1">
      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-t-lg border border-b-0">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs bg-background px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <ScrollArea className="flex-1 border rounded-b-lg bg-muted/30">
        <div className="p-2 space-y-2" onDragEnd={handleDragEnd}>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No items</p>
          ) : (
            items.map((item) => (
              <BacklogCard
                key={item.id}
                item={item}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onComplete={onComplete}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={draggedId === item.id}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
