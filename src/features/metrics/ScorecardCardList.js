import React from 'react';
import { Badge } from 'ui/badge';
import { Card, CardHeader, CardTitle } from 'ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'ui/accordion';
import { useGetImplementerScorecardDetailQuery } from './metricsApiSlice';
import { gradeClasses, StatCard } from './ScorecardDetail';
import { KpiCardSkeleton } from './MetricsSkeleton';

const DetailSections = ({ implementerId, primary }) => {
  const { data, isLoading } = useGetImplementerScorecardDetailQuery(
    { implementerId, ...(primary ? { primary: 'true' } : {}) },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  if (isLoading || !data) {
    return (
      <div className='grid gap-3 grid-cols-2'>
        {[1, 2].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {data.by_timeline?.length > 0 && (
        <AccordionItem value='timeline'>
          <AccordionTrigger className='px-6 no-underline hover:no-underline'>
            By Timeline
          </AccordionTrigger>
          <AccordionContent className='px-6'>
            <div className='grid gap-3 grid-cols-2'>
              {data.by_timeline.map((t) => (
                <StatCard
                  key={t.timeline_id}
                  title={t.timeline_name}
                  stats={t}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
      {data.by_focus_area?.length > 0 && (
        <AccordionItem value='focus-area'>
          <AccordionTrigger className='px-6 no-underline hover:no-underline'>
            By Focus Area
          </AccordionTrigger>
          <AccordionContent className='px-6'>
            <div className='grid gap-3 grid-cols-2'>
              {data.by_focus_area.map((f) => (
                <StatCard
                  key={f.focus_area_id}
                  title={f.focus_area_name}
                  stats={f}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </>
  );
};

const ScorecardCard = React.memo(({ item, primary }) => {
  const [expanded, setExpanded] = React.useState([]);
  const needsDetail =
    expanded.includes('timeline') || expanded.includes('focus-area');

  const { overall } = item;

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center justify-between text-base'>
          <span className='truncate mr-2'>{item.implementer_name}</span>
          <Badge className={`shrink-0 ${gradeClasses[overall.grade] || ''}`}>
            {overall.grade}
          </Badge>
        </CardTitle>
        <p className='text-sm text-muted-foreground'>Score: {overall.score}</p>
      </CardHeader>
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
          </>
        )}
      </Accordion>
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
