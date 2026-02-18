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

const gradeClasses = {
  A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  B: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  C: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  D: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  F: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const ScorecardRow = React.memo(({ item, rank, isExpanded, onClick }) => (
  <TableRow
    className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''}`}
    onClick={onClick}
  >
    <TableCell className='font-medium'>{rank}</TableCell>
    <TableCell className='font-medium'>{item.implementer_name}</TableCell>
    <TableCell>
      <Badge className={gradeClasses[item.overall.grade] || ''}>
        {item.overall.grade}
      </Badge>
    </TableCell>
    <TableCell>{item.overall.score}</TableCell>
    <TableCell>{item.overall.total}</TableCell>
    <TableCell>{item.overall.completed}</TableCell>
    <TableCell>{item.overall.completion_rate}%</TableCell>
    <TableCell>{item.overall.on_time_rate}%</TableCell>
    <TableCell>
      {item.overall.overdue > 0 ? (
        <Badge variant='destructive'>{item.overall.overdue}</Badge>
      ) : (
        0
      )}
    </TableCell>
  </TableRow>
));

export const ScorecardTable = ({ data, expandedId, onToggleExpand }) => {
  if (!data?.length) {
    return (
      <p className='text-sm text-muted-foreground py-4 text-center'>
        No scorecard data available.
      </p>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>#</TableHeader>
            <TableHeader>Implementer</TableHeader>
            <TableHeader>Grade</TableHeader>
            <TableHeader>Score</TableHeader>
            <TableHeader>Total</TableHeader>
            <TableHeader>Completed</TableHeader>
            <TableHeader>Completion %</TableHeader>
            <TableHeader>On-Time %</TableHeader>
            <TableHeader>Overdue</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, i) => (
            <ScorecardRow
              key={item.implementer_id}
              item={item}
              rank={i + 1}
              isExpanded={expandedId === item.implementer_id}
              onClick={() => onToggleExpand(item.implementer_id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
