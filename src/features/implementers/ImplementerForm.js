import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import {
  useCreateImplementerMutation,
  useUpdateImplementerMutation,
} from './implementersApiSlice';
import { getDirtyValues, recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { Checkbox } from 'ui/checkbox';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from 'ui/field';
import { Separator } from 'ui/separator';
import { Spinner } from 'ui/spinner';
import { Plus, X } from 'lucide-react';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  emails: yup.array().of(
    yup.object().shape({
      value: yup.string().email('Must be a valid email'),
    })
  ),
  phone_numbers: yup.array().of(
    yup.object().shape({
      value: yup.string(),
    })
  ),
  is_board: yup.boolean().default(false),
  is_department: yup.boolean().default(false),
  is_school: yup.boolean().default(false),
});

const toFieldArray = (arr) =>
  arr?.length ? arr.map((v) => ({ value: v })) : [{ value: '' }];

const fromFieldArray = (arr) =>
  arr?.map((item) => item.value).filter(Boolean) ?? [];

export const ImplementerForm = ({
  implementer = null,
  onSuccess,
  onCancel,
}) => {
  const isEdit = Boolean(implementer);

  const [createImplementer, { isLoading: isCreating }] =
    useCreateImplementerMutation();
  const [updateImplementer, { isLoading: isUpdating }] =
    useUpdateImplementerMutation();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      name: implementer?.name ?? '',
      emails: toFieldArray(implementer?.emails),
      phone_numbers: toFieldArray(implementer?.phone_numbers),
      is_board: implementer?.is_board ?? false,
      is_department: implementer?.is_department ?? false,
      is_school: implementer?.is_school ?? false,
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { dirtyFields, isDirty, isValid, errors },
  } = form;

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({ control, name: 'emails' });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: 'phone_numbers' });

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    try {
      const payload = {
        ...data,
        emails: fromFieldArray(data.emails),
        phone_numbers: fromFieldArray(data.phone_numbers),
      };

      if (isEdit) {
        const original = {
          name: implementer.name,
          emails: implementer.emails ?? [],
          phone_numbers: implementer.phone_numbers ?? [],
          is_board: implementer.is_board ?? false,
          is_department: implementer.is_department ?? false,
          is_school: implementer.is_school ?? false,
        };

        const changes = {};
        if (payload.name !== original.name) changes.name = payload.name;
        if (JSON.stringify(payload.emails) !== JSON.stringify(original.emails))
          changes.emails = payload.emails;
        if (
          JSON.stringify(payload.phone_numbers) !==
          JSON.stringify(original.phone_numbers)
        )
          changes.phone_numbers = payload.phone_numbers;
        if (payload.is_board !== original.is_board)
          changes.is_board = payload.is_board;
        if (payload.is_department !== original.is_department)
          changes.is_department = payload.is_department;
        if (payload.is_school !== original.is_school)
          changes.is_school = payload.is_school;

        if (Object.keys(changes).length === 0) return;

        const sanitized = recursivelySanitizeObject(changes);
        await updateImplementer({
          id: implementer.id,
          ...sanitized,
        }).unwrap();
        enqueueSnackbar('Implementer updated', { variant: 'success' });
      } else {
        const sanitized = recursivelySanitizeObject(payload);
        await createImplementer(sanitized).unwrap();
        enqueueSnackbar('Implementer created', { variant: 'success' });
      }
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(
        `Failed to ${isEdit ? 'update' : 'create'} implementer: ${err?.data?.message || err}`,
        { variant: 'error' }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor='impl-name'>Name</FieldLabel>
        <Input
          {...register('name')}
          id='impl-name'
          placeholder='Organization name'
          aria-invalid={!!errors.name}
        />
        {errors.name && <FieldError errors={[errors.name]} />}
      </Field>

      <Separator />

      <FieldSet>
        <FieldLegend variant='label'>Emails</FieldLegend>
        <div className='space-y-2'>
          {emailFields.map((field, index) => (
            <div key={field.id} className='flex items-center gap-2'>
              <Input
                {...register(`emails.${index}.value`)}
                type='email'
                placeholder='email@example.com'
                className='flex-1'
              />
              {emailFields.length > 1 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => removeEmail(index)}
                  aria-label='Remove email'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => appendEmail({ value: '' })}
          >
            <Plus className='h-4 w-4 mr-1' />
            Add Email
          </Button>
        </div>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant='label'>Phone Numbers</FieldLegend>
        <div className='space-y-2'>
          {phoneFields.map((field, index) => (
            <div key={field.id} className='flex items-center gap-2'>
              <Input
                {...register(`phone_numbers.${index}.value`)}
                type='tel'
                placeholder='(555) 123-4567'
                className='flex-1'
              />
              {phoneFields.length > 1 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => removePhone(index)}
                  aria-label='Remove phone number'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => appendPhone({ value: '' })}
          >
            <Plus className='h-4 w-4 mr-1' />
            Add Phone
          </Button>
        </div>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant='label'>Type</FieldLegend>
        <div className='space-y-3'>
          <Controller
            name='is_board'
            control={control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='impl-is-board'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor='impl-is-board'
                  className='text-sm font-medium leading-none'
                >
                  Board
                </label>
              </div>
            )}
          />
          <Controller
            name='is_department'
            control={control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='impl-is-department'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor='impl-is-department'
                  className='text-sm font-medium leading-none'
                >
                  Department
                </label>
              </div>
            )}
          />
          <Controller
            name='is_school'
            control={control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='impl-is-school'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor='impl-is-school'
                  className='text-sm font-medium leading-none'
                >
                  School
                </label>
              </div>
            )}
          />
        </div>
      </FieldSet>

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
            'Create Implementer'
          )}
        </Button>
      </div>
    </form>
  );
};
