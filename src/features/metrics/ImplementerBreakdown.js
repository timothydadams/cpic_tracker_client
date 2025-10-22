import React from 'react';
import { useGetImplementerMetricsQuery } from './metricsApiSlice';
import { Subheading } from 'catalyst/heading';
import { Loading } from 'components/Spinners';

export const ImplementerBreakdown = () => {
  const { data: fullData, isLoading: isLoadingFullData } =
    useGetImplementerMetricsQuery();
  const { data: leadData, isLoading: isLoadingLeadData } =
    useGetImplementerMetricsQuery({ primary: 'true' });

  if (isLoadingFullData || isLoadingLeadData) {
    return <Loading />;
  }

  const ready = fullData && leadData;

  return (
    ready && (
      <>
        <Subheading>Implementer Count:Full Work Breakdown</Subheading>
        {fullData.map((item) => (
          <p>
            {item.implementer_name} - {item.count}
          </p>
        ))}

        <Subheading>Implementer Count: Primary Lead</Subheading>
        {leadData.map((item) => (
          <p>
            {item.implementer_name} - {item.count}
          </p>
        ))}
      </>
    )
  );
};
