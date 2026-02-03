import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Goal, DayEntry, TimeBlock, DayStatus } from '@/types/goals';
import { useGoalTracker } from '@/hooks/useGoalTracker';
import { StatusIndicator, RAGBadge } from './StatusIndicator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface DailyDetailViewProps {
  selectedDate: string;
  onBack: () => void;
}

const TIME_SLOTS = Array.from({ length: 24 * 12 }, (_, i) => {
  const hours = Math.floor(i / 12);
  const minutes = (i % 12) * 5;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

const WORK_HOURS_START = 6; // 6 AM
const WORK_HOURS_END = 22; // 10 PM

export const DailyDetailView = ({ selectedDate, onBack }: DailyDetailViewProps) => {
  const {
    monthData,
    getEntry,
    updateEntry,
    addTimeBlock,
    removeTimeBlock,
    toggleDayStatus,
  } = useGoalTracker();

  const dateObj = parseISO(selectedDate);
  const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  const workTimeSlots = useMemo(() => {
    return TIME_SLOTS.filter((slot) => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= WORK_HOURS_START && hour < WORK_HOURS_END;
    });
  }, []);

  const getTimeSlotPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - WORK_HOURS_START) * 60 + minutes;
    return (totalMinutes / 5) * 20; // 20px per 5-minute slot
  };

  const getBlockWidth = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return ((endMinutes - startMinutes) / 5) * 20;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="font-semibold">{formattedDate}</h2>
          <p className="text-sm text-muted-foreground">
            Daily time breakdown with 5-minute intervals
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4">
        {monthData.goals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No goals defined for this month. Add goals in the grid view.
          </div>
        ) : (
          <div className="space-y-6">
            {monthData.goals.map((goal) => {
              const entry = getEntry(goal.id, selectedDate);
              const status: DayStatus = entry?.status || 'miss';

              return (
                <div key={goal.id} className="space-y-2">
                  {/* Goal header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleDayStatus(goal.id, selectedDate)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <StatusIndicator status={status} size="lg" />
                      </button>
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {goal.startTime} - {goal.endTime} ({goal.allocatedMinutes}m allocated)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Actual: <span className="font-mono">{entry?.actualMinutes || 0}m</span>
                      </span>
                      <RAGBadge status={status} />
                    </div>
                  </div>

                  {/* Time graph */}
                  <div className="relative bg-muted/30 rounded-lg border overflow-hidden">
                    {/* Time markers */}
                    <div className="flex border-b">
                      {Array.from({ length: WORK_HOURS_END - WORK_HOURS_START }, (_, i) => (
                        <div
                          key={i}
                          className="flex-1 min-w-[240px] px-2 py-1 border-r text-xs text-muted-foreground font-mono"
                        >
                          {String(WORK_HOURS_START + i).padStart(2, '0')}:00
                        </div>
                      ))}
                    </div>

                    {/* Graph area */}
                    <div className="relative h-16 overflow-x-auto">
                      <div
                        className="absolute inset-0"
                        style={{ width: (WORK_HOURS_END - WORK_HOURS_START) * 12 * 20 }}
                      >
                        {/* Grid lines */}
                        {Array.from({ length: WORK_HOURS_END - WORK_HOURS_START }, (_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 border-l border-border/50"
                            style={{ left: i * 12 * 20 }}
                          />
                        ))}

                        {/* Allocated time block (goal time window) */}
                        <div
                          className="absolute top-2 h-12 bg-time-block-light border border-time-block/30 rounded"
                          style={{
                            left: getTimeSlotPosition(goal.startTime),
                            width: getBlockWidth(goal.startTime, goal.endTime),
                          }}
                        >
                          <div className="px-2 py-1 text-xs font-medium text-time-block truncate">
                            {goal.title}
                          </div>
                        </div>

                        {/* Executed time blocks */}
                        {entry?.timeBlocks
                          .filter((b) => b.type === 'executed')
                          .map((block) => (
                            <div
                              key={block.id}
                              className="absolute top-3 h-10 bg-rag-green-light border border-rag-green/50 rounded flex items-center group"
                              style={{
                                left: getTimeSlotPosition(block.startTime),
                                width: getBlockWidth(block.startTime, block.endTime),
                              }}
                            >
                              <span className="px-2 text-xs font-medium text-rag-green truncate">
                                {block.note || 'Executed'}
                              </span>
                              <button
                                onClick={() => removeTimeBlock(goal.id, selectedDate, block.id)}
                                className="absolute -top-1 -right-1 h-4 w-4 bg-rag-red rounded-full hidden group-hover:flex items-center justify-center"
                              >
                                <X className="h-2.5 w-2.5 text-white" />
                              </button>
                            </div>
                          ))}

                        {/* Blocked time blocks */}
                        {entry?.timeBlocks
                          .filter((b) => b.type === 'blocked')
                          .map((block) => (
                            <div
                              key={block.id}
                              className="absolute top-3 h-10 bg-rag-red-light border border-rag-red/50 rounded flex items-center group"
                              style={{
                                left: getTimeSlotPosition(block.startTime),
                                width: getBlockWidth(block.startTime, block.endTime),
                              }}
                            >
                              <span className="px-2 text-xs font-medium text-rag-red truncate">
                                {block.note || 'Blocked'}
                              </span>
                              <button
                                onClick={() => removeTimeBlock(goal.id, selectedDate, block.id)}
                                className="absolute -top-1 -right-1 h-4 w-4 bg-rag-red rounded-full hidden group-hover:flex items-center justify-center"
                              >
                                <X className="h-2.5 w-2.5 text-white" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        addTimeBlock(goal.id, selectedDate, {
                          startTime: goal.startTime,
                          endTime: goal.endTime,
                          type: 'executed',
                          note: 'Completed',
                        });
                        updateEntry(goal.id, selectedDate, { 
                          status: 'hit',
                          actualMinutes: goal.allocatedMinutes 
                        });
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Mark as Done
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        addTimeBlock(goal.id, selectedDate, {
                          startTime: goal.startTime,
                          endTime: goal.endTime,
                          type: 'blocked',
                          note: 'Blocked',
                        });
                        updateEntry(goal.id, selectedDate, { status: 'miss' });
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Mark as Blocked
                    </Button>
                  </div>

                  {/* Comment */}
                  {entry?.comment && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2">
                      {entry.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
