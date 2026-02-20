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

const ImplementerView = ({ data }) => {
  const { strategies, implementer_org } = data[0];
  const { primary, support } = strategies;
  const totalStrategies = primary.length + support.length;
  return (
    <div>
      {implementer_org && (
        <Heading className='mb-5'>{`${implementer_org.name} Strategy Execution Responsibilities`}</Heading>
      )}
      <Subheading>Primary Lead</Subheading>
      {/* <StrategyTableList strategies={primary} /> xl:grid-cols-4 */}
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {primary.map((s) => (
          <StrategyCard
            strategy={s}
            implementerDetails={implementer_org}
            key={s.id}
            mockRole='Implementer'
          />
        ))}
      </div>

      <Subheading>Supporting Effort</Subheading>
      {/* <StrategyTableList strategies={support} /> xl:grid-cols-4 */}
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {support.map((s) => (
          <StrategyCard
            strategy={s}
            implementerDetails={implementer_org}
            key={s.id}
            mockRole='Implementer'
          />
        ))}
      </div>
    </div>
  );
};

const AccTrigHeader = ({ details, strategies }) => {
  const { emails, phone_numbers, name } = details;
  const { primary, support } = strategies;
  const totalStrategies = primary.length + support.length;
  return <div>{`Custom Header Component Not Working :(`}</div>;
};

const BoardMemberView = ({ data }) => {
  return (
    <React.Fragment>
      <Heading className='mb-5'>{`Assigned Implementers & Associated Strategies`}</Heading>
      <Accordion type='single' collapsible>
        {data.map(({ implementer_org, strategies }) => {
          const { name } = implementer_org;
          const { primary, support } = strategies;

          const allStrategies = primary.concat(support);
          return (
            <AccordionItem value={implementer_org.id} key={implementer_org.id}>
              <AccordionTrigger>
                {`${name} (${allStrategies.length})`}
              </AccordionTrigger>
              <AccordionContent>
                <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                  {allStrategies.map((s) => (
                    <StrategyCard
                      strategy={s}
                      implementerDetails={implementer_org}
                      key={s.id}
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
  const { data: { execute, monitor } = {}, isLoading } =
    useGetMyStrategiesQuery(undefined, {
      selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
    });

  if (isLoading || !execute || !monitor) {
    return <Skeleton className='w-full h-[100px]' />;
  }

  return (
    <>
      {execute.length > 0 && <ImplementerView data={execute} />}
      {monitor.length > 0 && <BoardMemberView data={monitor} />}
    </>
  );
};
