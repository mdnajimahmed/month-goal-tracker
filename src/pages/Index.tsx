import { GoalGrid } from '@/components/GoalGrid';
import { AnalyticsView } from '@/components/AnalyticsView';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle2, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 py-2 border-b bg-card shrink-0">
        <SidebarTrigger />
        <div>
          <h1 className="font-semibold text-sm">Execution</h1>
          <p className="text-xs text-muted-foreground">Daily goal tracking grid</p>
        </div>
      </header>

      <Tabs defaultValue="in-progress" className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pt-2 shrink-0 overflow-x-auto">
          <TabsList>
            <TabsTrigger value="in-progress" className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Active</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="in-progress" className="flex-1 overflow-hidden mt-0">
          <GoalGrid />
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-hidden mt-0">
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <Target className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Goal execution completions</p>
            <p className="text-xs mt-1 text-center">Goals that reach their target end date will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 overflow-hidden mt-0">
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
