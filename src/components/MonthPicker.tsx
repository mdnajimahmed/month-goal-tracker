import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  currentYear: number;
  currentMonth: number;
  onMonthChange: (year: number, month: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const MonthPicker = ({
  currentYear,
  currentMonth,
  onMonthChange,
  onPrevious,
  onNext,
}: MonthPickerProps) => {
  const currentDate = new Date(currentYear, currentMonth, 1);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[160px] justify-center gap-2 font-medium"
          >
            <Calendar className="h-4 w-4" />
            {format(currentDate, 'MMMM yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={currentDate}
            onSelect={(date) => {
              if (date) {
                onMonthChange(date.getFullYear(), date.getMonth());
              }
            }}
            defaultMonth={currentDate}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
