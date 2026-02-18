import React from 'react';
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'ui/chart';
import { useGetCompletionTrendQuery } from './metricsApiSlice';
import { ChartSkeleton } from './MetricsSkeleton';

const chartConfig = {
  completed: {
    label: 'Completed',
    color: 'var(--chart-2)',
  },
  cumulative: {
    label: 'Cumulative',
    color: 'var(--chart-1)',
  },
};

export const CompletionTrendChart = ({ period = 'monthly' }) => {
  const { data, isLoading } = useGetCompletionTrendQuery(
    { period },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  if (isLoading || !data) {
    return <ChartSkeleton />;
  }

  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground py-8 text-center'>
            Not enough data to show a trend yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Trend</CardTitle>
        <CardDescription>
          {period === 'monthly' ? 'Monthly' : 'Quarterly'} strategy completions
          over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='min-h-[250px] w-full'>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='period' tick={{ fontSize: 12 }} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type='monotone'
              dataKey='completed'
              fill='var(--color-completed)'
              stroke='var(--color-completed)'
              fillOpacity={0.3}
            />
            <Line
              type='monotone'
              dataKey='cumulative'
              stroke='var(--color-cumulative)'
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
