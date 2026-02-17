import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { RegisteredInput } from 'components/forms/Input';
import { useGetAllImplementersQuery } from 'features/implementers/implementersApiSlice';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from 'ui/field';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

import { MultiSelect } from 'components/Multiselect';

export function UserInfo() {
  const {
    register,
    getValues,
    control,
    formState: { errors, isDirty, isValid },
  } = useFormContext();

  const userType = getValues('inviteDetails.roleType');

  const { data: implementers, isLoading } = useGetAllImplementersQuery(
    { applyTransformation: true },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  return (
    implementers && (
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

        {userType === 'Implementer' ? (
          <FieldGroup>
            <Controller
              name='user.implementer_org_id'
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='responsive'
                  data-invalid={fieldState.invalid}
                >
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
                <Field
                  orientation='responsive'
                  data-invalid={fieldState.invalid}
                >
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
    )
  );
}
