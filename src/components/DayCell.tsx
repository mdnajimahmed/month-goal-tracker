import { useState } from 'react';
import { Goal, DayEntry, DayStatus } from '@/types/goals';
import { StatusIndicator } from './StatusIndicator';
import { MissedReasonCombobox } from './MissedReasonCombobox';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';

interface DayCellProps {
  goal: Goal;
  day: number;
  date: string;
  entry: DayEntry | undefined;
  isOfficeDay: boolean;
  isToday: boolean;
  isPast: boolean;
  onToggleStatus: () => void;
  onUpdateEntry: (updates: Partial<DayEntry>) => void;
}

export const DayCell = ({
  goal,
  day,
  date,
  entry,
  isOfficeDay,
  isToday,
  isPast,
  onToggleStatus,
  onUpdateEntry,
}: DayCellProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [comment, setComment] = useState(entry?.comment || '');
  const [actualMinutes, setActualMinutes] = useState(entry?.actualMinutes || 0);
  const [missedReason, setMissedReason] = useState(entry?.missedReason || '');

  const status: DayStatus = entry?.status || 'pending';
  const hasComment = entry?.comment && entry.comment.length > 0;

  const handleSaveDetails = () => {
    onUpdateEntry({
      comment,
      actualMinutes,
      missedReason: status === 'miss' ? missedReason : undefined,
    });
    setIsDetailOpen(false);
  };

  const handleStatusChange = (newStatus: DayStatus) => {
    onUpdateEntry({ status: newStatus });
  };

  return (
    <>
      <div
        className={cn(
          'grid-cell relative flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors min-h-[48px]',
          isOfficeDay ? 'grid-cell-office' : 'grid-cell-nonoffice',
          isToday && 'grid-cell-today',
          !isPast && 'opacity-60',
          'hover:bg-grid-hover'
        )}
        onClick={onToggleStatus}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsDetailOpen(true);
        }}
      >
        <StatusIndicator status={status} size="sm" />
        {hasComment && (
          <MessageSquare className="absolute bottom-1 right-1 h-3 w-3 text-muted-foreground" />
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm text-muted-foreground">
              {goal.title} — {date}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(['hit', 'partial', 'miss', 'pending'] as DayStatus[]).map((s) => (
                  <Button
                    key={s}
                    variant={status === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(s)}
                    className={cn(
                      status === s && s === 'hit' && 'bg-rag-green hover:bg-rag-green/90',
                      status === s && s === 'miss' && 'bg-rag-red hover:bg-rag-red/90',
                      status === s && s === 'partial' && 'bg-rag-amber hover:bg-rag-amber/90'
                    )}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualMinutes">Actual Time (minutes)</Label>
              <Input
                id="actualMinutes"
                type="number"
                min={0}
                value={actualMinutes}
                onChange={(e) => setActualMinutes(Number(e.target.value))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Allocated: {goal.allocatedMinutes} min ({goal.startTime} - {goal.endTime})
              </p>
            </div>

            {status === 'miss' && (
              <div className="space-y-2">
                <Label>Reason for Miss</Label>
                <MissedReasonCombobox
                  value={missedReason}
                  onValueChange={setMissedReason}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDetails}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
