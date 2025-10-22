import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';
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
export const description = 'A donut chart with text';
const chartData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 287, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 190, fill: 'var(--color-other)' },
];
const chartConfig = {
  strategies: {
    label: 'Strategies',
  },
  Ongoing: {
    label: 'Ongoing',
    color: 'var(--chart-1)',
  },
  'Short-Term': {
    label: 'Short-Term',
    color: 'var(--chart-2)',
  },
  'Mid-Term': {
    label: 'Mid-Term',
    color: 'var(--chart-3)',
  },
  'Long-Term': {
    label: 'Long-Term',
    color: 'var(--chart-4)',
  },
};

export function ChartPieDonutText({ title, data }) {
  const now = new Date();

  const totalStrategies = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{now.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px] w-full'
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={data.map((item) => ({
                ...item,
                fill: `var(--color-${item.timeline})`,
              }))}
              dataKey='count'
              nameKey='timeline'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalStrategies.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Strategies
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          More random footer things... <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>Good stuff</div>
      </CardFooter>
    </Card>
  );
}
