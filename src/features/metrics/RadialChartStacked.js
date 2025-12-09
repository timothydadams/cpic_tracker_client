import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'ui/chart';
export const description = 'A radial chart with stacked sections';
//const chartData = [{ month: "january", desktop: 1260, mobile: 570 }]
const chartConfig = {
  inProgress: {
    label: 'In Progress',
    color: 'var(--chart-1)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--chart-2)',
  },
  remaining: {
    label: 'Remaining',
    color: 'var(--chart-3)',
  },
  total: {
    label: 'Total Assigned',
    color: 'var(--sidebar-ring)',
  },
};

export function ImplementerChartRadialStacked({ implementer }) {
  const { name, strategy_stats } = implementer;
  const { total, inProgress, completed } = strategy_stats;

  const memoizedData = React.useMemo(() => {
    return [
      {
        inProgress,
        inProgressPercent: (inProgress / total) * 100 ?? 0,
        completed,
        completedPercent: (completed / total) * 100 ?? 0,
        total,
        totalPercent: 100,
        remaining: total - (inProgress + completed),
      },
    ];
  });

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{name}</CardTitle>
        {/* <CardDescription>Progress Towards CPIC Goals</CardDescription> */}
      </CardHeader>
      <CardContent className='flex flex-1 items-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square w-full min-h-[100px] align-middle' //max-w-[250px]
        >
          <RadialBarChart
            data={memoizedData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={false}
              tickLine={false}
              axisLine={false}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle'>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className='fill-foreground text-2xl font-bold'
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className='fill-muted-foreground'
                        >
                          Assigned
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>

            {/** 
            <RadialBar
                dataKey="total"
                fill='var(--color-total)'
                stackId="a"
                isAnimationActive={false}
            />
            */}
            <RadialBar
              dataKey='inProgress'
              stackId='a'
              background={{ fill: 'var(--sidebar-ring)' }}
              fill='var(--color-inProgress)'
              className='stroke-transparent stroke-2'
            />

            <RadialBar
              dataKey='completed'
              fill='var(--color-completed)'
              stackId='a'
              className='stroke-transparent stroke-2'
            />

            <RadialBar
              dataKey='remaining'
              fill='var(--color-remaining)'
              stackId='a'
              cornerRadius={5}
              className='stroke-transparent stroke-2'
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        {total > 0 && (
          <div className='flex items-center gap-2 leading-none font-medium'>
            {completed} of {total} assigned strategies are completed
          </div>
        )}
        {/* 
        <div className="text-muted-foreground leading-none">
          Showing implementer progress towards Comprehensive Plan goals.
        </div>
        */}
      </CardFooter>
    </Card>
  );
}
