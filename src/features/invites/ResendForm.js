import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import { useResendInviteMutation } from './inviteApiSlice';
import { recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { FieldError } from 'ui/field';
import { Spinner } from 'ui/spinner';
import { Plus, X } from 'lucide-react';

const schema = yup.object().shape({
  emails: yup
    .array()
    .of(
      yup.object().shape({
        value: yup
          .string()
          .email('Must be a valid email')
          .required('Email is required'),
      })
    )
    .min(1, 'At least one email is required'),
});

export const ResendForm = ({ code, onSuccess }) => {
  const [resendInvite, { isLoading }] = useResendInviteMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      emails: [{ value: '' }],
    },
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({ control, name: 'emails' });

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    try {
      const emails = data.emails.map((item) => item.value).filter(Boolean);
      const sanitized = recursivelySanitizeObject({ emails });
      await resendInvite({ code, ...sanitized }).unwrap();
      enqueueSnackbar('Invite resent successfully', { variant: 'success' });
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(err?.data?.message || 'Failed to resend invite', {
        variant: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-2 pt-2'>
      <div className='space-y-2'>
        {emailFields.map((field, index) => (
          <div key={field.id} className='flex items-center gap-2'>
            <Input
              {...register(`emails.${index}.value`)}
              type='email'
              placeholder='email@example.com'
              className='flex-1'
              aria-invalid={!!errors.emails?.[index]?.value}
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
        {errors.emails?.root && <FieldError errors={[errors.emails.root]} />}
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

      <div className='flex justify-end gap-2 pt-1'>
        <Button type='button' variant='outline' size='sm' onClick={onSuccess}>
          Cancel
        </Button>
        <Button
          type='submit'
          size='sm'
          disabled={!isDirty || !isValid || isLoading}
        >
          {isLoading ? (
            <>
              <Spinner />
              Sending...
            </>
          ) : (
            'Resend'
          )}
        </Button>
      </div>
    </form>
  );
};
