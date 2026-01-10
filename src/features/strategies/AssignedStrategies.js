import React from 'react';
import { cn } from 'utils/cn';
import { useMediaQuery } from '@uidotdev/usehooks';
import { StrategyTableList } from './StrategyList';
import { useGetMyStrategiesQuery } from './strategiesApiSlice';
import { Heading, Subheading } from 'catalyst/heading';
import { Skeleton } from 'ui/skeleton';
import { useSelector } from 'react-redux';
import { SettingsIcon, MoreVertical, BadgeCheckIcon } from 'lucide-react';
import { selectCurrentRoles } from '../auth/authSlice';
import { StatusBadge, DeadLine } from 'components/data-table-util-components';
//import { deadlines } from 'utils/strategy_due_dates';
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
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { Label } from 'ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'ui/sheet';

import { StrategyForm } from './EditStrategyForm';

import { Badge } from 'ui/badge';

/**
 * 
<Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
 */

export function StrategyQuickEdit({ strategy }) {
  const [open, setIsOpen] = React.useState(false);
  const handleOpenChange = () => {
    setIsOpen(!open);
    // Apply or remove body styles based on 'open' state
    //document.body.addClass("hidden")
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
      <SheetTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isSmallDevice ? 'bottom' : 'right'}
        className={!isSmallDevice ? 'sm:max-w-lg' : ''}
        onWheel={(e) => e.stopPropagation()}
      >
        <SheetHeader>
          <SheetTitle>Configure Strategy</SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        <StrategyForm strategyId={strategy.id} />
        <SheetFooter>
          <Button type='submit'>Save changes</Button>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const DescriptionRow = ({ statusTitle, timelineTitle }) => (
  <div className='flex h-5 items-center space-x-4 text-sm'>
    <StatusBadge status={statusTitle} />
    <Separator orientation='vertical' />
    <DeadLine timeline={timelineTitle} />
  </div>
);

export const StrategyCard = ({
  strategy,
  implementerDetails,
  userType = 'guest',
}) => {
  const {
    content,
    focus_area,
    policy,
    timeline,
    status,
    implementers,
    strategy_number,
  } = strategy;
  console.log('policy data:', policy);
  const refNumber = `${policy.policy_number}.${strategy_number}`;

  const implementerId = Number(implementerDetails?.id) || 0;
  const isPrimaryLead = !!implementers.find(
    ({ implementer_id, is_primary }) =>
      is_primary && implementer_id == implementerId
  );

  return (
    <Card
      className={cn(
        'w-full max-w-md relative',
        isPrimaryLead && 'border-4',
        status?.title === 'Needs Updating' &&
          'border-chart-5 dark:border-chart-5',
        status?.title === 'In Progress' && 'border-chart-2 dark:border-chart-2',
        status?.title === 'Not Started' && 'border-chart-5 dark:border-chart-5',
        status?.title === 'Completed' && 'border-chart-4 dark:border-chart-4'
      )}
    >
      <CardHeader className='grid grid-col-2 relative'>
        {userType !== 'guest' && (
          <div className='absolute top-2 right-2'>
            <StrategyQuickEdit strategy={strategy} />
          </div>
        )}

        <div className='absolute top-2 left-2 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400'>
          <div>
            <StatusBadge status={status.title} />
          </div>
          <div>
            <DeadLine timeline={timeline.title} />
          </div>
        </div>

        {userType !== 'guest' ? (
          <>
            <CardTitle className='pt-4'>
              {focus_area.name} {`[${refNumber}]`}
            </CardTitle>

            <CardDescription>{policy.description}</CardDescription>
          </>
        ) : (
          <CardTitle className='pt-4'>{refNumber}</CardTitle>
        )}
      </CardHeader>
      {/** className='text-sm text-zinc-500 dark:text-zinc-400' */}
      <CardContent className='font-mono'>{content}</CardContent>
      <CardFooter className='w-full relative'>
        <div className='flex flex-col w-full'>
          <Separator orientation='horizontal' />
          Implementers:
          <div className='flex gap-2 w-full flex-wrap py-4'>
            {implementers
              //.filter(x => implementerId != Number(x.implementer_id))
              .map((x) => (
                <Badge key={x.implementer_id} variant='outline'>
                  {x.implementer.name}
                </Badge>
              ))}
          </div>
        </div>
      </CardFooter>
      {userType !== 'guest' && isPrimaryLead && (
        <div className='absolute bottom-2 right-2'>
          <Badge variant='secondary'>Primary Lead</Badge>
        </div>
      )}
    </Card>
  );
};

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
