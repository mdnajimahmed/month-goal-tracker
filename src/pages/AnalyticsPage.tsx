import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsView } from '@/components/AnalyticsView';
import { OperationAnalytics } from '@/components/OperationAnalytics';
import { VisionAnalytics } from '@/components/VisionAnalytics';
import { Target, LayoutGrid, Telescope } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 py-2 border-b bg-card shrink-0">
        <SidebarTrigger />
        <div>
          <h1 className="font-semibold text-sm">Analytics</h1>
          <p className="text-xs text-muted-foreground">Performance insights across all categories</p>
        </div>
      </header>

      <Tabs defaultValue="execution" className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pt-2 shrink-0">
          <TabsList>
            <TabsTrigger value="execution" className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Execution
            </TabsTrigger>
            <TabsTrigger value="operation" className="flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              Operation
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-1.5">
              <Telescope className="h-3.5 w-3.5" />
              Vision
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="execution" className="flex-1 overflow-hidden mt-0">
          <AnalyticsView />
        </TabsContent>

        <TabsContent value="operation" className="flex-1 overflow-hidden mt-0">
          <OperationAnalytics />
        </TabsContent>

        <TabsContent value="vision" className="flex-1 overflow-hidden mt-0">
          <VisionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
