import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Badge } from 'ui/badge';
import { useGetImplementerScorecardDetailQuery } from './metricsApiSlice';
import { KpiCardSkeleton } from './MetricsSkeleton';

export const gradeClasses = {
  A: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800',
  B: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
  C: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800',
  D: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800',
  F: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800',
};

export const StatCard = ({ title, stats }) => (
  <div className='rounded-lg border border-zinc-200 dark:border-zinc-800 p-3'>
    <p className='text-sm font-medium mb-1 truncate' title={title}>
      {title}
    </p>
    {stats.total === 0 ? (
      <p className='text-sm text-muted-foreground text-center py-3'>N/A</p>
    ) : (
      <>
        <div className='flex items-center gap-2'>
          <Badge className={gradeClasses[stats.grade] || ''}>
            {stats.grade}
          </Badge>
          <span className='text-sm text-muted-foreground'>
            Score: {stats.score}
          </span>
        </div>
        <div className='mt-2 text-xs text-muted-foreground space-y-0.5'>
          <p>
            {stats.completed}/{stats.total} completed ({stats.completion_rate}%)
          </p>
          <p>On-time: {stats.on_time_rate}%</p>
          {stats.overdue > 0 && (
            <p className='text-red-600 dark:text-red-400'>
              {stats.overdue} overdue
            </p>
          )}
        </div>
      </>
    )}
  </div>
);

export const ScorecardDetail = ({ implementerId, primary, onClose }) => {
  const { data, isLoading } = useGetImplementerScorecardDetailQuery(
    { implementerId, ...(primary ? { primary: 'true' } : {}) },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  if (isLoading || !data) {
    return (
      <Card className='rounded-none border-x-0 whitespace-normal'>
        <CardContent className='pt-6'>
          <div className='grid gap-3 grid-cols-2 lg:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='rounded-none border-x-0 whitespace-normal'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            {data.implementer_name}
            <Badge className={gradeClasses[data.overall.grade] || ''}>
              {data.overall.grade}
            </Badge>
          </CardTitle>
          <CardDescription>
            Score: {data.overall.score} &middot; {data.overall.completed}/
            {data.overall.total} completed &middot; On-time:{' '}
            {data.overall.on_time_rate}%
          </CardDescription>
        </div>
        <button
          onClick={onClose}
          className='rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          type='button'
        >
          <XIcon className='h-5 w-5' />
        </button>
      </CardHeader>
      <CardContent className='space-y-6'>
        {data.by_timeline?.length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>By Timeline</p>
            <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
              {data.by_timeline.map((t) => (
                <StatCard
                  key={t.timeline_id}
                  title={t.timeline_name}
                  stats={t}
                />
              ))}
            </div>
          </div>
        )}

        {data.by_focus_area?.length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>By Focus Area</p>
            <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              {data.by_focus_area.map((f) => (
                <StatCard
                  key={f.focus_area_id}
                  title={f.focus_area_name}
                  stats={f}
                />
              ))}
            </div>
          </div>
        )}

        {data.recent_completions?.length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>Recent Completions</p>
            <div className='space-y-2'>
              {data.recent_completions.map((s) => (
                <div
                  key={s.strategy_id}
                  className='flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0'
                >
                  <Link
                    to={`/strategies/${s.strategy_id}`}
                    className='text-blue-600 hover:underline dark:text-blue-400 flex-1 mr-4 truncate'
                  >
                    {s.content}
                  </Link>
                  <div className='flex items-center gap-2 whitespace-nowrap'>
                    <span className='text-muted-foreground'>
                      {s.focus_area} &middot; {s.timeline}
                    </span>
                    <Badge
                      variant={s.was_on_time ? 'secondary' : 'destructive'}
                    >
                      {s.was_on_time ? 'On time' : 'Late'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.overdue_strategies?.length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>Overdue Strategies</p>
            <div className='space-y-2'>
              {data.overdue_strategies.map((s) => (
                <div
                  key={s.strategy_id}
                  className='flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0'
                >
                  <Link
                    to={`/strategies/${s.strategy_id}`}
                    className='text-blue-600 hover:underline dark:text-blue-400 flex-1 mr-4 truncate'
                  >
                    {s.content}
                  </Link>
                  <div className='flex items-center gap-2 whitespace-nowrap'>
                    <span className='text-muted-foreground'>
                      {s.focus_area} &middot; {s.timeline}
                    </span>
                    <Badge variant='destructive'>
                      {s.days_overdue}d overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
