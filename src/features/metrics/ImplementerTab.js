import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';
import { useMediaQuery } from '@uidotdev/usehooks';
import { useGetImplementerScorecardQuery } from './metricsApiSlice';
import { CompletionTrendChart } from './CompletionTrendChart';
import { ScorecardTable } from './ScorecardTable';
import { ScorecardCardList } from './ScorecardCardList';
import { TableSkeleton } from './MetricsSkeleton';

export const ImplementerTab = () => {
  const isMobile = useMediaQuery('only screen and (max-width: 1410px)');
  const [primaryOnly, setPrimaryOnly] = React.useState('false');
  const [period, setPeriod] = React.useState('monthly');
  const [expandedId, setExpandedId] = React.useState(null);

  const isPrimary = primaryOnly === 'true';

  const { data: scorecardData, isLoading: scorecardLoading } =
    useGetImplementerScorecardQuery(
      isPrimary ? { primary: 'true' } : undefined,
      { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
    );

  const handleToggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className='space-y-6 pt-4'>
      <div className='flex flex-wrap gap-3'>
        <Select value={primaryOnly} onValueChange={setPrimaryOnly}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='false'>All Strategies</SelectItem>
            <SelectItem value='true'>Primary Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='monthly'>Monthly</SelectItem>
            <SelectItem value='quarterly'>Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CompletionTrendChart period={period} />

      {isMobile ? (
        scorecardLoading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : (
          <ScorecardCardList data={scorecardData} primary={isPrimary} />
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Implementer Scorecard</CardTitle>
          </CardHeader>
          <CardContent>
            {scorecardLoading ? (
              <TableSkeleton rows={6} cols={8} />
            ) : (
              <ScorecardTable
                data={scorecardData}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                primary={isPrimary}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
