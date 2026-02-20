import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import { EmptyContainer } from 'components/EmptyContainer';
import { Dots } from 'components/Spinners';
import useAuth from 'hooks/useAuth';
import { useGetStrategyCommentsQuery } from './strategiesApiSlice';
import { CommentEntry, InlineNoteInput } from '../comments/CommentEntry';

export const StrategyComments = ({ strategyId, commentCount }) => {
  const user = useAuth();
  const isAuthenticated = user?.status !== 'Guest';
  const [replyingTo, setReplyingTo] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [showInput, setShowInput] = React.useState(false);

  const {
    data: comments,
    isLoading,
    isError,
    refetch,
  } = useGetStrategyCommentsQuery(
    { id: strategyId, params: { replies: 'true', user: 'true' } },
    {
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
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium flex items-center justify-between'>
          <span>
            Comments{commentCount != null ? ` (${commentCount})` : ''}
          </span>
          {isAuthenticated && !showInput && (
            <button
              onClick={() => setShowInput(true)}
              className='text-xs text-blue-600 hover:underline dark:text-blue-400 font-normal'
            >
              Add comment
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showInput && (
          <div className='mb-4'>
            <InlineNoteInput
              strategyId={strategyId}
              onClose={() => setShowInput(false)}
              onSuccess={() => {
                setShowInput(false);
                refetch();
              }}
            />
          </div>
        )}

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
          <div className='flex flex-col gap-3'>
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
      </CardContent>
    </Card>
  );
};
