import React from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { RegisteredInput } from 'components/forms/Input';
import { useGetAllImplementersQuery } from 'features/implementers/implementersApiSlice';
import { Dots } from 'components/Spinners';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from 'ui/field';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

import { MultiSelect } from 'components/Multiselect';

export function UserInfo() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const userType = useWatch({ name: 'inviteDetails.roleType' });

  const { data: implementers, isLoading } = useGetAllImplementersQuery(
    { applyTransformation: true },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  if (isLoading || !implementers) return <Dots />;

  return (
    <div className='flex flex-col gap-y-4'>
      <RegisteredInput
        type='email'
        label='Email'
        name='user.email'
        register={register}
        errors={errors}
      />

      <RegisteredInput
        type='text'
        label='First Name'
        name='user.given_name'
        register={register}
        errors={errors}
      />

      <RegisteredInput
        type='text'
        label='Last Name'
        name='user.family_name'
        register={register}
        errors={errors}
      />

      <RegisteredInput
        type='text'
        label='Username'
        name='user.username'
        register={register}
        errors={errors}
      />

      {userType === 'Implementer' ? (
        <FieldGroup>
          <Controller
            name='user.implementer_org_id'
            control={control}
            render={({ field, fieldState }) => (
              <Field orientation='responsive' data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor='form-rhf-select-department'>
                    Department/Org/Committee
                  </FieldLabel>
                  <FieldDescription>
                    Please select the organization you are a member of.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id='form-rhf-select-department'
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent position='item-aligned'>
                    {implementers.map((imp) => (
                      <SelectItem key={imp.id} value={imp.id}>
                        {imp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </FieldGroup>
      ) : (
        <FieldGroup>
          <Controller
            name='user.assigned_implementers'
            control={control}
            render={({ field, fieldState }) => (
              <Field orientation='responsive' data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor='form-rhf-select-department'>
                    Select your assigned implementers
                  </FieldLabel>
                  <FieldDescription>
                    Please select implementers you've been assigned.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
                <MultiSelect
                  name={field.name}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder='Select implementers...'
                  maxCount={5}
                  options={implementers}
                  aria-label='Implementer selection'
                  variant='inverted'
                />
              </Field>
            )}
          />
        </FieldGroup>
      )}
    </div>
  );
}
