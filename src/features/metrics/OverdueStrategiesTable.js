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
import { Skeleton } from 'ui/skeleton';
import { useGetOverdueStrategiesQuery } from './metricsApiSlice';
import { useGetAllTimelineOptionsQuery } from 'features/strategies/strategiesApiSlice';
import { useGetAllFocusAreasQuery } from 'features/focus_areas/focusAreaApiSlice';
import { useGetAllImplementersQuery } from 'features/implementers/implementersApiSlice';

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
          <div className='space-y-3'>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className='rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-2'
              >
                <Skeleton className='h-4 w-3/4 rounded' />
                <Skeleton className='h-3 w-1/2 rounded' />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <p className='text-sm text-muted-foreground py-4 text-center'>
            No overdue strategies found.
          </p>
        ) : (
          <div className='space-y-2'>
            {data.map((s) => (
              <div
                key={s.strategy_id}
                className='rounded-lg border border-zinc-200 dark:border-zinc-800 p-3'
              >
                <div className='flex items-start justify-between gap-3'>
                  <Link
                    to={`/strategies/${s.strategy_id}`}
                    className='text-sm text-blue-600 hover:underline dark:text-blue-400'
                  >
                    {s.content}
                  </Link>
                  <Badge variant='destructive' className='shrink-0'>
                    {s.days_overdue}d
                  </Badge>
                </div>
                <div className='mt-1 text-xs text-muted-foreground space-y-0.5'>
                  <p>{s.focus_area}</p>
                  <div className='flex items-center justify-between'>
                    <span>{s.timeline}</span>
                    {s.primary_implementer && (
                      <span>{s.primary_implementer}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
