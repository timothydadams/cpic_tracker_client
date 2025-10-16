import React from 'react';
import { RegisteredInput } from 'components/forms/Input.js';
import { Button } from 'ui/button';

export const AddCommentForm = () => {
  return (
    <>
      <RegisteredInput
        className='flex w-full max-w-sm items-center space-x-2'
        type='text'
        placeholder='Add your comment...'
        element='textarea'
      />
      <Button type='submit'>Comment</Button>
    </>
  );
};
