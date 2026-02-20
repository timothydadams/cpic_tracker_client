import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'ui/badge';
import { Card, CardHeader, CardTitle } from 'ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'ui/accordion';
import { Skeleton } from 'ui/skeleton';
import { useGetImplementerScorecardDetailQuery } from './metricsApiSlice';
import { gradeClasses, StatCard } from './ScorecardDetail';

const loadingContent = (
  <div className='space-y-2 py-1'>
    <Skeleton className='h-4 w-full rounded' />
    <Skeleton className='h-4 w-3/4 rounded' />
  </div>
);

const DetailSections = ({ implementerId, primary }) => {
  const { data, isLoading } = useGetImplementerScorecardDetailQuery(
    { implementerId, ...(primary ? { primary: 'true' } : {}) },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  if (isLoading || !data) {
    return (
      <>
        <AccordionItem value='timeline'>
          <AccordionTrigger className='px-6 no-underline hover:no-underline'>
            By Timeline
          </AccordionTrigger>
          <AccordionContent className='px-6'>{loadingContent}</AccordionContent>
        </AccordionItem>
        <AccordionItem value='focus-area'>
          <AccordionTrigger className='px-6 no-underline hover:no-underline'>
            By Focus Area
          </AccordionTrigger>
          <AccordionContent className='px-6'>{loadingContent}</AccordionContent>
        </AccordionItem>
        <AccordionItem value='recent-completions'>
          <AccordionTrigger className='px-6 no-underline hover:no-underline'>
            Recent Completions
          </AccordionTrigger>
          <AccordionContent className='px-6'>{loadingContent}</AccordionContent>
        </AccordionItem>
        <AccordionItem value='overdue-strategies'>
          <AccordionTrigger className='px-6 no-underline hover:no-underline'>
            Overdue Strategies
          </AccordionTrigger>
          <AccordionContent className='px-6'>{loadingContent}</AccordionContent>
        </AccordionItem>
      </>
    );
  }

  const empty = <p className='text-sm text-muted-foreground py-2'>None</p>;

  return (
    <>
      <AccordionItem value='timeline'>
        <AccordionTrigger className='px-6 no-underline hover:no-underline'>
          By Timeline
        </AccordionTrigger>
        <AccordionContent className='px-6'>
          {data.by_timeline?.length > 0 ? (
            <div className='grid gap-3 grid-cols-2'>
              {data.by_timeline.map((t) => (
                <StatCard
                  key={t.timeline_id}
                  title={t.timeline_name}
                  stats={t}
                />
              ))}
            </div>
          ) : (
            empty
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='focus-area'>
        <AccordionTrigger className='px-6 no-underline hover:no-underline'>
          By Focus Area
        </AccordionTrigger>
        <AccordionContent className='px-6'>
          {data.by_focus_area?.length > 0 ? (
            <div className='grid gap-3 grid-cols-2'>
              {data.by_focus_area.map((f) => (
                <StatCard
                  key={f.focus_area_id}
                  title={f.focus_area_name}
                  stats={f}
                />
              ))}
            </div>
          ) : (
            empty
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='recent-completions'>
        <AccordionTrigger className='px-6 no-underline hover:no-underline'>
          Recent Completions
        </AccordionTrigger>
        <AccordionContent className='px-6'>
          {data.recent_completions?.length > 0 ? (
            <div className='space-y-2'>
              {data.recent_completions.map((s) => (
                <div
                  key={s.strategy_id}
                  className='flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0'
                >
                  <Link
                    to={`/strategies/${s.strategy_id}`}
                    className='text-blue-600 hover:underline dark:text-blue-400 flex-1 mr-4 truncate'
                  >
                    {s.content}
                  </Link>
                  <Badge
                    variant={s.was_on_time ? 'secondary' : 'destructive'}
                    className='shrink-0'
                  >
                    {s.was_on_time ? 'On time' : 'Late'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            empty
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='overdue-strategies'>
        <AccordionTrigger className='px-6 no-underline hover:no-underline'>
          Overdue Strategies
        </AccordionTrigger>
        <AccordionContent className='px-6'>
          {data.overdue_strategies?.length > 0 ? (
            <div className='space-y-2'>
              {data.overdue_strategies.map((s) => (
                <div
                  key={s.strategy_id}
                  className='flex items-center justify-between text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0'
                >
                  <Link
                    to={`/strategies/${s.strategy_id}`}
                    className='text-blue-600 hover:underline dark:text-blue-400 flex-1 mr-4 truncate'
                  >
                    {s.content}
                  </Link>
                  <Badge variant='destructive' className='shrink-0'>
                    {s.days_overdue}d overdue
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            empty
          )}
        </AccordionContent>
      </AccordionItem>
    </>
  );
};

const ScorecardCard = React.memo(({ item, primary }) => {
  const [expanded, setExpanded] = React.useState([]);
  const detailValues = [
    'timeline',
    'focus-area',
    'recent-completions',
    'overdue-strategies',
  ];
  const needsDetail = expanded.some((v) => detailValues.includes(v));

  const { overall } = item;

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between text-base'>
          <span className='truncate mr-2'>{item.implementer_name}</span>
          {overall.total > 0 && (
            <Badge className={`shrink-0 ${gradeClasses[overall.grade] || ''}`}>
              {overall.grade}
            </Badge>
          )}
        </CardTitle>
        {overall.total > 0 ? (
          <p className='text-sm text-muted-foreground'>
            Score: {overall.score}
          </p>
        ) : (
          <p className='text-sm text-muted-foreground'>N/A</p>
        )}
      </CardHeader>
      {overall.total > 0 && (
        <Accordion type='multiple' value={expanded} onValueChange={setExpanded}>
          <AccordionItem value='details'>
            <AccordionTrigger className='px-6 no-underline hover:no-underline'>
              Details
            </AccordionTrigger>
            <AccordionContent className='px-6'>
              <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                <dt className='text-muted-foreground'>Total</dt>
                <dd className='text-right font-medium'>{overall.total}</dd>
                <dt className='text-muted-foreground'>Completed</dt>
                <dd className='text-right font-medium'>{overall.completed}</dd>
                <dt className='text-muted-foreground'>Completion %</dt>
                <dd className='text-right font-medium'>
                  {overall.completion_rate}%
                </dd>
                <dt className='text-muted-foreground'>On-Time %</dt>
                <dd className='text-right font-medium'>
                  {overall.on_time_rate}%
                </dd>
                <dt className='text-muted-foreground'>Overdue</dt>
                <dd className='text-right font-medium'>
                  {overall.overdue > 0 ? (
                    <Badge variant='destructive'>{overall.overdue}</Badge>
                  ) : (
                    0
                  )}
                </dd>
              </dl>
            </AccordionContent>
          </AccordionItem>
          {needsDetail && (
            <DetailSections
              implementerId={item.implementer_id}
              primary={primary}
            />
          )}
          {!needsDetail && (
            <>
              <AccordionItem value='timeline'>
                <AccordionTrigger className='px-6 no-underline hover:no-underline'>
                  By Timeline
                </AccordionTrigger>
              </AccordionItem>
              <AccordionItem value='focus-area'>
                <AccordionTrigger className='px-6 no-underline hover:no-underline'>
                  By Focus Area
                </AccordionTrigger>
              </AccordionItem>
              <AccordionItem value='recent-completions'>
                <AccordionTrigger className='px-6 no-underline hover:no-underline'>
                  Recent Completions
                </AccordionTrigger>
              </AccordionItem>
              <AccordionItem value='overdue-strategies'>
                <AccordionTrigger className='px-6 no-underline hover:no-underline'>
                  Overdue Strategies
                </AccordionTrigger>
              </AccordionItem>
            </>
          )}
        </Accordion>
      )}
    </Card>
  );
});

export const ScorecardCardList = ({ data, primary }) => {
  if (!data?.length) {
    return (
      <p className='text-sm text-muted-foreground py-4 text-center'>
        No scorecard data available.
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {data.map((item) => (
        <ScorecardCard
          key={item.implementer_id}
          item={item}
          primary={primary}
        />
      ))}
    </div>
  );
};
