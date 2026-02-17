import React from 'react';
import {
  useGetStrategyStatusMetricsQuery,
  useGetStrategyTimelineMetricsQuery,
} from './metricsApiSlice';
import { Subheading } from 'catalyst/heading';
import { Dots } from 'components/Spinners';
import { ChartPieLabel } from './PieChartWithLabel';
import { ChartPieDonutText } from './DonutPieChart';

import { Skeleton } from 'ui/skeleton';

export function SkeletonCard() {
  return (
    <div className='flex flex-col space-y-3'>
      <Skeleton className='h-[125px] w-[250px] rounded-xl' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  );
}

const ResponsiveChartContainer = ({ children }) => (
  <div className='relative w-full pb-[250px]'>
    <div className='absolute left-0 right-0 bottom-0 top-0'>{children}</div>
  </div>
);

export const StrategyBreakdown = () => {
  const { data, isLoading } = useGetStrategyStatusMetricsQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });
  const { data: tData, isLoading: tIsLoading } =
    useGetStrategyTimelineMetricsQuery(undefined, {
      selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
    });

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2'>
        {isLoading || !data ? (
          <SkeletonCard />
        ) : (
          <ChartPieLabel title='Strategies By Status' data={data} />
        )}
        {tIsLoading || !tData ? (
          <SkeletonCard />
        ) : (
          <ChartPieDonutText title='Strategies By Timeline' data={tData} />
        )}
      </div>
    </>
  );
};
