import { useState } from 'react';
import { Goal, GoalAnalytics } from '@/types/goals';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { RAGBadge, StatusDot } from './StatusIndicator';
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Flame, 
  TrendingUp 
} from 'lucide-react';

interface GoalRowHeaderProps {
  goal: Goal;
  analytics: GoalAnalytics;
  onUpdate: (updates: Partial<Goal>) => void;
  onDelete: () => void;
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
  onDelete,
}: GoalRowHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editStartTime, setEditStartTime] = useState(goal.startTime);
  const [editEndTime, setEditEndTime] = useState(goal.endTime);

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
    });
    setIsEditing(false);
  };

  const ragStatus = analytics.completionRate >= 80 ? 'hit' : 
                    analytics.completionRate >= 50 ? 'partial' : 
                    analytics.completionRate > 0 ? 'miss' : 'pending';

  return (
    <div className="sticky left-0 z-10 flex items-center gap-3 border-r border-b border-grid-border bg-card px-3 py-2 min-w-[280px]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm truncate">{goal.title}</h3>
          <RAGBadge status={ragStatus} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
          <span>{formatTime(goal.startTime)} - {formatTime(goal.endTime)}</span>
          <span className="text-foreground">{formatDuration(goal.allocatedMinutes)}</span>
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
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
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
