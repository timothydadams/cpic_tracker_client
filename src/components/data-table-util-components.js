import * as React from 'react';
import {
  HybridTooltipProvider,
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from 'ui/hybrid-tooltip';
import {
  MoreHorizontal,
  ArrowUpDown,
  HelpCircle,
  CircleOff,
  CheckCircle,
  Timer,
  Circle,
} from 'lucide-react';

import { deadlines } from 'utils/strategy_due_dates';

export const DeadLine = ({ timeline }) => (
  <HybridTooltipProvider>
    <HybridTooltip>
      <HybridTooltipTrigger>{timeline}</HybridTooltipTrigger>
      <HybridTooltipContent>
        {deadlines[timeline]
          ? new Date(deadlines[timeline]).toLocaleDateString()
          : timeline}
      </HybridTooltipContent>
    </HybridTooltip>
  </HybridTooltipProvider>
);

export const StatusBadge = ({ status }) => {
  //const status = cell.getValue();
  let Icon = null;
  if (status === 'Needs Updating') {
    Icon = HelpCircle;
  } else if (status === 'Not Started') {
    Icon = CircleOff;
  } else if (status === 'In Progress') {
    Icon = Timer;
  } else if (status === 'Completed') {
    Icon = CheckCircle;
  }
  return (
    <div className='items-center text-center gap-2'>
      <HybridTooltipProvider>
        <HybridTooltip>
          <HybridTooltipTrigger>
            <Icon className='text-muted-foreground size-4' />
          </HybridTooltipTrigger>
          <HybridTooltipContent>
            <p>{status}</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </HybridTooltipProvider>
    </div>
  );
};
