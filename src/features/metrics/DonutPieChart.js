import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'ui/chart';
const chartConfig = {
  strategies: {
    label: 'Strategies',
  },
  ongoing: {
    label: 'Ongoing',
    color: 'var(--chart-1)',
  },
  short_term: {
    label: 'Short-Term',
    color: 'var(--chart-2)',
  },
  mid_term: {
    label: 'Mid-Term',
    color: 'var(--chart-3)',
  },
  long_term: {
    label: 'Long-Term',
    color: 'var(--chart-4)',
  },
};

export function ChartPieDonutText({ title, data }) {
  const now = new Date();

  const totalStrategies = React.useMemo(() => {
    if (!data) return 0;
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const charData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      const key = item.timeline.replace('-', '_').toLowerCase();
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
          className='mx-auto aspect-square min-h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey='key' />}
            />
            <Pie
              data={charData}
              dataKey='count'
              nameKey='key'
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
      <div className='px-6 pb-4 text-center'>
        <p className='text-xs text-muted-foreground'>
          Strategy distribution by timeline category
        </p>
      </div>
    </Card>
  );
}
