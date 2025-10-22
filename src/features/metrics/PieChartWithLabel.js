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
} from 'ui/chart';

export const description = 'A pie chart with a label';

const chartData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
];

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
  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{now.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0 w-full'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data.map((item) => {
                const key = item.status.replace(' ', '_').toLowerCase();
                return {
                  ...item,
                  fill: `var(--color-${key})`,
                };
              })}
              dataKey='count'
              label
              nameKey='status'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
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
