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
                {JSON.stringify(allStrategies)}
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
