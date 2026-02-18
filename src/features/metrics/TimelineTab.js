import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Badge } from 'ui/badge';
import { useGetCompletionByTimelineQuery } from './metricsApiSlice';
import { DeadlineDriftCard } from './DeadlineDriftCard';
import { OverdueStrategiesTable } from './OverdueStrategiesTable';
import { KpiCardSkeleton } from './MetricsSkeleton';

const ProgressBar = ({ rate }) => (
  <div className='h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800'>
    <div
      className='h-full rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all'
      style={{ width: `${Math.min(rate, 100)}%` }}
    />
  </div>
);

const formatDeadline = (dateStr) => {
  if (!dateStr) return 'No deadline';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const formatDaysRemaining = (days) => {
  if (days === null || days === undefined) return null;
  if (days < 0) return `${Math.abs(days)} days past due`;
  if (days === 0) return 'Due today';
  return `${days} days remaining`;
};

const TimelineCard = React.memo(({ tier }) => {
  const daysLabel = formatDaysRemaining(tier.days_remaining);
  const isPastDue = tier.days_remaining !== null && tier.days_remaining < 0;

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>{tier.timeline_name}</CardTitle>
        <CardDescription>{formatDeadline(tier.deadline_date)}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div>
          <div className='text-2xl font-bold'>{tier.completion_rate}%</div>
          <p className='text-xs text-muted-foreground'>
            {tier.completed} of {tier.total} completed
          </p>
          <div className='mt-2'>
            <ProgressBar rate={tier.completion_rate} />
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          {daysLabel && (
            <Badge
              variant={isPastDue ? 'destructive' : 'secondary'}
              className='text-xs'
            >
              {daysLabel}
            </Badge>
          )}
          {tier.overdue > 0 && (
            <Badge variant='destructive' className='text-xs'>
              {tier.overdue} overdue
            </Badge>
          )}
        </div>

        <div className='text-sm text-muted-foreground space-y-1'>
          <p>On-time rate: {tier.on_time_rate}%</p>
          <p>Avg days to complete: {tier.avg_days_to_complete}</p>
        </div>
      </CardContent>
    </Card>
  );
});

const TimelineCards = () => {
  const { data, isLoading } = useGetCompletionByTimelineQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !data) {
    return (
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
      {data.map((tier) => (
        <TimelineCard key={tier.timeline_id} tier={tier} />
      ))}
    </div>
  );
};

export const TimelineTab = () => {
  return (
    <div className='space-y-6 pt-4'>
      <TimelineCards />
      <DeadlineDriftCard />
      <OverdueStrategiesTable />
    </div>
  );
};
