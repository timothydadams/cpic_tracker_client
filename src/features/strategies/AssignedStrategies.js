import React, { useEffect } from 'react';
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

import { StrategyCard } from './StrategyCard';

/**
 * 
<Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
 */

const ImplementerView = ({ data, userType }) => {
  const { strategies, implementer } = data;
  const { primary, support } = strategies;
  const totalStrategies = primary.length + support.length;
  return (
    <React.Fragment>
      {implementer && (
        <Heading className='mb-5'>{`${implementer.name} Strategy Responsibilities`}</Heading>
      )}
      <Subheading>Primary Lead</Subheading>
      {/* <StrategyTableList strategies={primary} /> */}
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {primary.map((s) => (
          <StrategyCard
            strategy={s}
            implementerDetails={implementer}
            key={s.id}
            userType={userType}
          />
        ))}
      </div>

      <Subheading>Supporting Effort</Subheading>
      {/* <StrategyTableList strategies={support} /> */}
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {support.map((s) => (
          <StrategyCard
            strategy={s}
            implementerDetails={implementer}
            key={s.id}
            userType={userType}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

const AccTrigHeader = ({ details, strategies }) => {
  const { emails, phone_numbers, name } = details;
  const { primary, support } = strategies;
  const totalStrategies = primary.length + support.length;
  return <div>{`Custom Header Component Not Working :(`}</div>;
};

const BoardMemberView = ({ data, userType }) => {
  console.log('viewing board member display', data);
  return (
    <React.Fragment>
      <Accordion type='single' collapsible>
        {data.map(({ details, strategies }) => {
          const { name } = details;
          const { primary, support } = strategies;

          const allStrategies = primary.concat(support);
          return (
            <AccordionItem value={details.id} key={details.id}>
              <AccordionTrigger>
                {`${name} (${allStrategies.length})`}
              </AccordionTrigger>
              <AccordionContent>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                  {allStrategies.map((s) => (
                    <StrategyCard
                      strategy={s}
                      implementerDetails={details}
                      key={s.id}
                      userType={userType}
                    />
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
      <ImplementerView data={data} userType={userType} />
    ) : (
      <BoardMemberView data={data} userType={userType} />
    );
  }
};
