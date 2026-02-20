import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import { useCreateCodeMutation } from './inviteApiSlice';
import { RoleSelector } from './RoleSelector';
import { InviteCodeItem } from './InviteCodeItem';
import { recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { Field, FieldError, FieldLabel } from 'ui/field';
import { Spinner } from 'ui/spinner';

const schema = yup.object().shape({
  maxUses: yup.number().min(1, 'Must be at least 1').required('Required'),
  expiresInDays: yup.number().min(1, 'Must be at least 1').required('Required'),
  roleId: yup.string().uuid().required('Role is required'),
});

export const ManualCodeForm = () => {
  const [createCode, { isLoading }] = useCreateCodeMutation();
  const [generatedCode, setGeneratedCode] = React.useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, isValid, errors },
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      maxUses: 1,
      expiresInDays: 7,
      roleId: '',
    },
  });

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    try {
      const sanitized = recursivelySanitizeObject(data);
      const result = await createCode(sanitized).unwrap();
      setGeneratedCode(result);
      enqueueSnackbar('Invite code generated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.data?.message || 'Failed to generate code', {
        variant: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Controller
        name='roleId'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='manual-code-role'>Role</FieldLabel>
            <RoleSelector
              fieldState={fieldState}
              id='manual-code-role'
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field data-invalid={!!errors.maxUses}>
        <FieldLabel htmlFor='manual-code-max-uses'>Max Uses</FieldLabel>
        <Input
          {...register('maxUses', { valueAsNumber: true })}
          id='manual-code-max-uses'
          type='number'
          min='1'
          aria-invalid={!!errors.maxUses}
        />
        {errors.maxUses && <FieldError errors={[errors.maxUses]} />}
      </Field>

      <Field data-invalid={!!errors.expiresInDays}>
        <FieldLabel htmlFor='manual-code-expires'>Expires in (days)</FieldLabel>
        <Input
          {...register('expiresInDays', { valueAsNumber: true })}
          id='manual-code-expires'
          type='number'
          min='1'
          aria-invalid={!!errors.expiresInDays}
        />
        {errors.expiresInDays && <FieldError errors={[errors.expiresInDays]} />}
      </Field>

      {generatedCode && (
        <InviteCodeItem invite={generatedCode} showResend={false} />
      )}

      <div className='flex justify-end pt-2'>
        <Button type='submit' disabled={!isDirty || !isValid || isLoading}>
          {isLoading ? (
            <>
              <Spinner />
              Generating...
            </>
          ) : (
            'Generate Code'
          )}
        </Button>
      </div>
    </form>
  );
};
