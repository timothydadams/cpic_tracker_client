import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import { useSendInviteMutation } from './inviteApiSlice';
import { RoleSelector } from './RoleSelector';
import { recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from 'ui/field';
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
  roleId: yup.string().uuid().required('Role is required'),
});

export const EmailInviteForm = () => {
  const [sendInvite, { isLoading }] = useSendInviteMutation();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      emails: [{ value: '' }],
      roleId: '',
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
      const sanitized = recursivelySanitizeObject({
        emails,
        roleId: data.roleId,
        maxUses: emails.length,
        expiresInDays: 7,
      });
      await sendInvite(sanitized).unwrap();
      enqueueSnackbar(
        `Invite${emails.length > 1 ? 's' : ''} sent successfully`,
        { variant: 'success' }
      );
      reset();
    } catch (err) {
      enqueueSnackbar(err?.data?.message || 'Failed to send invite', {
        variant: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <FieldSet>
        <FieldLegend variant='label'>Recipient Emails</FieldLegend>
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
      </FieldSet>

      <Controller
        name='roleId'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='email-invite-role'>Role</FieldLabel>
            <RoleSelector
              fieldState={fieldState}
              id='email-invite-role'
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className='flex justify-end pt-2'>
        <Button type='submit' disabled={!isDirty || !isValid || isLoading}>
          {isLoading ? (
            <>
              <Spinner />
              Sending...
            </>
          ) : (
            'Send Invites'
          )}
        </Button>
      </div>
    </form>
  );
};
