import React from 'react';
import { StrategyTableList } from './StrategyList';
import { useGetMyStrategiesQuery } from './strategiesApiSlice';
import { Heading, Subheading } from 'catalyst/heading';
import { Skeleton } from 'ui/skeleton';

export const AssignedStrategies = () => {
  const { data: strategies, isLoading } = useGetMyStrategiesQuery();

  if (isLoading) {
    return <Skeleton className='w-full h-[100px]' />;
  }

  return (
    strategies && (
      <React.Fragment>
        {strategies?.org_data && (
          <Heading className='mb-5'>{`${strategies.org_data.name} Strategy Responsibilities`}</Heading>
        )}
        <Subheading>Primary Lead</Subheading>
        <StrategyTableList strategies={strategies.primary} />

        <Subheading>Supporting Effort</Subheading>
        <StrategyTableList strategies={strategies.support} />
      </React.Fragment>
    )
  );
};
