import { useMemo, useState } from 'react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { useGoalTracker } from '@/hooks/useGoalTracker';
import { MonthPicker } from './MonthPicker';
import { GoalRowHeader } from './GoalRowHeader';
import { DayCell } from './DayCell';
import { AddGoalDialog, AddGoalButton } from './AddGoalDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Forward, Grid3X3, CalendarDays, BarChart3 } from 'lucide-react';
import { ViewMode } from '@/types/goals';

interface GoalGridProps {
  onViewChange: (view: ViewMode) => void;
  onSelectDay: (date: string) => void;
}

export const GoalGrid = ({ onViewChange, onSelectDay }: GoalGridProps) => {
  const {
    currentYear,
    currentMonth,
    monthData,
    daysInMonth,
    addGoal,
    updateGoal,
    deleteGoal,
    getEntry,
    updateEntry,
    toggleDayStatus,
    toggleNonOfficeDay,
    goToMonth,
    goToPreviousMonth,
    goToNextMonth,
    carryForwardGoals,
    calculateGoalAnalytics,
  } = useGoalTracker();

  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const today = new Date();

  const getDayInfo = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNonOffice = monthData.nonOfficeDays.includes(day);
    const isTodayDate = isToday(date);
    const isPast = isBefore(startOfDay(date), startOfDay(today)) || isTodayDate;

    return {
      date: dateStr,
      dayOfWeek,
      isOfficeDay: !isNonOffice,
      isToday: isTodayDate,
      isPast,
      dayName: format(date, 'EEE'),
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          <MonthPicker
            currentYear={currentYear}
            currentMonth={currentMonth}
            onMonthChange={goToMonth}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={carryForwardGoals}
            className="gap-2"
            disabled={monthData.goals.length === 0}
          >
            <Forward className="h-4 w-4" />
            Carry Forward
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('analytics')}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Day headers */}
          <div className="flex sticky top-0 z-20 bg-card">
            {/* Empty corner cell */}
            <div className="sticky left-0 z-30 border-r border-b border-grid-border bg-grid-header min-w-[280px]" />
            
            {/* Day columns */}
            {days.map((day) => {
              const info = getDayInfo(day);
              return (
                <div
                  key={day}
                  className={cn(
                    'grid-cell grid-header flex flex-col items-center justify-center min-w-[48px] cursor-pointer',
                    !info.isOfficeDay && 'bg-day-nonoffice',
                    info.isToday && 'bg-day-today'
                  )}
                  onClick={() => onSelectDay(info.date)}
                  onDoubleClick={() => toggleNonOfficeDay(day)}
                  title="Click to view day details. Double-click to toggle office/non-office day."
                >
                  <span className="text-xs">{info.dayName}</span>
                  <span className="font-mono font-semibold">{day}</span>
                </div>
              );
            })}
          </div>

          {/* Goal rows */}
          {monthData.goals.map((goal) => {
            const analytics = calculateGoalAnalytics(goal.id);
            
            return (
              <div key={goal.id} className="flex">
                <GoalRowHeader
                  goal={goal}
                  analytics={analytics}
                  onUpdate={(updates) => updateGoal(goal.id, updates)}
                  onDelete={() => deleteGoal(goal.id)}
                />
                
                {days.map((day) => {
                  const info = getDayInfo(day);
                  const entry = getEntry(goal.id, info.date);
                  
                  return (
                    <DayCell
                      key={day}
                      goal={goal}
                      day={day}
                      date={info.date}
                      entry={entry}
                      isOfficeDay={info.isOfficeDay}
                      isToday={info.isToday}
                      isPast={info.isPast}
                      onToggleStatus={() => toggleDayStatus(goal.id, info.date)}
                      onUpdateEntry={(updates) => updateEntry(goal.id, info.date, updates)}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* Add goal row */}
          <div className="flex">
            <AddGoalButton onClick={() => setIsAddingGoal(true)} />
            <div className="flex-1 border-b border-dashed border-grid-border" />
          </div>
        </div>
      </div>

      <AddGoalDialog
        open={isAddingGoal}
        onOpenChange={setIsAddingGoal}
        onAddGoal={addGoal}
      />
    </div>
  );
};
