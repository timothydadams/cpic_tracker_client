import React, { useEffect } from 'react';
import { cn } from 'utils/cn';
import { useMediaQuery } from '@uidotdev/usehooks';
import { SettingsIcon, MoreVertical, BadgeCheckIcon } from 'lucide-react';
import { StatusBadge, DeadLine } from 'components/data-table-util-components';
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

export function StrategyQuickEdit({ strategy }) {
  const [open, setIsOpen] = React.useState(false);
  const handleOpenChange = () => {
    setIsOpen(!open);
  };

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

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
        {/* 
        <SheetFooter>
          <Button type='submit'>Save changes</Button>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
        </SheetFooter>
        */}
      </SheetContent>
    </Sheet>
  );
}

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
  //console.log('policy data:', policy);
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
        'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-black dark:to-gray-800',
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
            {userType === 'CPIC' && <StrategyQuickEdit strategy={strategy} />}
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
