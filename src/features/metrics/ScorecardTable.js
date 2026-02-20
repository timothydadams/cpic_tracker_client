import React from 'react';
import { Badge } from 'ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'catalyst/table';
import { ScorecardDetailModal, gradeClasses } from './ScorecardDetail';
import { MetricInfoTip } from './MetricInfoTip';

const ScorecardRow = React.memo(({ item, rank, onClick }) => (
  <TableRow
    className='cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
    onClick={onClick}
  >
    <TableCell className='font-medium'>{rank}</TableCell>
    <TableCell className='font-medium'>{item.implementer_name}</TableCell>
    {item.overall.total === 0 ? (
      <TableCell colSpan={6} className='text-center text-muted-foreground'>
        N/A
      </TableCell>
    ) : (
      <>
        <TableCell>
          <Badge className={gradeClasses[item.overall.grade] || ''}>
            {item.overall.grade}
          </Badge>
        </TableCell>
        <TableCell>{item.overall.score}</TableCell>
        <TableCell>
          {item.overall.completed}/{item.overall.total}
        </TableCell>
        <TableCell>{item.overall.completion_rate}%</TableCell>
        <TableCell>{item.overall.on_time_rate}%</TableCell>
        <TableCell>
          {item.overall.overdue > 0 ? (
            <Badge variant='destructive'>{item.overall.overdue}</Badge>
          ) : (
            0
          )}
        </TableCell>
      </>
    )}
  </TableRow>
));

export const ScorecardTable = ({
  data,
  expandedId,
  onToggleExpand,
  primary,
}) => {
  if (!data?.length) {
    return (
      <p className='text-sm text-muted-foreground py-4 text-center'>
        No scorecard data available.
      </p>
    );
  }

  return (
    <>
      <div className='overflow-x-auto'>
        <Table dense>
          <TableHead>
            <TableRow>
              <TableHeader>#</TableHeader>
              <TableHeader>Implementer</TableHeader>
              <TableHeader>
                Grade <MetricInfoTip metricKey='grade' />
              </TableHeader>
              <TableHeader>
                Score <MetricInfoTip metricKey='score' />
              </TableHeader>
              <TableHeader>Done</TableHeader>
              <TableHeader>
                Comp % <MetricInfoTip metricKey='completion_rate' />
              </TableHeader>
              <TableHeader>
                On-Time % <MetricInfoTip metricKey='on_time_rate' />
              </TableHeader>
              <TableHeader>
                Overdue <MetricInfoTip metricKey='overdue' />
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, i) => (
              <ScorecardRow
                key={item.implementer_id}
                item={item}
                rank={i + 1}
                onClick={() => onToggleExpand(item.implementer_id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <ScorecardDetailModal
        implementerId={expandedId}
        primary={primary}
        open={!!expandedId}
        onOpenChange={(open) => {
          if (!open) onToggleExpand(expandedId);
        }}
      />
    </>
  );
};
