import React, { useEffect } from 'react';
import { cn } from 'utils/cn';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
  MoreVertical,
  Pencil,
  MessageSquarePlus,
  SendHorizonalIcon,
  X,
} from 'lucide-react';
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
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from 'ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from 'ui/input-group';
import { ScrollArea, ScrollBar } from 'ui/scroll-area';
import { StrategyForm } from './EditStrategyForm';
import { Badge } from 'ui/badge';
import useAuth from 'hooks/useAuth';
import { useCreateCommentMutation } from '../comments/commentsApiSlice';
import { sanitizeString } from 'utils/rhf_helpers';

function StrategyCardMenu({ onEditClick, onAddNoteClick }) {
  const user = useAuth();
  const canEdit = user?.isAdmin || user?.isCPICAdmin;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onAddNoteClick}>
          <MessageSquarePlus className='h-4 w-4 mr-2' />
          Add Note
        </DropdownMenuItem>
        {canEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onEditClick}>
              <Pencil className='h-4 w-4 mr-2' />
              Edit
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StrategyEditSheet({ strategy, open, onOpenChange }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side={isSmallDevice ? 'bottom' : 'right'}
        className={cn(
          !isSmallDevice ? 'sm:max-w-lg' : 'h-[85dvh]',
          'flex flex-col overflow-hidden'
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Configure Strategy</SheetTitle>
        </SheetHeader>
        <SheetDescription></SheetDescription>
        <ScrollArea className='flex-1 min-h-0'>
          <StrategyForm strategyId={strategy.id} />
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InlineNoteInput({ strategyId, onClose }) {
  const { id: userId } = useAuth();
  const [contents, setContents] = React.useState('');
  const [addComment, { isLoading }] = useCreateCommentMutation();

  const handleChange = (e) => setContents(e.target.value);

  const handleSubmit = async () => {
    const userInput = sanitizeString(contents);
    if (!userInput) return;
    try {
      await addComment({
        user_id: userId,
        strategy_id: strategyId,
        content: userInput,
      }).unwrap();
      setContents('');
      onClose();
    } catch (e) {
      // note submission error
    }
  };

  return (
    <div className='px-4 pb-4'>
      <InputGroup className='w-full'>
        <InputGroupTextarea
          placeholder='Add a note...'
          value={contents}
          onChange={handleChange}
        />
        <InputGroupAddon align='block-end'>
          <InputGroupText className='ml-auto'>
            {500 - contents.length} chars remaining
          </InputGroupText>
          <Separator orientation='vertical' className='!h-4' />
          <InputGroupButton
            variant='default'
            className='rounded-full'
            size='icon-xs'
            onClick={handleSubmit}
            disabled={isLoading || contents.length === 0}
          >
            <SendHorizonalIcon />
            <span className='sr-only'>Add Note</span>
          </InputGroupButton>
          <InputGroupButton variant='ghost' size='icon-xs' onClick={onClose}>
            <X />
            <span className='sr-only'>Cancel</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export const StrategyCard = ({
  strategy,
  implementerDetails,
  userType = 'guest',
}) => {
  const [showEditSheet, setShowEditSheet] = React.useState(false);
  const [showNoteInput, setShowNoteInput] = React.useState(false);

  const {
    content,
    focus_area,
    policy,
    timeline,
    status,
    implementers,
    strategy_number,
  } = strategy;
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
            <StrategyCardMenu
              onEditClick={() => setShowEditSheet(true)}
              onAddNoteClick={() => setShowNoteInput(true)}
            />
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
      <CardContent className='font-mono'>{content}</CardContent>

      {showNoteInput && (
        <InlineNoteInput
          strategyId={strategy.id}
          onClose={() => setShowNoteInput(false)}
        />
      )}

      <CardFooter className='w-full relative'>
        <div className='flex flex-col w-full'>
          <Separator orientation='horizontal' />
          Implementers:
          <div className='flex gap-2 w-full flex-wrap py-4'>
            {implementers.map((x) => (
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

      <StrategyEditSheet
        strategy={strategy}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
      />
    </Card>
  );
};
