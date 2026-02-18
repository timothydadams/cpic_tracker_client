import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';
import { useGetImplementerScorecardQuery } from './metricsApiSlice';
import { CompletionTrendChart } from './CompletionTrendChart';
import { ScorecardTable } from './ScorecardTable';
import { ScorecardDetail } from './ScorecardDetail';
import { TableSkeleton } from './MetricsSkeleton';

export const ImplementerTab = () => {
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

      <Card>
        <CardHeader>
          <CardTitle>Implementer Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          {scorecardLoading ? (
            <TableSkeleton rows={6} cols={9} />
          ) : (
            <ScorecardTable
              data={scorecardData}
              expandedId={expandedId}
              onToggleExpand={handleToggleExpand}
            />
          )}
        </CardContent>
      </Card>

      {expandedId && (
        <ScorecardDetail
          implementerId={expandedId}
          primary={isPrimary}
          onClose={() => setExpandedId(null)}
        />
      )}
    </div>
  );
};
