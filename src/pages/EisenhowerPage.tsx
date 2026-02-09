import { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEisenhower } from '@/hooks/useEisenhower';
import { EisenhowerQuadrantComponent } from '@/components/EisenhowerQuadrant';
import { OperationAnalytics } from '@/components/OperationAnalytics';
import { EisenhowerQuadrant, EisenhowerTask, QUADRANT_CONFIG } from '@/types/eisenhower';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, LayoutGrid, CheckCircle2, BarChart3, Undo2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const QUADRANTS: EisenhowerQuadrant[] = ['do-first', 'schedule', 'delegate', 'eliminate'];

const EisenhowerPage = () => {
  const { addTask, updateTask, deleteTask, completeTask, uncompleteTask, moveTask, getTasksByQuadrant, getCompletedTasks } = useEisenhower();
  const [draggedTask, setDraggedTask] = useState<EisenhowerTask | null>(null);

  const handleDragStart = (e: React.DragEvent, task: EisenhowerTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
      setTimeout(() => {
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.style.opacity = '1';
        }
      }, 0);
    }
  };

  const handleDrop = (_e: React.DragEvent, quadrant: EisenhowerQuadrant) => {
    if (draggedTask && draggedTask.quadrant !== quadrant) {
      moveTask(draggedTask.id, quadrant);
    }
    setDraggedTask(null);
  };

  const handleAdd = (task: { title: string; description?: string; quadrant: EisenhowerQuadrant; delegateTo?: string }) => {
    addTask(task);
  };

  const stats = QUADRANTS.map((q) => ({
    quadrant: q,
    count: getTasksByQuadrant(q).length,
    config: QUADRANT_CONFIG[q],
  }));
  const totalActive = stats.reduce((sum, s) => sum + s.count, 0);
  const completedTasks = getCompletedTasks();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="font-semibold text-sm flex items-center gap-2">
              Operation
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  Prioritize tasks by urgency and importance. Drag tasks between quadrants.
                </TooltipContent>
              </Tooltip>
            </h1>
            <p className="text-xs text-muted-foreground">{totalActive} active tasks</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {stats.map((s) => (
            <div
              key={s.quadrant}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full"
              style={{
                backgroundColor: `hsl(${s.config.hue} 70% 95%)`,
                color: `hsl(${s.config.hue} 70% 35%)`,
              }}
            >
              <span>{s.config.icon}</span>
              <span className="font-semibold">{s.count}</span>
            </div>
          ))}
        </div>
      </header>

      <Tabs defaultValue="in-progress" className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pt-2 shrink-0 overflow-x-auto">
          <TabsList>
            <TabsTrigger value="in-progress" className="flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Active</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
              {completedTasks.length > 0 && (
                <span className="text-[10px] bg-muted px-1.5 rounded-full font-mono">{completedTasks.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="in-progress" className="flex-1 overflow-hidden mt-0">
          <div className="relative h-full">
            {/* Axis labels - hidden on mobile */}
            <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 z-10 items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              <span className="text-destructive">← Urgent</span>
              <span className="w-px h-3 bg-border" />
              <span className="text-muted-foreground/50">Not Urgent →</span>
            </div>
            <div className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10">
              <div className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-widest" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
                <span className="text-primary rotate-180">← Important</span>
                <span className="w-3 h-px bg-border" />
                <span className="text-muted-foreground/50 rotate-180">Not Important →</span>
              </div>
            </div>

            {/* Grid - 2x2 on desktop, single column on mobile */}
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 md:pl-8 md:pt-8 sm:grid-rows-2 sm:h-full">
                {QUADRANTS.map((q) => (
                  <EisenhowerQuadrantComponent
                    key={q}
                    quadrant={q}
                    tasks={getTasksByQuadrant(q)}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    onUpdate={updateTask}
                    onAdd={handleAdd}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-hidden px-4 pb-4 mt-0">
          <ScrollArea className="h-full pt-3">
            {completedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No completed tasks yet</p>
                <p className="text-xs mt-1">Complete tasks from the matrix to see them here</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-3xl mx-auto">
                {completedTasks.map((task) => {
                  const config = QUADRANT_CONFIG[task.quadrant];
                  return (
                    <Card key={task.id} className="shadow-sm border-l-4 border-l-primary bg-primary/5">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="text-sm shrink-0">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-through text-muted-foreground">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span className={cn('px-1.5 py-0.5 rounded text-[10px]', config.badgeClass)}>
                                  {config.label}
                                </span>
                                {task.delegateTo && (
                                  <span className="flex items-center gap-1">👥 {task.delegateTo}</span>
                                )}
                                {task.completedAt && (
                                  <span className="text-green-600 dark:text-green-400">
                                    ✓ {format(parseISO(task.completedAt), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => uncompleteTask(task.id)} title="Move back to matrix">
                              <Undo2 className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteTask(task.id)}>
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
          <OperationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EisenhowerPage;
