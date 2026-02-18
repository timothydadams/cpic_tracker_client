import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';
import { Badge } from 'ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'catalyst/table';
import { useGetOverdueStrategiesQuery } from './metricsApiSlice';
import { useGetAllTimelineOptionsQuery } from 'features/strategies/strategiesApiSlice';
import { useGetAllFocusAreasQuery } from 'features/focus_areas/focusAreaApiSlice';
import { useGetAllImplementersQuery } from 'features/implementers/implementersApiSlice';
import { TableSkeleton } from './MetricsSkeleton';

const ALL = 'all';

export const OverdueStrategiesTable = () => {
  const [timelineId, setTimelineId] = React.useState(ALL);
  const [focusAreaId, setFocusAreaId] = React.useState(ALL);
  const [implementerId, setImplementerId] = React.useState(ALL);

  const params = React.useMemo(() => {
    const p = {};
    if (timelineId !== ALL) p.timeline_id = timelineId;
    if (focusAreaId !== ALL) p.focus_area_id = focusAreaId;
    if (implementerId !== ALL) p.implementer_id = implementerId;
    return p;
  }, [timelineId, focusAreaId, implementerId]);

  const { data, isLoading } = useGetOverdueStrategiesQuery(params, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  const { data: timelineOptions } = useGetAllTimelineOptionsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });

  const { data: focusAreas } = useGetAllFocusAreasQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });

  const { data: implementers } = useGetAllImplementersQuery(
    {},
    { selectFromResult: ({ data }) => ({ data }) }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Strategies</CardTitle>
        <CardDescription>
          Strategies past their deadline that have not been completed
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-wrap gap-3'>
          <Select value={timelineId} onValueChange={setTimelineId}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Timelines</SelectItem>
              {timelineOptions?.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={focusAreaId} onValueChange={setFocusAreaId}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Focus Areas</SelectItem>
              {focusAreas?.map((f) => (
                <SelectItem key={f.id} value={String(f.id)}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={implementerId} onValueChange={setImplementerId}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Implementers</SelectItem>
              {implementers?.map((imp) => (
                <SelectItem key={imp.id} value={String(imp.id)}>
                  {imp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : !data?.length ? (
          <p className='text-sm text-muted-foreground py-4 text-center'>
            No overdue strategies found.
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Strategy</TableHeader>
                  <TableHeader>Focus Area</TableHeader>
                  <TableHeader>Timeline</TableHeader>
                  <TableHeader>Days Overdue</TableHeader>
                  <TableHeader>Primary Implementer</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((s) => (
                  <TableRow key={s.strategy_id}>
                    <TableCell>
                      <Link
                        to={`/strategies/${s.strategy_id}`}
                        className='text-blue-600 hover:underline dark:text-blue-400'
                      >
                        {s.content.length > 60
                          ? s.content.slice(0, 57) + '...'
                          : s.content}
                      </Link>
                    </TableCell>
                    <TableCell>{s.focus_area}</TableCell>
                    <TableCell>{s.timeline}</TableCell>
                    <TableCell>
                      <Badge variant='destructive'>{s.days_overdue}d</Badge>
                    </TableCell>
                    <TableCell>{s.primary_implementer || '\u2014'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
