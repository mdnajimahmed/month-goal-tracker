import { useState } from 'react';
import { GoalGrid } from '@/components/GoalGrid';
import { DailyDetailView } from '@/components/DailyDetailView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ViewMode } from '@/types/goals';
import { format } from 'date-fns';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('grid');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const handleSelectDay = (date: string) => {
    setSelectedDate(date);
    setCurrentView('daily');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* App header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">GT</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Goal Tracker</h1>
            <p className="text-xs text-muted-foreground">Month-by-month planning</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'grid' && (
          <GoalGrid 
            onViewChange={setCurrentView}
            onSelectDay={handleSelectDay}
          />
        )}
        {currentView === 'daily' && (
          <DailyDetailView 
            selectedDate={selectedDate}
            onBack={handleBackToGrid}
          />
        )}
        {currentView === 'analytics' && (
          <AnalyticsView onViewChange={setCurrentView} />
        )}
      </main>
    </div>
  );
};

export default Index;
