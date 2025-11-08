import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from 'ui/chart';

export const description = 'A pie chart with a label';

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
    return data.map((item) => {
      const key = item.status.replace(' ', '_').toLowerCase();
      return {
        ...item,
        key,
        fill: `var(--color-${key})`,
      };
    });
  });

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
      <CardFooter className='flex-grow min-h-0 flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          Some footer stuff here <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing current statuses for all strategies
        </div>
      </CardFooter>
    </Card>
  );
}
