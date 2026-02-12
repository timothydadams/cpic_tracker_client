import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import {
  useCreateFocusAreaMutation,
  useUpdateFocusAreaMutation,
} from './focusAreaApiSlice';
import { getDirtyValues, recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { Textarea } from 'ui/textarea';
import { Field, FieldContent, FieldError, FieldLabel } from 'ui/field';
import { Spinner } from 'ui/spinner';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().default(''),
  state_goal: yup.string().default(''),
});

export const FocusAreaForm = ({ focusArea = null, onSuccess, onCancel }) => {
  const isEdit = Boolean(focusArea);

  const [createFocusArea, { isLoading: isCreating }] =
    useCreateFocusAreaMutation();
  const [updateFocusArea, { isLoading: isUpdating }] =
    useUpdateFocusAreaMutation();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      name: focusArea?.name ?? '',
      description: focusArea?.description ?? '',
      state_goal: focusArea?.state_goal ?? '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, isDirty, isValid },
  } = form;

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    try {
      if (isEdit) {
        const changedFields = getDirtyValues(dirtyFields, data);
        if (Object.keys(changedFields).length === 0) return;
        const sanitized = recursivelySanitizeObject(changedFields);
        await updateFocusArea({ id: focusArea.id, ...sanitized }).unwrap();
        enqueueSnackbar('Focus area updated', { variant: 'success' });
      } else {
        const sanitized = recursivelySanitizeObject(data);
        await createFocusArea(sanitized).unwrap();
        enqueueSnackbar('Focus area created', { variant: 'success' });
      }
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(
        `Failed to ${isEdit ? 'update' : 'create'} focus area: ${err?.data?.message || err}`,
        { variant: 'error' }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='fa-name'>Name</FieldLabel>
            <Input
              {...field}
              id='fa-name'
              placeholder='Focus area name'
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='fa-description'>Description</FieldLabel>
            <Textarea
              {...field}
              id='fa-description'
              placeholder='Description of this focus area'
              className='min-h-[100px]'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name='state_goal'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='fa-state-goal'>State Goal</FieldLabel>
            <Textarea
              {...field}
              id='fa-state-goal'
              placeholder='Associated state goal'
              className='min-h-[80px]'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className='flex justify-end gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={!isDirty || !isValid || isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              {isEdit ? 'Saving...' : 'Creating...'}
            </>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Create Focus Area'
          )}
        </Button>
      </div>
    </form>
  );
};
