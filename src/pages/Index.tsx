import { GoalGrid } from '@/components/GoalGrid';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, CheckCircle2 } from 'lucide-react';

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
        <div className="px-4 pt-2 shrink-0">
          <TabsList>
            <TabsTrigger value="in-progress" className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="in-progress" className="flex-1 overflow-hidden mt-0">
          <GoalGrid />
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-hidden mt-0">
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Target className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Goal execution completions</p>
            <p className="text-xs mt-1">Goals that reach their target end date will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
