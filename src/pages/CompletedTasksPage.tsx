import { Link } from 'react-router-dom';
import { ArrowLeft, Undo2, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBacklog } from '@/hooks/useBacklog';
import { BACKLOG_CATEGORIES } from '@/types/backlog';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const priorityBadge = {
  high: { letter: 'H', bg: 'bg-red-500', text: 'text-white' },
  medium: { letter: 'M', bg: 'bg-yellow-500', text: 'text-white' },
  low: { letter: 'L', bg: 'bg-blue-500', text: 'text-white' },
};

const CompletedTasksPage = () => {
  const { getCompletedItems, uncompleteItem, deleteItem } = useBacklog();
  const completedItems = getCompletedItems();

  const getCategoryLabel = (key: string) => {
    return BACKLOG_CATEGORIES.find(c => c.key === key)?.label || key;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/backlog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-sm">Completed Tasks</h1>
            <p className="text-xs text-muted-foreground">{completedItems.length} items completed</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full">
          {completedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No completed tasks yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-w-3xl mx-auto">
              {completedItems.map((item) => {
                const badge = priorityBadge[item.priority];
                return (
                  <Card key={item.id} className="shadow-sm border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/10">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', badge.bg, badge.text)}>
                            {badge.letter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-through text-muted-foreground">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{getCategoryLabel(item.category)}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Due: {format(parseISO(item.tentativeStartDate), 'MMM d, yyyy')}</span>
                              </div>
                              {item.completedAt && (
                                <span className="text-green-600 dark:text-green-400">
                                  ✓ {format(parseISO(item.completedAt), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => uncompleteItem(item.id)} title="Move back to backlog">
                            <Undo2 className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
};

export default CompletedTasksPage;
