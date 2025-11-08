import React from 'react';
import { RegisteredInput } from 'components/forms/Input.js';
import { Button } from 'ui/button';
import { RelativeTimeCard } from 'ui/relative-time-card';
import { IconCheck, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { ArrowUpIcon, Search, SendHorizonalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from 'ui/input-group';
import { Separator } from 'ui/separator';
import { sanitizeString } from 'utils/rhf_helpers';
import { useCreateCommentMutation } from './commentsApiSlice';
import useAuth from 'hooks/useAuth';
import { useParams } from 'react-router-dom';

const TimeCard = ({ timestamp }) => {
  const createdDate = new Date(timestamp);
  return (
    <RelativeTimeCard date={createdDate} side='left'>
      {createdDate.toLocaleDateString()}
    </RelativeTimeCard>
  );
};

export const AddCommentForm = ({ refetchComments }) => {
  const { id: userId } = useAuth();
  const { id: strategy_id } = useParams();

  const [contents, setContents] = React.useState('');
  const [addComment, { isLoading, error }] = useCreateCommentMutation();

  const handleChange = (e) => {
    const { value } = e.target;
    setContents(value);
  };

  const handleAddComment = async () => {
    const userInput = sanitizeString(contents);
    if (userInput) {
      const commentData = {
        user_id: userId,
        strategy_id,
        content: userInput,
      };
      console.log('comment data', commentData);
      try {
        const res = await addComment(commentData).unwrap();
        setContents('');
        refetchComments();
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <>
      <InputGroup className='w-full'>
        <InputGroupTextarea
          placeholder='Add comment...'
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
            onClick={handleAddComment}
          >
            <SendHorizonalIcon />
            <span className='sr-only'>Add Comment</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </>
  );
};
