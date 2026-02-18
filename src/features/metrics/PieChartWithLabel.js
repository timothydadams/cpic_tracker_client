import React from 'react';
import { Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent } from 'ui/chart';

const chartConfig = {
  strategies: {
    label: 'Strategies',
  },
  needs_updating: {
    label: 'Needs Updating',
    color: 'var(--chart-1)',
  },
  in_progress: {
    label: 'In Progress',
    color: 'var(--chart-2)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--chart-3)',
  },
  not_started: {
    label: 'Not Started',
    color: 'var(--chart-4)',
  },
};

export function ChartPieLabel({ data, title }) {
  const now = new Date();

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      const key = item.status.replace(' ', '_').toLowerCase();
      return {
        ...item,
        key,
        fill: `var(--color-${key})`,
      };
    });
  }, [data]);

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{now.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow min-h-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square min-h-[250px]'
        >
          <PieChart>
            {/* <ChartTooltip content={<ChartTooltipContent hideLabel />} /> */}
            <Pie data={chartData} dataKey='count' label />
            <ChartLegend
              content={<ChartLegendContent nameKey='key' />}
              className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className='px-6 pb-4 text-center'>
        <p className='text-xs text-muted-foreground'>
          Current status distribution across all strategies
        </p>
      </div>
    </Card>
  );
}
