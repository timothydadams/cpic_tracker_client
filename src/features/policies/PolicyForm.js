import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import {
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
} from './policiesApiSlice';
import { useGetAllFocusAreasQuery } from '../focus_areas/focusAreaApiSlice';
import { getDirtyValues, recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { Textarea } from 'ui/textarea';
import { Field, FieldContent, FieldError, FieldLabel } from 'ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';
import { Spinner } from 'ui/spinner';
import { Skeleton } from 'ui/skeleton';

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  policy_number: yup
    .number()
    .typeError('Must be a number')
    .required('Policy number is required')
    .positive('Must be positive')
    .integer('Must be a whole number'),
  focus_area_id: yup.string().required('Focus area is required'),
});

export const PolicyForm = ({ policy = null, onSuccess, onCancel }) => {
  const isEdit = Boolean(policy);

  const { data: focusAreas, isLoading: loadingFocusAreas } =
    useGetAllFocusAreasQuery();

  const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      description: policy?.description ?? '',
      policy_number: policy?.policy_number ?? '',
      focus_area_id: policy?.focus_area_id ? String(policy.focus_area_id) : '',
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { dirtyFields, isDirty, isValid, errors },
  } = form;

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    try {
      const payload = {
        ...data,
        policy_number: Number(data.policy_number),
        focus_area_id: Number(data.focus_area_id),
      };

      if (isEdit) {
        const changedFields = getDirtyValues(dirtyFields, payload);
        if (Object.keys(changedFields).length === 0) return;
        const sanitized = recursivelySanitizeObject(changedFields);
        await updatePolicy({ id: policy.id, ...sanitized }).unwrap();
        enqueueSnackbar('Policy updated', { variant: 'success' });
      } else {
        const sanitized = recursivelySanitizeObject(payload);
        await createPolicy(sanitized).unwrap();
        enqueueSnackbar('Policy created', { variant: 'success' });
      }
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(
        `Failed to ${isEdit ? 'update' : 'create'} policy: ${err?.data?.message || err}`,
        { variant: 'error' }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='policy-description'>Description</FieldLabel>
            <Textarea
              {...field}
              id='policy-description'
              placeholder='Policy description'
              className='min-h-[100px]'
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field data-invalid={!!errors.policy_number}>
        <FieldLabel htmlFor='policy-number'>Policy Number</FieldLabel>
        <Input
          {...register('policy_number')}
          id='policy-number'
          type='number'
          min='1'
          placeholder='e.g. 1'
          aria-invalid={!!errors.policy_number}
        />
        {errors.policy_number && <FieldError errors={[errors.policy_number]} />}
      </Field>

      <Controller
        name='focus_area_id'
        control={control}
        render={({ field, fieldState }) =>
          loadingFocusAreas ? (
            <Skeleton className='w-full h-[40px]' />
          ) : (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='policy-focus-area'>Focus Area</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id='policy-focus-area'
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder='Select focus area' />
                </SelectTrigger>
                <SelectContent>
                  {focusAreas?.map((fa) => (
                    <SelectItem key={fa.id} value={String(fa.id)}>
                      {fa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )
        }
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
            'Create Policy'
          )}
        </Button>
      </div>
    </form>
  );
};
