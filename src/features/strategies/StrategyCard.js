import React, { useEffect } from 'react';
import { cn } from 'utils/cn';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
  MoreVertical,
  Pencil,
  MessageSquarePlus,
  SendHorizonalIcon,
  X,
  MessageCircle,
  History,
  Reply,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'ui/dialog';
import { StrategyForm } from './EditStrategyForm';
import { Badge } from 'ui/badge';
import { UserIdentity } from 'components/UserIdentity';
import { EmptyContainer } from 'components/EmptyContainer';
import { Dots } from 'components/Spinners';
import useAuth from 'hooks/useAuth';
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
} from '../comments/commentsApiSlice';
import {
  useGetStrategyCommentsQuery,
  useGetStrategyActivitiesQuery,
} from './strategiesApiSlice';
import { sanitizeString } from 'utils/rhf_helpers';

export const StrategyCardMenu = React.memo(function StrategyCardMenu({
  onEditClick,
  onAddNoteClick,
  canEdit,
}) {
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
});

export function StrategyEditSheet({ strategy, open, onOpenChange }) {
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

export const InlineNoteInput = React.memo(function InlineNoteInput({
  strategyId,
  parentId,
  onClose,
  onSuccess,
}) {
  const { id: userId } = useAuth();
  const [contents, setContents] = React.useState('');
  const [message, setMessage] = React.useState(null);
  const [addComment, { isLoading }] = useCreateCommentMutation();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage(null);
      if (message.type === 'success') onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const handleChange = (e) => setContents(e.target.value);

  const trimmedEmpty = !sanitizeString(contents);

  const handleSubmit = async () => {
    if (trimmedEmpty) return;
    try {
      await addComment({
        user_id: userId,
        strategy_id: strategyId,
        content: sanitizeString(contents),
        ...(parentId && { parent_id: parentId }),
      }).unwrap();
      setContents('');
      setMessage({ type: 'success', text: 'Note added' });
      onSuccess?.();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to add note' });
    }
  };

  return (
    <div className='px-4 pb-4'>
      {message && (
        <p
          className={cn(
            'text-sm mb-2 font-medium',
            message.type === 'success' && 'text-green-600 dark:text-green-400',
            message.type === 'error' && 'text-red-600 dark:text-red-400'
          )}
        >
          {message.text}
        </p>
      )}
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
            disabled={isLoading || trimmedEmpty}
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
});

const CommentEntry = React.memo(function CommentEntry({
  comment,
  strategyId,
  currentUser,
  replyingTo,
  setReplyingTo,
  editingId,
  setEditingId,
  onReplySuccess,
  onEditSuccess,
  depth = 0,
}) {
  const isAuthenticated = currentUser?.status !== 'Guest';
  const canEdit =
    currentUser?.isAdmin ||
    currentUser?.isCPICAdmin ||
    currentUser?.id === comment.user_id;

  const isEditing = editingId === comment.id;
  const [editContent, setEditContent] = React.useState(comment.content);
  const [updateComment, { isLoading: isSaving }] = useUpdateCommentMutation();
  const [editError, setEditError] = React.useState(null);

  const handleSave = async () => {
    const sanitized = sanitizeString(editContent);
    if (!sanitized) return;
    try {
      await updateComment({ id: comment.id, content: sanitized }).unwrap();
      setEditingId(null);
      setEditError(null);
      onEditSuccess?.();
    } catch {
      setEditError('Failed to update');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent(comment.content);
    setEditError(null);
  };

  return (
    <div
      className={cn(
        depth > 0 &&
          'ml-4 border-l-2 border-zinc-200 pl-2 dark:border-zinc-700',
        'min-w-0'
      )}
    >
      <div className='flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 min-w-0'>
        <UserIdentity
          user={comment.user}
          isAuthenticated={isAuthenticated}
          timestamp={comment.createdAt}
        />
        <div className='min-w-0 pl-11'>
          {isEditing ? (
            <div className='flex flex-col gap-2'>
              <InputGroupTextarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className='text-sm'
              />
              {editError && (
                <p className='text-xs text-red-600 dark:text-red-400'>
                  {editError}
                </p>
              )}
              <div className='flex gap-1'>
                <Button
                  variant='default'
                  size='sm'
                  className='h-6 text-xs'
                  onClick={handleSave}
                  disabled={isSaving || !sanitizeString(editContent)}
                >
                  Save
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 text-xs'
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className='text-sm text-zinc-600 dark:text-zinc-400'>
              {comment.content}
            </p>
          )}
          {!isEditing && isAuthenticated && (
            <div className='flex gap-1 mt-1'>
              <Button
                variant='ghost'
                size='sm'
                className='gap-1 h-6 px-1.5 text-xs text-zinc-500'
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
              >
                <Reply className='h-3 w-3' />
                Reply
              </Button>
              {canEdit && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-1 h-6 px-1.5 text-xs text-zinc-500'
                  onClick={() => {
                    setEditContent(comment.content);
                    setEditingId(comment.id);
                  }}
                >
                  <Pencil className='h-3 w-3' />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {replyingTo === comment.id && (
        <div className='ml-4 mt-2'>
          <InlineNoteInput
            strategyId={strategyId}
            parentId={comment.id}
            onClose={() => setReplyingTo(null)}
            onSuccess={onReplySuccess}
          />
        </div>
      )}
      {comment.children?.length > 0 && (
        <div className='flex flex-col gap-2 mt-2'>
          {comment.children.map((child) => (
            <CommentEntry
              key={child.id}
              comment={child}
              strategyId={strategyId}
              currentUser={currentUser}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              editingId={editingId}
              setEditingId={setEditingId}
              onReplySuccess={onReplySuccess}
              onEditSuccess={onEditSuccess}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function CommentsDialog({ strategyId, triggerButton }) {
  const user = useAuth();
  const [open, setOpen] = React.useState(false);
  const [replyingTo, setReplyingTo] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);

  const {
    data: comments,
    isLoading,
    isError,
    refetch,
  } = useGetStrategyCommentsQuery(
    { id: strategyId, params: { replies: 'true', user: 'true' } },
    {
      skip: !open,
      selectFromResult: ({ data, isLoading, isError }) => ({
        data,
        isLoading,
        isError,
      }),
    }
  );

  const handleReplySuccess = () => {
    setReplyingTo(null);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingId(null);
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className='sm:max-w-lg overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Notes and comments for this strategy
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[60dvh]'>
          {isLoading ? (
            <Dots />
          ) : isError ? (
            <EmptyContainer
              title='Unable to load comments'
              description='Something went wrong. Please try again later.'
            />
          ) : !comments || comments.length === 0 ? (
            <EmptyContainer
              title='No comments yet'
              description='Comments and notes will appear here.'
            />
          ) : (
            <div className='flex flex-col gap-3 pr-4'>
              {comments.map((comment) => (
                <CommentEntry
                  key={comment.id}
                  comment={comment}
                  strategyId={strategyId}
                  currentUser={user}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  onReplySuccess={handleReplySuccess}
                  onEditSuccess={handleEditSuccess}
                />
              ))}
            </div>
          )}
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ActivityDialog({ strategyId, triggerButton }) {
  const user = useAuth();
  const isGuest = user?.status === 'Guest';
  const [open, setOpen] = React.useState(false);

  const {
    data: activities,
    isLoading,
    isError,
    error,
  } = useGetStrategyActivitiesQuery(
    { id: strategyId, params: { take: 50 } },
    {
      skip: !open || isGuest,
      selectFromResult: ({ data, isLoading, isError, error }) => ({
        data,
        isLoading,
        isError,
        error,
      }),
    }
  );

  const isUnauthorized =
    isGuest || error?.status === 401 || error?.status === 403;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Activity</DialogTitle>
          <DialogDescription>
            Audit log of changes to this strategy
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[60dvh]'>
          {isUnauthorized ? (
            <EmptyContainer
              title='Sign in to view activity'
              description='The activity log is available to registered users.'
            />
          ) : isLoading ? (
            <Dots />
          ) : isError ? (
            <EmptyContainer
              title='Unable to load activity'
              description='Something went wrong. Please try again later.'
            />
          ) : !activities || activities.length === 0 ? (
            <EmptyContainer
              title='No activity yet'
              description='Changes to this strategy will appear here.'
            />
          ) : (
            <div className='flex flex-col gap-3 pr-4'>
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800'
                >
                  <UserIdentity
                    user={activity.user}
                    isAuthenticated={!isGuest}
                    timestamp={activity.createdAt}
                  />
                  <div className='pl-11 flex flex-col gap-1'>
                    <Badge variant='outline' className='text-xs w-fit'>
                      {activity.action}
                    </Badge>
                    <pre className='text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-sans'>
                      {activity.summary}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export const StrategyActionCell = React.memo(function StrategyActionCell({
  strategy,
}) {
  const user = useAuth();
  const showMenu = user?.status !== 'Guest';
  const canEdit = user?.isAdmin || user?.isCPICAdmin || user?.isCPICMember;

  const [showEditSheet, setShowEditSheet] = React.useState(false);
  const [showNoteInput, setShowNoteInput] = React.useState(false);

  if (!showMenu) return null;

  return (
    <>
      <StrategyCardMenu
        onEditClick={() => setShowEditSheet(true)}
        onAddNoteClick={() => setShowNoteInput(true)}
        canEdit={canEdit}
      />
      <StrategyEditSheet
        strategy={strategy}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
      />
      <Dialog open={showNoteInput} onOpenChange={setShowNoteInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a note to this strategy</DialogDescription>
          </DialogHeader>
          <InlineNoteInput
            strategyId={strategy.id}
            onClose={() => setShowNoteInput(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
});

export const StrategyCard = React.memo(function StrategyCard({
  strategy,
  implementerDetails = {},
  mockRole = null,
  showFocusAreaAndPolicyDetails = true,
}) {
  const user = useAuth();
  const showMenu = user?.status !== 'Guest';
  const canEdit =
    (user?.isAdmin || user?.isCPICAdmin || user?.isCPICMember) &&
    mockRole == null;
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

  const isAssignedView = !!implementerDetails?.id;
  const implementerId = Number(implementerDetails?.id) || 0;
  const isPrimaryLead =
    isAssignedView &&
    !!implementers.find(
      ({ implementer_id, is_primary }) =>
        is_primary && implementer_id == implementerId
    );

  return (
    <Card
      className={cn(
        'w-full max-w-md relative flex flex-col',
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
        {showMenu && (
          <div className='absolute top-2 right-2'>
            <StrategyCardMenu
              onEditClick={() => setShowEditSheet(true)}
              onAddNoteClick={() => setShowNoteInput(true)}
              canEdit={canEdit}
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

        {showFocusAreaAndPolicyDetails ? (
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

      <CardFooter className='w-full relative flex-1'>
        <div className='flex flex-col w-full h-full'>
          <Separator orientation='horizontal' className='my-2' />
          Implementers:
          <div className='flex flex-col gap-1.5 w-full py-3'>
            {[...implementers]
              .sort((a, b) =>
                a.implementer.name.localeCompare(b.implementer.name)
              )
              .map((x) => (
                <div key={x.implementer_id} className='flex items-center gap-2'>
                  <Badge className='bg-zinc-800 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-200'>
                    {x.implementer.name}
                    {!isAssignedView && x.is_primary && ' (Primary)'}
                  </Badge>
                  {isAssignedView &&
                    x.is_primary &&
                    x.implementer_id == implementerId && (
                      <Badge className='bg-amber-500 text-white hover:bg-amber-500 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-600 font-semibold'>
                        Primary Lead
                      </Badge>
                    )}
                </div>
              ))}
          </div>
          <div className='mt-auto'>
            <Separator orientation='horizontal' />
          </div>
          <div className='flex gap-2 pt-3 justify-between'>
            <CommentsDialog
              strategyId={strategy.id}
              triggerButton={
                <Button variant='ghost' size='sm' className='gap-1.5'>
                  <MessageCircle className='h-4 w-4' />
                  <span className='text-xs'>Comments</span>
                </Button>
              }
            />
            <ActivityDialog
              strategyId={strategy.id}
              triggerButton={
                <Button variant='ghost' size='sm' className='gap-1.5'>
                  <History className='h-4 w-4' />
                  <span className='text-xs'>Activity</span>
                </Button>
              }
            />
          </div>
        </div>
      </CardFooter>

      <StrategyEditSheet
        strategy={strategy}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
      />
    </Card>
  );
});
