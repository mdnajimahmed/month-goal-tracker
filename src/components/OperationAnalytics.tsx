import { useMemo } from 'react';
import { useEisenhower } from '@/hooks/useEisenhower';
import { QUADRANT_CONFIG, EisenhowerQuadrant } from '@/types/eisenhower';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, startOfWeek, parseISO, subWeeks } from 'date-fns';
import { CheckCircle2, PlusCircle, TrendingUp, Zap } from 'lucide-react';

const QUADRANTS: EisenhowerQuadrant[] = ['do-first', 'schedule', 'delegate', 'eliminate'];

export const OperationAnalytics = () => {
  const { tasks } = useEisenhower();

  const stats = useMemo(() => {
    const active = tasks.filter((t) => !t.completedAt);
    const completed = tasks.filter((t) => !!t.completedAt);
    const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

    const quadrantStats = QUADRANTS.map((q) => ({
      quadrant: q,
      config: QUADRANT_CONFIG[q],
      active: active.filter((t) => t.quadrant === q).length,
      completed: completed.filter((t) => t.quadrant === q).length,
      total: tasks.filter((t) => t.quadrant === q).length,
    }));

    return { active: active.length, completed: completed.length, total: tasks.length, completionRate, quadrantStats };
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; weekStart: Date; created: number; completed: number }[] = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      weeks.push({
        week: format(weekStart, 'MMM d'),
        weekStart,
        created: 0,
        completed: 0,
      });
    }

    tasks.forEach((task) => {
      const createdDate = parseISO(task.createdAt);
      const createdWeekStart = startOfWeek(createdDate, { weekStartsOn: 1 });
      const weekEntry = weeks.find((w) => w.weekStart.getTime() === createdWeekStart.getTime());
      if (weekEntry) weekEntry.created++;

      if (task.completedAt) {
        const completedDate = parseISO(task.completedAt);
        const completedWeekStart = startOfWeek(completedDate, { weekStartsOn: 1 });
        const cWeekEntry = weeks.find((w) => w.weekStart.getTime() === completedWeekStart.getTime());
        if (cWeekEntry) cWeekEntry.completed++;
      }
    });

    return weeks.map(({ week, created, completed }) => ({ week, created, completed }));
  }, [tasks]);

  return (
    <div className="p-4 space-y-4 overflow-auto scrollbar-thin h-full">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Weekly trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Trend — Created vs Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} className="text-xs" />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} className="text-xs" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Bar dataKey="created" name="Created" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="hsl(var(--rag-green))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-quadrant breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quadrant Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {stats.quadrantStats.map((qs) => (
              <div
                key={qs.quadrant}
                className={`p-3 rounded-lg border ${qs.config.borderClass} ${qs.config.bgClass}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{qs.config.icon}</span>
                  <span className="font-medium text-sm">{qs.config.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{qs.config.subtitle}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono">{qs.active} active</span>
                  <span className="font-mono text-muted-foreground">{qs.completed} done</span>
                </div>
                {qs.total > 0 && <Progress value={(qs.completed / qs.total) * 100} className="mt-2 h-1.5" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
