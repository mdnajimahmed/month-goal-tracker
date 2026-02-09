import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isBefore, startOfDay, subDays, addDays } from 'date-fns';
import { isGoalActiveOnDay } from '@/types/goals';
import { useGoalTracker } from '@/hooks/useGoalTracker';
import { GoalRowHeader } from './GoalRowHeader';
import { DayCell } from './DayCell';
import { AddGoalDialog, AddGoalButton } from './AddGoalDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const GoalGrid = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [endDate, setEndDate] = useState<Date>(new Date());

  const today = new Date();

  // Show fewer days on mobile
  const visibleDays = isMobile ? 3 : 7;

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = visibleDays - 1; i >= 0; i--) {
      result.push(subDays(endDate, i));
    }
    return result;
  }, [endDate, visibleDays]);

  const handlePreviousWeek = () => {
    setEndDate((prev) => subDays(prev, visibleDays));
  };

  const handleNextWeek = () => {
    setEndDate((prev) => addDays(prev, visibleDays));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      goToMonth(date.getFullYear(), date.getMonth());
    }
  };

  const handleSelectDay = (date: string) => {
    navigate(`/day/${date}`);
  };

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const dayNumber = date.getDate();

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
  const endDateFormatted = format(endDate, isMobile ? 'MMM d' : 'MMM d, yyyy');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b bg-card">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="min-w-0 sm:min-w-[200px] justify-center gap-1 sm:gap-2 font-medium text-xs sm:text-sm px-2 sm:px-4"
              >
                <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate">{startDateFormatted} - {endDateFormatted}</span>
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
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="min-w-full">
          {/* Day headers */}
          <div className="flex sticky top-0 z-20 bg-card">
            <div className="sticky left-0 z-30 border-r border-b border-grid-border bg-grid-header w-[160px] sm:w-[220px] md:w-[280px] shrink-0" />

            <div className="flex flex-1">
              {days.map((date) => {
                const info = getDayInfo(date);
                return (
                  <div
                    key={info.date}
                    className={cn(
                      'grid-cell grid-header flex flex-col items-center justify-center flex-1 min-w-[48px] sm:min-w-[60px] cursor-pointer',
                      !info.isOfficeDay && 'bg-day-nonoffice',
                      info.isToday && 'bg-day-today'
                    )}
                    onClick={() => handleSelectDay(info.date)}
                    onDoubleClick={() => {
                      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                        toggleNonOfficeDay(info.dayNumber);
                      }
                    }}
                    title="Click to view day details. Double-click to toggle office/non-office day."
                  >
                    <span className="text-[10px] sm:text-xs">{info.dayName}</span>
                    <span className="font-mono font-semibold text-xs sm:text-sm">{info.dayNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal rows */}
          {[...monthData.goals]
            .sort((a, b) => {
              const startCompare = a.startTime.localeCompare(b.startTime);
              if (startCompare !== 0) return startCompare;
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
                  onViewAnalytics={() => navigate(`/goal-analytics/${goal.id}`)}
                />

                <div className="flex flex-1">
                  {days.map((date) => {
                    const info = getDayInfo(date);
                    const entry = getEntry(goal.id, info.date);
                    const dayOfWeek = date.getDay();
                    const isDisabledForGoal = !isGoalActiveOnDay(goal, dayOfWeek);

                    if (isDisabledForGoal) {
                      const scopeLabel = goal.isWeekendGoal ? 'Weekend goal — not active on weekdays' : 'Weekday goal — not active on weekends';
                      return (
                        <div
                          key={info.date}
                          className="grid-cell relative flex flex-col items-center justify-center gap-0.5 min-h-[48px] sm:min-h-[56px] flex-1 min-w-[48px] sm:min-w-[60px] bg-muted/20 opacity-30 cursor-not-allowed"
                          title={scopeLabel}
                        >
                          <span className="text-[10px] text-muted-foreground">—</span>
                        </div>
                      );
                    }

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
