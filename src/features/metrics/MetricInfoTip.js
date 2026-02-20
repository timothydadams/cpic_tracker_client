import React from 'react';
import { InfoIcon } from 'lucide-react';
import {
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from 'ui/hybrid-tooltip';
import { METRIC_DEFINITIONS } from './metricDefinitions';

export const MetricInfoTip = ({ metricKey }) => {
  const explanation = METRIC_DEFINITIONS[metricKey];
  if (!explanation) return null;

  return (
    <HybridTooltip>
      <HybridTooltipTrigger asChild>
        <span
          role='button'
          tabIndex={0}
          className='inline-flex items-center align-middle ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-help'
          aria-label={`Info about ${metricKey.replace(/_/g, ' ')}`}
        >
          <InfoIcon className='h-3.5 w-3.5' />
        </span>
      </HybridTooltipTrigger>
      <HybridTooltipContent className='max-w-xs text-xs'>
        <p>{explanation}</p>
      </HybridTooltipContent>
    </HybridTooltip>
  );
};
