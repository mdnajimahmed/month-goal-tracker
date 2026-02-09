import { useBacklog } from '@/hooks/useBacklog';
import { BACKLOG_CATEGORIES } from '@/types/backlog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Telescope, Clock } from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  low: { label: 'Low', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
};

export const VisionAnalytics = () => {
  const { items } = useBacklog();

  const categorizedItems = BACKLOG_CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.key),
    activeCount: items.filter((i) => i.category === cat.key && !i.completedAt).length,
    completedCount: items.filter((i) => i.category === cat.key && !!i.completedAt).length,
    totalEstHours: items
      .filter((i) => i.category === cat.key)
      .reduce((sum, i) => sum + (i.estimatedHours || 0), 0),
  }));

  const totalItems = items.length;
  const totalActive = items.filter((i) => !i.completedAt).length;
  const totalCompleted = items.filter((i) => !!i.completedAt).length;
  const totalEstHours = items.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);

  return (
    <div className="p-4 space-y-4 overflow-auto scrollbar-thin h-full">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Telescope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {totalActive} active · {totalCompleted} done
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstHours}h</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{BACKLOG_CATEGORIES.length}</div>
            <p className="text-xs text-muted-foreground">
              {categorizedItems.filter((c) => c.items.length > 0).length} with items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalItems > 0 ? ((totalCompleted / totalItems) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCompleted} of {totalItems}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accordion tables per category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion
            type="multiple"
            defaultValue={BACKLOG_CATEGORIES.map((c) => c.key)}
            className="w-full"
          >
            {categorizedItems.map((cat) => (
              <AccordionItem key={cat.key} value={cat.key}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono">
                      {cat.activeCount} active · {cat.completedCount} done
                    </span>
                    {cat.totalEstHours > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {cat.totalEstHours}h est
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {cat.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No items in this category
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="w-20">Priority</TableHead>
                          <TableHead className="w-20">Est (h)</TableHead>
                          <TableHead className="w-28">Start Date</TableHead>
                          <TableHead className="w-20">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.items.map((item) => {
                          const pConfig = priorityConfig[item.priority];
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <span
                                    className={cn(
                                      'text-sm',
                                      item.completedAt && 'line-through text-muted-foreground'
                                    )}
                                  >
                                    {item.title}
                                  </span>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={cn('text-[10px]', pConfig.className)}
                                >
                                  {pConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {item.estimatedHours != null ? `${item.estimatedHours}` : '—'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {format(parseISO(item.tentativeStartDate), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell>
                                {item.completedAt ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-[10px]"
                                  >
                                    Done
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Active
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
