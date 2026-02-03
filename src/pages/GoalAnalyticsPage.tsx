import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useGoalTracker } from '@/hooks/useGoalTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Flame, CheckCircle2, XCircle, AlertTriangle, Target, Clock, Calendar, Flag, TrendingDown, Tag } from 'lucide-react';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
const GoalAnalyticsPage = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { monthData, calculateGoalAnalytics } = useGoalTracker();

  const goal = useMemo(() => {
    return monthData.goals.find((g) => g.id === goalId);
  }, [monthData.goals, goalId]);

  const analytics = useMemo(() => {
    if (!goalId) return null;
    return calculateGoalAnalytics(goalId);
  }, [goalId, calculateGoalAnalytics]);

  // Get last 20 days heatmap data with reasons
  const heatmapData = useMemo(() => {
    if (!goalId) return [];
    
    const today = new Date();
    const result: { date: string; dateStr: string; dayName: string; status: 'hit' | 'miss' | 'partial' | 'pending' | 'none'; reason?: string }[] = [];
    
    for (let i = 19; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = monthData.entries.find((e) => e.goalId === goalId && e.date === dateStr);
      
      result.push({
        date: dateStr,
        dateStr: format(date, 'd'),
        dayName: format(date, 'EEE'),
        status: entry?.status || 'none',
        reason: entry?.missedReason,
      });
    }
    
    return result;
  }, [goalId, monthData.entries]);

  // Get missed reasons for this goal
  const missedReasons = useMemo(() => {
    if (!analytics) return [];
    
    const reasons = Object.entries(analytics.missedReasonBreakdown)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
    
    return reasons;
  }, [analytics]);

  // Calculate goal duration info
  const goalInfo = useMemo(() => {
    if (!goal) return null;
    
    const startDate = parseISO(goal.createdAt);
    const today = new Date();
    const daysSinceStart = differenceInDays(today, startDate);
    
    let endDateInfo = null;
    if (goal.targetEndDate) {
      const endDate = parseISO(goal.targetEndDate);
      const daysToGo = differenceInDays(endDate, today);
      endDateInfo = {
        endDate: format(endDate, 'MMM d, yyyy'),
        daysToGo,
        isOverdue: daysToGo < 0,
      };
    }
    
    return {
      startDate: format(startDate, 'MMM d, yyyy'),
      daysSinceStart,
      endDateInfo,
    };
  }, [goal]);

  // Calculate consecutive miss streak and last hit info
  const streakInfo = useMemo(() => {
    if (!goalId) return { consecutiveMisses: 0, lastHitDaysAgo: null, recentReasons: [] };
    
    const today = new Date();
    let consecutiveMisses = 0;
    let lastHitDaysAgo: number | null = null;
    const recentReasonsSet: string[] = [];
    
    // Look back up to 90 days
    for (let i = 0; i < 90; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = monthData.entries.find((e) => e.goalId === goalId && e.date === dateStr);
      
      if (entry?.status === 'hit') {
        if (lastHitDaysAgo === null) {
          lastHitDaysAgo = i;
        }
        break; // Stop counting consecutive misses
      } else if (entry?.status === 'miss') {
        consecutiveMisses++;
        if (entry.missedReason && recentReasonsSet.length < 3 && !recentReasonsSet.includes(entry.missedReason)) {
          recentReasonsSet.push(entry.missedReason);
        }
      }
    }
    
    // If we never found a hit, look further for the last hit
    if (lastHitDaysAgo === null) {
      for (let i = 0; i < 365; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = monthData.entries.find((e) => e.goalId === goalId && e.date === dateStr);
        if (entry?.status === 'hit') {
          lastHitDaysAgo = i;
          break;
        }
      }
    }
    
    return { consecutiveMisses, lastHitDaysAgo, recentReasons: recentReasonsSet };
  }, [goalId, monthData.entries]);

  if (!goal || !analytics) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">GT</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm">Goal Tracker</h1>
              <p className="text-xs text-muted-foreground">Goal not found</p>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">Goal not found.</p>
          <Button onClick={() => navigate('/analytics')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analytics
          </Button>
        </main>
      </div>
    );
  }

  const ragStatus = analytics.completionRate >= 80 ? 'hit' : 
                    analytics.completionRate >= 50 ? 'partial' : 
                    analytics.completionRate > 0 ? 'miss' : 'pending';

  const statusColor = ragStatus === 'hit' ? 'text-rag-green' : 
                      ragStatus === 'partial' ? 'text-rag-amber' : 
                      ragStatus === 'miss' ? 'text-rag-red' : 'text-muted-foreground';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hit': return 'bg-rag-green';
      case 'miss': return 'bg-rag-red';
      case 'partial': return 'bg-rag-amber';
      case 'pending': return 'bg-muted-foreground/50';
      default: return 'bg-muted/30';
    }
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
            <p className="text-xs text-muted-foreground">Goal Analytics</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b bg-card">
            <Button variant="ghost" size="icon" onClick={() => navigate('/analytics')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold">{goal.title}</h2>
              <p className="text-sm text-muted-foreground font-mono">
                {goal.startTime} - {goal.endTime} ({goal.allocatedMinutes}m daily)
              </p>
            </div>
            <div className={`text-2xl font-bold ${statusColor}`}>
              {analytics.completionRate.toFixed(0)}%
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-4">
            {/* Summary cards - Fixed 2-2-2 layout */}
            <div className="grid gap-4 grid-cols-2">
              {/* Row 1: Completion Rate & Total Time Spent */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${statusColor}`}>
                    {analytics.completionRate.toFixed(1)}%
                  </div>
                  <Progress value={analytics.completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">
                    {Math.floor(analytics.totalActualMinutes / 60)}h {analytics.totalActualMinutes % 60}m
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Since beginning
                  </p>
                </CardContent>
              </Card>

              {/* Row 2: Started & Target Completion */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Started</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{goalInfo?.startDate}</div>
                  <p className="text-xs text-muted-foreground">
                    {goalInfo?.daysSinceStart} days ago
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Target Completion</CardTitle>
                  <Flag className={cn(
                    "h-4 w-4",
                    goalInfo?.endDateInfo?.isOverdue ? "text-rag-red" : "text-rag-green"
                  )} />
                </CardHeader>
                <CardContent>
                  {goalInfo?.endDateInfo ? (
                    <>
                      <div className="text-lg font-bold">{goalInfo.endDateInfo.endDate}</div>
                      <p className={cn(
                        "text-xs",
                        goalInfo.endDateInfo.isOverdue ? "text-rag-red" : "text-muted-foreground"
                      )}>
                        {goalInfo.endDateInfo.isOverdue 
                          ? `${Math.abs(goalInfo.endDateInfo.daysToGo)} days overdue` 
                          : `${goalInfo.endDateInfo.daysToGo} days to go`}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-muted-foreground">Not set</div>
                      <p className="text-xs text-muted-foreground">No target date</p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Row 3: Current Streak & Consecutive Misses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className={cn(
                    "h-4 w-4",
                    analytics.currentStreak > 0 ? "text-rag-amber" : "text-muted-foreground"
                  )} />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold font-mono",
                    analytics.currentStreak > 0 ? "text-rag-green" : ""
                  )}>
                    {analytics.currentStreak}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Longest: {analytics.longestStreak} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consecutive Misses</CardTitle>
                  <TrendingDown className={cn(
                    "h-4 w-4",
                    streakInfo.consecutiveMisses > 0 ? "text-rag-red" : "text-muted-foreground"
                  )} />
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold font-mono",
                    streakInfo.consecutiveMisses > 0 ? "text-rag-red" : ""
                  )}>
                    {streakInfo.consecutiveMisses}
                  </div>
                  {streakInfo.recentReasons.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {streakInfo.recentReasons.slice(0, 3).map((reason) => (
                        <span
                          key={reason}
                          className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {streakInfo.consecutiveMisses > 0 ? 'Missing' : 'No misses'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* D-20 Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Performance (Last 20 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="flex gap-1 flex-wrap">
                    {heatmapData.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-1 cursor-pointer">
                            <span className="text-[10px] text-muted-foreground">{day.dayName}</span>
                            <div
                              className={cn(
                                'w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-medium transition-transform hover:scale-110',
                                getStatusColor(day.status),
                                day.status === 'hit' || day.status === 'miss' || day.status === 'partial' 
                                  ? 'text-white' 
                                  : 'text-muted-foreground'
                              )}
                            >
                              {day.dateStr}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">{format(parseISO(day.date), 'MMM d, yyyy')}</div>
                            <div className="capitalize">{day.status === 'none' ? 'No data' : day.status}</div>
                            {day.status === 'miss' && (
                              <div className="text-muted-foreground">
                                {day.reason || 'Missing'}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rag-green" />
                    <span>Hit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rag-amber" />
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rag-red" />
                    <span>Miss</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-muted/30" />
                    <span>No data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rag-green" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Hit Days</span>
                        <span className="font-mono">{analytics.hitDays}</span>
                      </div>
                      <Progress 
                        value={analytics.totalDays > 0 ? (analytics.hitDays / analytics.totalDays) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-rag-amber" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Partial Days</span>
                        <span className="font-mono">{analytics.partialDays}</span>
                      </div>
                      <Progress 
                        value={analytics.totalDays > 0 ? (analytics.partialDays / analytics.totalDays) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-rag-red" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Missed Days</span>
                        <span className="font-mono">{analytics.missDays}</span>
                      </div>
                      <Progress 
                        value={analytics.totalDays > 0 ? (analytics.missDays / analytics.totalDays) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missed reasons */}
            {missedReasons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rag-amber" />
                    Common Reasons for Missing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {missedReasons.map((reason, index) => (
                      <div key={reason.reason} className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{reason.reason}</span>
                            <span className="font-mono text-sm">{reason.count}x</span>
                          </div>
                          <Progress
                            value={(reason.count / missedReasons[0].count) * 100}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GoalAnalyticsPage;
