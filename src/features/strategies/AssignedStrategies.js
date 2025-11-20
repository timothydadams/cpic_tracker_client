import React from 'react';
import { StrategyTableList } from './StrategyList';
import { useGetMyStrategiesQuery } from './strategiesApiSlice';
import { Heading, Subheading } from 'catalyst/heading';
import { Skeleton } from 'ui/skeleton';
import { useSelector } from 'react-redux';
import { selectCurrentRoles } from '../auth/authSlice';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'ui/accordion';
import { Separator } from 'ui/separator';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'ui/card';

const DescriptionRow = ({ statusTitle, timelineTitle }) => (
  <div className='flex h-5 items-center space-x-4 text-sm'>
    <div>{statusTitle}</div>
    <Separator orientation='vertical' />
    <div>{timelineTitle}</div>
  </div>
);

export const StrategyCard = ({ strategy }) => {
  const { content, focus_area, policy, timeline, status } = strategy;
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>{focus_area.name}</CardTitle>
        <CardDescription>
          <DescriptionRow
            statusTitle={status.title}
            timelineTitle={timeline.title}
          />
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter className='text-sm text-zinc-500 dark:text-zinc-400'>
        {policy.description}
      </CardFooter>
    </Card>
  );
};

const ImplementerView = ({ data }) => {
  console.log(data);

  return (
    <React.Fragment>
      {data?.org_data && (
        <Heading className='mb-5'>{`${strategies.org_data.name} Strategy Responsibilities`}</Heading>
      )}
      <Subheading>Primary Lead</Subheading>
      <StrategyTableList strategies={strategies.primary} />

      <Subheading>Supporting Effort</Subheading>
      <StrategyTableList strategies={strategies.support} />
    </React.Fragment>
  );
};

const AccTrigHeader = ({ details, strategies }) => {
  const { emails, phone_numbers, name } = details;
  const { primary, support } = strategies;
  const totalStrategies = primary.length + support.length;
  return <div>{`Custom Header Component Not Working :(`}</div>;
};

const BoardMemberView = ({ data }) => {
  console.log('viewing board member display', data);
  return (
    <React.Fragment>
      <Accordion type='single' collapsible>
        {data.map(({ details, strategies }) => {
          const { name } = details;
          const { primary, support } = strategies;
          const allStrategies = primary.concat(support);
          return (
            <AccordionItem value={details.id}>
              <AccordionTrigger>
                {`${name} | Total Strategies: ${allStrategies.length}`}
              </AccordionTrigger>
              <AccordionContent>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                  {allStrategies.map((s) => (
                    <StrategyCard strategy={s} key={s.id} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </React.Fragment>
  );
};

export const AssignedStrategies = () => {
  const userRoles = useSelector(selectCurrentRoles);
  const userType = userRoles.includes('Implementer') ? 'Implementer' : 'CPIC';

  const { data, isLoading } = useGetMyStrategiesQuery();

  if (isLoading) {
    return <Skeleton className='w-full h-[100px]' />;
  }

  if (data) {
    return userType === 'Implementer' ? (
      <ImplementerView data={data} />
    ) : (
      <BoardMemberView data={data} />
    );
  }
};
