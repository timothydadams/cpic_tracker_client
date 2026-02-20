import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { useGetDeadlineDriftQuery } from './metricsApiSlice';
import { KpiCardSkeleton } from './MetricsSkeleton';
import { MetricInfoTip } from './MetricInfoTip';

export const DeadlineDriftCard = () => {
  const { data, isLoading } = useGetDeadlineDriftQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !data) {
    return <KpiCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deadline Drift</CardTitle>
        <CardDescription>
          How much have strategy deadlines shifted from their original values?
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold'>{data.pushed}</div>
            <p className='text-xs text-muted-foreground'>
              of {data.total_with_deadlines} pushed
              <MetricInfoTip metricKey='pushed' />
            </p>
          </div>
          <div>
            <div className='text-2xl font-bold'>{data.push_rate}%</div>
            <p className='text-xs text-muted-foreground'>
              push rate
              <MetricInfoTip metricKey='push_rate' />
            </p>
          </div>
          <div>
            <div className='text-2xl font-bold'>{data.avg_drift_days}</div>
            <p className='text-xs text-muted-foreground'>
              avg drift (days)
              <MetricInfoTip metricKey='avg_drift_days' />
            </p>
          </div>
        </div>

        {data.by_timeline?.length > 0 && (
          <div className='border-t border-zinc-100 dark:border-zinc-800 pt-3'>
            <p className='text-sm font-medium mb-2'>By Timeline</p>
            <div className='space-y-3'>
              {data.by_timeline.map((t) => (
                <div key={t.timeline_id} className='text-sm'>
                  <p className='font-medium'>{t.timeline_name}</p>
                  <p className='text-muted-foreground'>
                    {t.pushed}/{t.total} pushed ({t.push_rate}%) &middot;{' '}
                    {t.avg_drift_days} days avg
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
