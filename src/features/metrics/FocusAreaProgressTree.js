import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Badge } from 'ui/badge';
import { useGetFocusAreaProgressQuery } from './metricsApiSlice';
import { ChartSkeleton } from './MetricsSkeleton';
import { MetricInfoTip } from './MetricInfoTip';

const ProgressBar = ({ rate }) => (
  <div className='h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800'>
    <div
      className='h-full rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all'
      style={{ width: `${Math.min(rate, 100)}%` }}
    />
  </div>
);

const PolicyRow = React.memo(({ policy }) => (
  <div className='flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0'>
    <div className='flex-1 min-w-0'>
      <p className='text-sm font-medium truncate'>
        Policy {policy.policy_number}: {policy.description}
      </p>
      <div className='mt-1'>
        <ProgressBar rate={policy.completion_rate} />
      </div>
    </div>
    <div className='text-sm text-muted-foreground whitespace-nowrap'>
      {policy.completed}/{policy.total}
    </div>
    {policy.overdue > 0 && (
      <Badge variant='destructive' className='text-xs'>
        {policy.overdue} overdue
      </Badge>
    )}
  </div>
));

const FocusAreaSection = React.memo(({ area }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className='w-full text-left'
        type='button'
      >
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div className='flex-1'>
            <CardTitle className='text-base'>{area.name}</CardTitle>
            <CardDescription>
              {area.total_strategies} strategies &middot; {area.completion_rate}
              % complete
              <MetricInfoTip metricKey='completion_rate' />
            </CardDescription>
          </div>
          <ChevronDownIcon
            className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </CardHeader>
      </button>
      {open && (
        <CardContent className='pt-0'>
          {area.policies.map((policy) => (
            <PolicyRow key={policy.policy_id} policy={policy} />
          ))}
        </CardContent>
      )}
    </Card>
  );
});

export const FocusAreaProgressTree = () => {
  const { data, isLoading } = useGetFocusAreaProgressQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !data) {
    return <ChartSkeleton />;
  }

  return (
    <div className='space-y-3'>
      {data.map((area) => (
        <FocusAreaSection key={area.focus_area_id} area={area} />
      ))}
    </div>
  );
};
