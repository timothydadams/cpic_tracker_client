import React, { useEffect } from 'react';
import { cn } from 'utils/cn';
import { SendHorizonalIcon, X, Reply, Pencil } from 'lucide-react';
import { Separator } from 'ui/separator';
import { Button } from 'ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from 'ui/input-group';
import { UserIdentity } from 'components/UserIdentity';
import useAuth from 'hooks/useAuth';
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
} from './commentsApiSlice';
import { sanitizeString } from 'utils/rhf_helpers';

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

export const CommentEntry = React.memo(function CommentEntry({
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
