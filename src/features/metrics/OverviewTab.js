import React from 'react';
import { HybridTooltipProvider } from 'ui/hybrid-tooltip';
import { PlanOverviewCards } from './PlanOverviewCards';
import { StrategyBreakdown } from './StrategyBreakdown';

export const OverviewTab = () => {
  return (
    <HybridTooltipProvider>
      <div className='space-y-6 pt-4'>
        <PlanOverviewCards />
        <StrategyBreakdown />
      </div>
    </HybridTooltipProvider>
  );
};
