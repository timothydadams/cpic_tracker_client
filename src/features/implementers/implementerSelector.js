import React from 'react';
import { useGetAllImplementersQuery } from './implementersApiSlice';
import { MultiSelect } from 'components/Multiselect';

export const ImplementerSelector = ({ fieldState, ...props }) => {
  const { data: implementers, isLoading } = useGetAllImplementersQuery({
    applyTransformation: true,
  });

  return;
  implementers && (
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
