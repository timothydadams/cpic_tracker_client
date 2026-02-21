import React from 'react';
import { useParams } from 'react-router-dom';
import { useValidateCodeMutation } from 'features/invites/inviteApiSlice';
import { useFormContext, Controller } from 'react-hook-form';
import { RegisteredInput } from 'components/forms/Input';
import { Spinner } from 'ui/spinner';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from 'ui/field';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from 'ui/input-group';

export function VerifyInvitationCode({ nextStep }) {
  const { code } = useParams();
  const [verifyCode, { isLoading }] = useValidateCodeMutation();
  const {
    register,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors, isDirty, isValid },
  } = useFormContext();

  const checkCodeAndUpdateFields = React.useCallback(
    async (code) => {
      try {
        const result = await verifyCode(code).unwrap();
        const roleType =
          result.roleName === 'Implementer' ? 'Implementer' : 'CPIC';
        setValue('inviteDetails.roleId', result.roleId);
        setValue('inviteDetails.roleType', roleType);
        nextStep();
      } catch (e) {
        setValue('inviteDetails.roleId', '');
        setValue('inviteDetails.roleType', '');
        setError('inviteCode', {
          type: 'server',
          message: e?.data?.message || 'Invalid invite code',
        });
      }
    },
    [verifyCode, setValue, nextStep, setError]
  );

  React.useEffect(() => {
    if (code) {
      setValue('inviteCode', code, { shouldDirty: true });
      checkCodeAndUpdateFields(code);
    }
  }, [code, setValue, checkCodeAndUpdateFields]);

  return (
    <>
      <FieldGroup>
        <Controller
          name='inviteCode'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='form-rhf-input-verification-code'>
                Invite Code
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id='form-rhf-input-verification-code'
                  aria-invalid={fieldState.invalid}
                  placeholder='enter your invite code here and verify'
                />
                <InputGroupAddon align='inline-end'>
                  <InputGroupButton
                    onClick={() =>
                      checkCodeAndUpdateFields(getValues('inviteCode'))
                    }
                    disabled={!isDirty && !isValid}
                  >
                    {isLoading ? <Spinner /> : 'Verify Code'}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldDescription>
                Enter your invite code. You can only register for this service
                if you have a valid code. Please contact a CPIC board member if
                you need an invite code.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className='hidden'>
        <RegisteredInput
          disabled
          type='text'
          label='roleId'
          name='inviteDetails.roleId'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          disabled
          type='text'
          label='roleType'
          name='inviteDetails.roleType'
          register={register}
          errors={errors}
        />
      </div>
    </>
  );
}
