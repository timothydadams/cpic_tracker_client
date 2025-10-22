import React from 'react';
import {
  useGetStrategyStatusMetricsQuery,
  useGetStrategyTimelineMetricsQuery,
} from './metricsApiSlice';
import { Subheading } from 'catalyst/heading';
import { Loading } from 'components/Spinners';
import { ChartPieLabel } from './PieChartWithLabel';
import { ChartPieDonutText } from './DonutPieChart';

export const StrategyBreakdown = () => {
  const { data, isLoading } = useGetStrategyStatusMetricsQuery();
  const { data: tData, isLoading: tIsLoading } =
    useGetStrategyTimelineMetricsQuery();

  if (isLoading || tIsLoading) {
    return <Loading />;
  }

  const ready = data && tData;

  return (
    ready && (
      <>
        <div className='grid gap-4 md:grid-cols-2'>
          <ChartPieLabel title='Strategies By Status' data={data} />

          <ChartPieDonutText title='Strategies By Timeline' data={tData} />
        </div>
      </>
    )
  );
};
