import React from 'react';
import {
  TargetIcon,
  PercentIcon,
  ClockIcon,
  AlertTriangleIcon,
  CalendarCheckIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import { useGetPlanOverviewQuery } from './metricsApiSlice';
import { KpiCardSkeleton } from './MetricsSkeleton';
import { MetricInfoTip } from './MetricInfoTip';

const kpiCards = [
  {
    key: 'total',
    title: 'Total Strategies',
    icon: TargetIcon,
    getValue: (d) => d.total_strategies,
    getSubtext: (d) => `${d.completed} completed, ${d.in_progress} in progress`,
  },
  {
    key: 'completion',
    title: 'Completion Rate',
    icon: PercentIcon,
    metricKey: 'completion_rate',
    getValue: (d) => `${d.completion_rate}%`,
    getSubtext: (d) => `${d.completed} of ${d.total_strategies} strategies`,
  },
  {
    key: 'ontime',
    title: 'On-Time Rate',
    icon: ClockIcon,
    metricKey: 'on_time_rate',
    getValue: (d) => `${d.on_time_rate}%`,
    getSubtext: (d) =>
      `${d.on_time_completions} on-time, ${d.late_completions} late`,
  },
  {
    key: 'overdue',
    title: 'Overdue',
    icon: AlertTriangleIcon,
    metricKey: 'overdue',
    getValue: (d) => d.overdue,
    getSubtext: () => 'strategies past deadline',
    highlight: (d) => d.overdue > 0,
  },
  {
    key: 'avgdays',
    title: 'Avg Days to Complete',
    icon: CalendarCheckIcon,
    metricKey: 'avg_days_to_complete',
    getValue: (d) => d.avg_days_to_complete,
    getSubtext: () => 'days across completed strategies',
  },
];

export const PlanOverviewCards = () => {
  const { data, isLoading } = useGetPlanOverviewQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !data) {
    return (
      <div className='grid gap-4 grid-cols-2 lg:grid-cols-5'>
        {kpiCards.map((c) => (
          <KpiCardSkeleton key={c.key} />
        ))}
      </div>
    );
  }

  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-5'>
      {kpiCards.map((c) => {
        const Icon = c.icon;
        const isHighlighted = c.highlight?.(data);
        return (
          <Card key={c.key}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {c.title}
                {c.metricKey && <MetricInfoTip metricKey={c.metricKey} />}
              </CardTitle>
              <Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${isHighlighted ? 'text-red-600 dark:text-red-400' : ''}`}
              >
                {c.getValue(data)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {c.getSubtext(data)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
