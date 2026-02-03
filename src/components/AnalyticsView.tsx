import { useMemo } from 'react';
import { format } from 'date-fns';
import { useGoalTracker } from '@/hooks/useGoalTracker';
import { MonthPicker } from './MonthPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Grid3X3,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Flame,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ViewMode } from '@/types/goals';

interface AnalyticsViewProps {
  onViewChange: (view: ViewMode) => void;
}

const COLORS = {
  hit: 'hsl(142, 71%, 45%)',
  miss: 'hsl(0, 84%, 60%)',
  partial: 'hsl(38, 92%, 50%)',
  pending: 'hsl(215, 16%, 47%)',
};

export const AnalyticsView = ({ onViewChange }: AnalyticsViewProps) => {
  const {
    currentYear,
    currentMonth,
    monthData,
    goToMonth,
    goToPreviousMonth,
    goToNextMonth,
    calculateMonthAnalytics,
  } = useGoalTracker();

  const analytics = useMemo(() => calculateMonthAnalytics(), [calculateMonthAnalytics]);

  const heatmapData = useMemo(() => {
    return analytics.dailyHitRate.map((d) => ({
      date: format(new Date(d.date), 'd'),
      rate: d.rate,
      fullDate: d.date,
    }));
  }, [analytics.dailyHitRate]);

  const goalPerformanceData = useMemo(() => {
    return analytics.goalAnalytics.map((ga) => {
      const goal = monthData.goals.find((g) => g.id === ga.goalId);
      return {
        name: goal?.title || 'Unknown',
        completionRate: ga.completionRate,
        hitDays: ga.hitDays,
        missDays: ga.missDays,
        partialDays: ga.partialDays,
        streak: ga.currentStreak,
        longestStreak: ga.longestStreak,
      };
    });
  }, [analytics.goalAnalytics, monthData.goals]);

  const missedReasonData = useMemo(() => {
    return analytics.mostFrequentMissedReasons.map((r) => ({
      name: r.reason,
      value: r.count,
    }));
  }, [analytics.mostFrequentMissedReasons]);

  const statusDistribution = useMemo(() => {
    const totals = analytics.goalAnalytics.reduce(
      (acc, ga) => ({
        hit: acc.hit + ga.hitDays,
        miss: acc.miss + ga.missDays,
        partial: acc.partial + ga.partialDays,
        pending: acc.pending + (ga.totalDays - ga.hitDays - ga.missDays - ga.partialDays),
      }),
      { hit: 0, miss: 0, partial: 0, pending: 0 }
    );

    return [
      { name: 'Hit', value: totals.hit, color: COLORS.hit },
      { name: 'Partial', value: totals.partial, color: COLORS.partial },
      { name: 'Miss', value: totals.miss, color: COLORS.miss },
      { name: 'Pending', value: totals.pending, color: COLORS.pending },
    ].filter((d) => d.value > 0);
  }, [analytics.goalAnalytics]);

  const bestGoal = monthData.goals.find((g) => g.id === analytics.bestPerformingGoal);
  const worstGoal = monthData.goals.find((g) => g.id === analytics.worstPerformingGoal);

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
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('grid')}
            className="gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin p-4 space-y-4">
        {monthData.goals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No goals defined for this month. Add goals in the grid view to see analytics.
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Completion
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.overallCompletionRate.toFixed(1)}%
                  </div>
                  <Progress value={analytics.overallCompletionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalGoals}</div>
                  <p className="text-xs text-muted-foreground">Active this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                  <TrendingUp className="h-4 w-4 text-rag-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold truncate">
                    {bestGoal?.title || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bestGoal
                      ? `${analytics.goalAnalytics
                          .find((g) => g.goalId === bestGoal.id)
                          ?.completionRate.toFixed(0)}% completion`
                      : 'No data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Needs Work</CardTitle>
                  <TrendingDown className="h-4 w-4 text-rag-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold truncate">
                    {worstGoal?.title || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {worstGoal
                      ? `${analytics.goalAnalytics
                          .find((g) => g.goalId === worstGoal.id)
                          ?.completionRate.toFixed(0)}% completion`
                      : 'No data'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Daily heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Hit Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={heatmapData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis
                          dataKey="date"
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(0)}%`, 'Hit Rate']}
                        />
                        <Bar
                          dataKey="rate"
                          radius={[2, 2, 0, 0]}
                          fill="hsl(var(--primary))"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Status distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    {statusDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">No data</p>
                    )}
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {statusDistribution.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span>{d.name}</span>
                        <span className="font-mono text-muted-foreground">({d.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goal performance table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Goal Performance & Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goalPerformanceData.map((goal) => (
                    <div
                      key={goal.name}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{goal.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-rag-green" />
                            {goal.hitDays} hit
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-rag-amber" />
                            {goal.partialDays} partial
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-rag-red" />
                            {goal.missDays} miss
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-rag-amber">
                            <Flame className="h-4 w-4" />
                            <span className="font-mono font-bold">{goal.streak}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Current</p>
                        </div>
                        <div className="text-center">
                          <div className="font-mono font-bold text-muted-foreground">
                            {goal.longestStreak}
                          </div>
                          <p className="text-[10px] text-muted-foreground">Best</p>
                        </div>
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono">{goal.completionRate.toFixed(0)}%</span>
                          </div>
                          <Progress value={goal.completionRate} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missed reasons */}
            {missedReasonData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rag-amber" />
                    Top Reasons for Missed Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {missedReasonData.map((reason, index) => (
                      <div
                        key={reason.name}
                        className="flex items-center gap-3"
                      >
                        <span className="w-6 text-center font-mono text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{reason.name}</span>
                            <span className="font-mono text-sm">{reason.value}x</span>
                          </div>
                          <Progress
                            value={
                              (reason.value / missedReasonData[0].value) * 100
                            }
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
