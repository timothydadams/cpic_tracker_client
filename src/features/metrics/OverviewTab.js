import React from 'react';
import { PlanOverviewCards } from './PlanOverviewCards';
import { StrategyBreakdown } from './StrategyBreakdown';

export const OverviewTab = () => {
  return (
    <div className='space-y-6 pt-4'>
      <PlanOverviewCards />
      <StrategyBreakdown />
    </div>
  );
};
