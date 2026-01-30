import React from 'react';
import { useGetAllImplementersQuery } from './implementersApiSlice';
import { MultiSelect } from 'components/Multiselect';
import { Skeleton } from 'ui/skeleton';

export const ImplementerSelector = ({ fieldState, ...props }) => {
  const { data: implementers, isLoading } = useGetAllImplementersQuery({
    applyTransformation: true,
  });

  if (isLoading || !implementers || !Array.isArray(implementers)) {
    return <Skeleton className='w-[100px] h-[30px]' />;
  }

  return (
    <>
      <MultiSelect
        {...props}
        aria-invalid={fieldState.invalid}
        placeholder='Select department or implementer group'
        maxCount={1}
        options={implementers}
        aria-label='Member of'
        variant='inverted'
      />
    </>
  );
};
