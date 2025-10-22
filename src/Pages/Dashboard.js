import React from 'react';
import { Text } from 'catalyst/text.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { ImplementerBreakdown } from '../features/metrics/ImplementerBreakdown';
import { StrategyBreakdown } from '../features/metrics/StrategyBreakdown';

export const Dashboard = () => {
  return (
    <>
      <div className='flex'>
        <div>
          <Heading>Strategy Metrics</Heading>
          <StrategyBreakdown />

          <Heading>Implementer Metrics</Heading>
          <ImplementerBreakdown />
        </div>
      </div>
    </>
  );
};
