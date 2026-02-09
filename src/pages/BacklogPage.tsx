import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBacklog } from '@/hooks/useBacklog';
import { BacklogColumn } from '@/components/BacklogColumn';
import { AddBacklogDialog } from '@/components/AddBacklogDialog';
import { VisionAnalytics } from '@/components/VisionAnalytics';
import { BACKLOG_CATEGORIES } from '@/types/backlog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Telescope, CheckCircle2, BarChart3, Undo2, Trash2, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const priorityBadge = {
  high: { letter: 'H', bg: 'bg-red-500', text: 'text-white' },
  medium: { letter: 'M', bg: 'bg-yellow-500', text: 'text-white' },
  low: { letter: 'L', bg: 'bg-blue-500', text: 'text-white' },
};

const BacklogPage = () => {
  const { addItem, updateItem, deleteItem, completeItem, uncompleteItem, getItemsByCategory, getCompletedItems, reorderItems } = useBacklog();
  const completedItems = getCompletedItems();

  const getCategoryLabel = (key: string) => BACKLOG_CATEGORIES.find(c => c.key === key)?.label || key;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm">Vision</h1>
            <p className="text-xs text-muted-foreground truncate">Plan your learning journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-3 text-xs mr-4">
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
          <AddBacklogDialog onAdd={addItem} />
        </div>
      </header>

      <Tabs defaultValue="in-progress" className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pt-2 shrink-0 overflow-x-auto">
          <TabsList>
            <TabsTrigger value="in-progress" className="flex items-center gap-1.5">
              <Telescope className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Active</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
              {completedItems.length > 0 && (
                <span className="text-[10px] bg-muted px-1.5 rounded-full font-mono">{completedItems.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="in-progress" className="flex-1 overflow-x-auto p-4 mt-0">
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
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-hidden px-4 pb-4 mt-0">
          <ScrollArea className="h-full pt-3">
            {completedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No completed items yet</p>
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
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{getCategoryLabel(item.category)}</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Due: {format(parseISO(item.tentativeStartDate), 'MMM d, yyyy')}</span>
                                </div>
                                {item.estimatedHours != null && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.estimatedHours}h est</span>
                                  </div>
                                )}
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
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 overflow-hidden mt-0">
          <VisionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BacklogPage;
