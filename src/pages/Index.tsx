import { GoalGrid } from '@/components/GoalGrid';

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* App header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">Rx</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Ruthless Execution</h1>
            <p className="text-xs text-muted-foreground">Self-discipline applied to priorities</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <GoalGrid />
      </main>
    </div>
  );
};

export default Index;
