import React from 'react';
import {
  useGetImplementerMetricsQuery,
  useGetStrategyStatsByImplementerQuery,
} from './metricsApiSlice';
import { Subheading } from 'catalyst/heading';
import { Dots } from 'components/Spinners';
import { ImplementerChartRadialStacked } from './RadialChartStacked';

export const ImplementerBreakdown = () => {
  const { data: fullData, isLoading: isLoadingFullData } =
    useGetImplementerMetricsQuery(undefined, {
      selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
    });
  const { data: leadData, isLoading: isLoadingLeadData } =
    useGetImplementerMetricsQuery(
      { primary: 'true' },
      { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
    );

  const { data: implementerStats } = useGetStrategyStatsByImplementerQuery(
    undefined,
    { selectFromResult: ({ data }) => ({ data }) }
  );

  if (isLoadingFullData || isLoadingLeadData) {
    return <Dots />;
  }

  const ready = fullData && leadData && implementerStats;

  return (
    ready && (
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {implementerStats.map((x) => (
          <ImplementerChartRadialStacked implementer={x} key={x.id} />
        ))}

        {/* 
        <Subheading>Implementer Count:Full Work Breakdown</Subheading>
        {fullData.map((item, i) => (
          <p key={`full_${i}`}>
            {item.implementer_name} - {item.count}
          </p>
        ))}

        <Subheading>Implementer Count: Primary Lead</Subheading>
        {leadData.map((item, i) => (
          <p key={`lead_${i}`}>
            {item.implementer_name} - {item.count}
          </p>
        ))}
          */}
      </div>
    )
  );
};
