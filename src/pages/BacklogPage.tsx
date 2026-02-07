import { Link } from 'react-router-dom';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBacklog } from '@/hooks/useBacklog';
import { BacklogColumn } from '@/components/BacklogColumn';
import { AddBacklogDialog } from '@/components/AddBacklogDialog';
import { BACKLOG_CATEGORIES } from '@/types/backlog';

const BacklogPage = () => {
  const { addItem, updateItem, deleteItem, completeItem, getItemsByCategory, reorderItems } = useBacklog();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-sm">Backlog Management</h1>
            <p className="text-xs text-muted-foreground">Plan your learning journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 text-xs mr-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Future</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>&gt;1 month</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/completed">
              <CheckSquare className="h-4 w-4 mr-1" />
              Completed
            </Link>
          </Button>
          <AddBacklogDialog onAdd={addItem} />
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {BACKLOG_CATEGORIES.map((category) => (
            <BacklogColumn
              key={category.key}
              title={category.label}
              category={category.key}
              items={getItemsByCategory(category.key)}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onComplete={completeItem}
              onReorder={reorderItems}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default BacklogPage;
