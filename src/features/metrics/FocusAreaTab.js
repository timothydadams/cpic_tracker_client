import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'ui/chart';
import { useGetCompletionByFocusAreaQuery } from './metricsApiSlice';
import { FocusAreaProgressTree } from './FocusAreaProgressTree';
import { ChartSkeleton } from './MetricsSkeleton';

const chartConfig = {
  completion_rate: {
    label: 'Completion Rate',
    color: 'var(--chart-2)',
  },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className='rounded-lg border bg-background p-3 shadow-md text-sm'>
      <p className='font-medium mb-1'>{d.focus_area_name}</p>
      <div className='space-y-0.5 text-muted-foreground'>
        <p>Total: {d.total}</p>
        <p>Completed: {d.completed}</p>
        <p>In Progress: {d.in_progress}</p>
        <p>Needs Updating: {d.needs_updating}</p>
        {d.overdue > 0 && (
          <p className='text-red-600 dark:text-red-400'>Overdue: {d.overdue}</p>
        )}
      </div>
    </div>
  );
};

const CompletionByFocusAreaChart = () => {
  const { data, isLoading } = useGetCompletionByFocusAreaQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !data) {
    return <ChartSkeleton />;
  }

  const chartData = data.map((d) => ({
    ...d,
    shortName:
      d.focus_area_name.length > 25
        ? d.focus_area_name.slice(0, 22) + '...'
        : d.focus_area_name,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion by Focus Area</CardTitle>
        <CardDescription>
          Percentage of strategies completed per focus area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
          <BarChart layout='vertical' data={chartData}>
            <CartesianGrid horizontal={false} />
            <XAxis
              type='number'
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type='category'
              dataKey='shortName'
              width={180}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar
              dataKey='completion_rate'
              fill='var(--color-completion_rate)'
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export const FocusAreaTab = () => {
  return (
    <div className='space-y-6 pt-4'>
      <CompletionByFocusAreaChart />
      <FocusAreaProgressTree />
    </div>
  );
};
