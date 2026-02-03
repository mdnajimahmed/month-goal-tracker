import { useState } from 'react';
import { Goal } from '@/types/goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, CalendarIcon } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
}

export const AddGoalDialog = ({ open, onOpenChange, onAddGoal }: AddGoalDialogProps) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('07:30');
  const [targetEndDate, setTargetEndDate] = useState<Date | undefined>(addMonths(new Date(), 1));

  const handleAdd = () => {
    if (!title.trim()) return;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const allocatedMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    onAddGoal({
      title: title.trim(),
      startTime,
      endTime,
      allocatedMinutes: Math.max(0, allocatedMinutes),
      tags: [],
      targetEndDate: targetEndDate ? format(targetEndDate, 'yyyy-MM-dd') : undefined,
    });

    setTitle('');
    setStartTime('07:00');
    setEndTime('07:30');
    setTargetEndDate(addMonths(new Date(), 1));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Goal Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning workout, Read technical docs..."
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetEndDate ? format(targetEndDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetEndDate}
                  onSelect={setTargetEndDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              When do you want to complete this goal?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim()}>
            Add Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AddGoalButtonProps {
  onClick: () => void;
}

export const AddGoalButton = ({ onClick }: AddGoalButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="sticky left-0 z-10 flex items-center gap-2 border-r border-b border-dashed border-grid-border bg-card/50 px-3 py-3 min-w-[280px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      <Plus className="h-4 w-4" />
      <span className="text-sm">Add goal</span>
    </button>
  );
};