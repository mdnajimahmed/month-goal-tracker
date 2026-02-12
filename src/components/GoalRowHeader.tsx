import { useState } from 'react';
import { Goal, GoalAnalytics } from '@/types/goals';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Flame, 
  TrendingUp,
  BarChart3,
  CalendarIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface GoalRowHeaderProps {
  goal: Goal;
  analytics: GoalAnalytics;
  onUpdate: (updates: Partial<Goal>) => void;
  onComplete?: () => void;
  onUncomplete?: () => void;
  onDelete: () => void;
  onViewAnalytics?: () => void;
}

const formatTime = (time: string) => {
  return time;
};

const formatDuration = (minutes: number) => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

export const GoalRowHeader = ({
  goal,
  analytics,
  onUpdate,
  onComplete,
  onUncomplete,
  onDelete,
  onViewAnalytics,
}: GoalRowHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editStartTime, setEditStartTime] = useState(goal.startTime);
  const [editEndTime, setEditEndTime] = useState(goal.endTime);
  const [editIsWeekendGoal, setEditIsWeekendGoal] = useState(goal.isWeekendGoal || false);
  const [editIsWeekdayGoal, setEditIsWeekdayGoal] = useState(goal.isWeekdayGoal || false);
  const [editTargetEndDate, setEditTargetEndDate] = useState<Date | undefined>(
    goal.targetEndDate ? parseISO(goal.targetEndDate) : undefined
  );

  const handleSave = () => {
    // Calculate allocated minutes from start/end time
    const [startH, startM] = editStartTime.split(':').map(Number);
    const [endH, endM] = editEndTime.split(':').map(Number);
    const allocatedMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    onUpdate({
      title: editTitle,
      startTime: editStartTime,
      endTime: editEndTime,
      allocatedMinutes: Math.max(0, allocatedMinutes),
      isWeekendGoal: editIsWeekendGoal,
      isWeekdayGoal: editIsWeekdayGoal,
      targetEndDate: editTargetEndDate ? format(editTargetEndDate, 'yyyy-MM-dd') : undefined,
    });
    setIsEditing(false);
  };

  const handleOpenEdit = () => {
    setEditTitle(goal.title);
    setEditStartTime(goal.startTime);
    setEditEndTime(goal.endTime);
    setEditIsWeekendGoal(goal.isWeekendGoal || false);
    setEditIsWeekdayGoal(goal.isWeekdayGoal || false);
    setEditTargetEndDate(goal.targetEndDate ? parseISO(goal.targetEndDate) : undefined);
    setIsEditing(true);
  };

  const ragStatus = analytics.completionRate >= 80 ? 'hit' :
                    analytics.completionRate >= 50 ? 'partial' : 
                    analytics.completionRate > 0 ? 'miss' : 'pending';

  const isCompleted = !!goal.completedAt;

  return (
    <div className={cn(
      "sticky left-0 z-10 flex items-center gap-2 border-r border-b border-grid-border px-2 sm:px-3 py-2 w-[160px] sm:w-[220px] md:w-[280px] shrink-0",
      isCompleted ? "bg-muted/30" : "bg-card"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isCompleted && (
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          )}
          <h3 className={cn(
            "font-medium text-sm truncate",
            isCompleted && "line-through text-muted-foreground"
          )}>{goal.title}</h3>
          {(goal.isWeekendGoal || goal.isWeekdayGoal) && (
            <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
              {goal.isWeekendGoal ? 'WE' : 'WD'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
          <span>{formatTime(goal.startTime)} - {formatTime(goal.endTime)}</span>
          <span className="text-foreground">{formatDuration(goal.allocatedMinutes)}</span>
          {goal.targetEndDate && (
            <span className="hidden sm:inline" title="Target end date">
              <CalendarIcon className="inline h-3 w-3 mr-0.5 -mt-px" />
              {format(parseISO(goal.targetEndDate), 'MMM d')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <Flame className="h-3 w-3 text-rag-amber" />
            <span className="font-mono">{analytics.currentStreak}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-rag-green" />
            <span className="font-mono">{analytics.completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={analytics.completionRate} className="flex-1 h-1.5" />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {onViewAnalytics && (
            <DropdownMenuItem onClick={onViewAnalytics}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </DropdownMenuItem>
          )}
          {goal.completedAt ? (
            onUncomplete && (
              <DropdownMenuItem onClick={onUncomplete}>
                <Circle className="mr-2 h-4 w-4" />
                Uncomplete
              </DropdownMenuItem>
            )
          ) : (
            onComplete && (
              <DropdownMenuItem onClick={onComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
              </DropdownMenuItem>
            )
          )}
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Goal title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Scope</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editWeekdayGoal"
                    checked={editIsWeekdayGoal}
                    onCheckedChange={(checked) => {
                      setEditIsWeekdayGoal(checked === true);
                      if (checked) setEditIsWeekendGoal(false);
                    }}
                  />
                  <label htmlFor="editWeekdayGoal" className="text-sm leading-none">
                    Weekday Only
                  </label>
                  <span className="text-xs text-muted-foreground">(Mon–Fri)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editWeekendGoal"
                    checked={editIsWeekendGoal}
                    onCheckedChange={(checked) => {
                      setEditIsWeekendGoal(checked === true);
                      if (checked) setEditIsWeekdayGoal(false);
                    }}
                  />
                  <label htmlFor="editWeekendGoal" className="text-sm leading-none">
                    Weekend Only
                  </label>
                  <span className="text-xs text-muted-foreground">(Sat & Sun)</span>
                </div>
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
                      !editTargetEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editTargetEndDate ? format(editTargetEndDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editTargetEndDate}
                    onSelect={setEditTargetEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
