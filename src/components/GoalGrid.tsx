import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isBefore, startOfDay, subDays, addDays } from 'date-fns';
import { useGoalTracker } from '@/hooks/useGoalTracker';
import { GoalRowHeader } from './GoalRowHeader';
import { DayCell } from './DayCell';
import { AddGoalDialog, AddGoalButton } from './AddGoalDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Grid3X3, BarChart3 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';

export const GoalGrid = () => {
  const navigate = useNavigate();
  const {
    currentYear,
    currentMonth,
    monthData,
    addGoal,
    updateGoal,
    deleteGoal,
    getEntry,
    updateEntry,
    toggleDayStatus,
    toggleNonOfficeDay,
    goToMonth,
    calculateGoalAnalytics,
  } = useGoalTracker();

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  // End date is the last day visible (D), start date is D-6 (7 days total)
  const [endDate, setEndDate] = useState<Date>(new Date());

  const today = new Date();

  // Generate array of 7 days from endDate back to endDate-6
  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      result.push(subDays(endDate, i));
    }
    return result;
  }, [endDate]);

  const handlePreviousWeek = () => {
    setEndDate((prev) => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setEndDate((prev) => addDays(prev, 7));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      // Also sync the month data
      goToMonth(date.getFullYear(), date.getMonth());
    }
  };

  const handleSelectDay = (date: string) => {
    navigate(`/day/${date}`);
  };

  const handleViewAnalytics = (goalId?: string) => {
    if (goalId) {
      navigate(`/analytics/${goalId}`);
    } else {
      navigate('/analytics');
    }
  };

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const dayNumber = date.getDate();
    
    // Check if this day is in the current month's nonOfficeDays
    const isInCurrentMonth = date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    const isNonOffice = isInCurrentMonth && monthData.nonOfficeDays.includes(dayNumber);
    
    const isTodayDate = isToday(date);
    const isPast = isBefore(startOfDay(date), startOfDay(today)) || isTodayDate;

    return {
      date: dateStr,
      dayNumber,
      dayOfWeek,
      isOfficeDay: !isNonOffice,
      isToday: isTodayDate,
      isPast,
      dayName: format(date, 'EEE'),
    };
  };

  const startDateFormatted = format(days[0], 'MMM d');
  const endDateFormatted = format(endDate, 'MMM d, yyyy');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          {/* Date navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[200px] justify-center gap-2 font-medium"
              >
                <CalendarIcon className="h-4 w-4" />
                {startDateFormatted} - {endDateFormatted}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleDateSelect}
                defaultMonth={endDate}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
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
            onClick={() => handleViewAnalytics()}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="min-w-full">
          {/* Day headers */}
          <div className="flex sticky top-0 z-20 bg-card">
            {/* Empty corner cell - matches GoalRowHeader width */}
            <div className="sticky left-0 z-30 border-r border-b border-grid-border bg-grid-header w-[280px] shrink-0" />
            
            {/* Day columns - use flex-1 for equal distribution */}
            <div className="flex flex-1">
              {days.map((date) => {
                const info = getDayInfo(date);
                return (
                  <div
                    key={info.date}
                    className={cn(
                      'grid-cell grid-header flex flex-col items-center justify-center flex-1 min-w-[60px] cursor-pointer',
                      !info.isOfficeDay && 'bg-day-nonoffice',
                      info.isToday && 'bg-day-today'
                    )}
                    onClick={() => handleSelectDay(info.date)}
                    onDoubleClick={() => {
                      // Toggle non-office day for current month only
                      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                        toggleNonOfficeDay(info.dayNumber);
                      }
                    }}
                    title="Click to view day details. Double-click to toggle office/non-office day."
                  >
                    <span className="text-xs">{info.dayName}</span>
                    <span className="font-mono font-semibold">{info.dayNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal rows - sorted by start time, then end time */}
          {[...monthData.goals]
            .sort((a, b) => {
              // Compare start times first
              const startCompare = a.startTime.localeCompare(b.startTime);
              if (startCompare !== 0) return startCompare;
              // If start times are equal, compare end times
              return a.endTime.localeCompare(b.endTime);
            })
            .map((goal) => {
            const analytics = calculateGoalAnalytics(goal.id);
            
            return (
              <div key={goal.id} className="flex">
                <GoalRowHeader
                  goal={goal}
                  analytics={analytics}
                  onUpdate={(updates) => updateGoal(goal.id, updates)}
                  onDelete={() => deleteGoal(goal.id)}
                  onViewAnalytics={() => handleViewAnalytics(goal.id)}
                />
                
                {/* Day cells container - matches header structure */}
                <div className="flex flex-1">
                  {days.map((date) => {
                    const info = getDayInfo(date);
                    const entry = getEntry(goal.id, info.date);
                    
                    return (
                      <DayCell
                        key={info.date}
                        goal={goal}
                        day={info.dayNumber}
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
