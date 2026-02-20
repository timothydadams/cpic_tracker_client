import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { ChartContainer, ChartTooltip } from 'ui/chart';
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
      d.focus_area_name.length > 20
        ? d.focus_area_name.slice(0, 17) + '...'
        : d.focus_area_name,
  }));

  const chartHeight = Math.max(300, chartData.length * 40 + 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion by Focus Area</CardTitle>
        <CardDescription>
          Percentage of strategies completed per focus area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='w-full aspect-auto!'
          style={{ height: chartHeight }}
        >
          <BarChart
            layout='vertical'
            data={chartData}
            margin={{ top: 5, right: 40, bottom: 20, left: 0 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type='number'
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type='category'
              dataKey='shortName'
              width={140}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar
              dataKey='completion_rate'
              fill='var(--color-completion_rate)'
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey='completion_rate'
                position='right'
                formatter={(v) => `${v}%`}
                className='fill-foreground'
                fontSize={11}
              />
            </Bar>
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
