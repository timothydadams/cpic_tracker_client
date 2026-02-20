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
import { ScorecardDetail, gradeClasses } from './ScorecardDetail';

const ScorecardRow = React.memo(({ item, rank, isExpanded, onClick }) => (
  <TableRow
    className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}
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
    <div className='overflow-x-auto'>
      <Table dense>
        <TableHead>
          <TableRow>
            <TableHeader>#</TableHeader>
            <TableHeader>Implementer</TableHeader>
            <TableHeader>Grade</TableHeader>
            <TableHeader>Score</TableHeader>
            <TableHeader>Done</TableHeader>
            <TableHeader>Comp %</TableHeader>
            <TableHeader>On-Time %</TableHeader>
            <TableHeader>Overdue</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, i) => {
            const isExpanded = expandedId === item.implementer_id;
            return (
              <React.Fragment key={item.implementer_id}>
                <ScorecardRow
                  item={item}
                  rank={i + 1}
                  isExpanded={isExpanded}
                  onClick={() => onToggleExpand(item.implementer_id)}
                />
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={8} className='p-0 border-b-0'>
                      <ScorecardDetail
                        implementerId={item.implementer_id}
                        primary={primary}
                        onClose={() => onToggleExpand(item.implementer_id)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
