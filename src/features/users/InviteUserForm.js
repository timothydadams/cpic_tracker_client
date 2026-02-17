import React from 'react';
import { useGetRolesQuery } from './usersApiSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Separator } from 'ui/separator';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(yup);
import { RegisteredInput } from 'components/forms/Input';
import { Button } from 'catalyst/button';
import { Skeleton } from 'ui/skeleton';

const schema = yup.object().shape({
  maxUses: yup.number().required(),
  expiresInDays: yup.number().required(),
  roleId: yup.string().uuid().required('Role is required'),
});

const addLabelValue = (item, labelKey, valueKey) => {
  return {
    ...item,
    label: item[labelKey],
    value: item[valueKey],
  };
};

export const RoleSelector = ({ id, fieldState, ...props }) => {
  const { data: roles, isLoading } = useGetRolesQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !roles) {
    return <Skeleton className='w-full h-[50px]' />;
  }

  return (
    roles && (
      <Select {...props}>
        <SelectTrigger
          id={id}
          className='w-[180px]'
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder='Associated Role' />
        </SelectTrigger>
        <SelectContent>
          {roles
            .map((s) => addLabelValue(s, 'title', 'id'))
            .map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    )
  );
};

export const InviteUsers = ({}) => {
  const { data: roles, isLoading } = useGetRolesQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    control,
    setValue,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      maxUses: 1,
      expiresInDays: 7,
      roleId: '',
    },
  });

  const createCode = async (data, e) => {
    e.preventDefault();

    //console.log('data to be sent to server:', data);

    try {
      const res = await create({
        user: data,
        inviteCode: code,
      }).unwrap();
      enqueueSnackbar('Invite code created', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to generate code', { variant: 'error' });
    }
  };

  return (
    <form className='mt-4 space-y-6' onSubmit={handleSubmit(createCode)}>
      <RegisteredInput
        type='number'
        min='1'
        label='Max Uses'
        name='maxUses'
        register={register}
        errors={errors}
      />

      <RegisteredInput
        type='number'
        min='1'
        label='Expires in (days)'
        name='expiresInDays'
        register={register}
        errors={errors}
      />

      <div className='pt-5 flex justify-end'>
        <Button type='submit' outline='true' disabled={!isDirty || !isValid}>
          Generate New Code
        </Button>
      </div>
    </form>
  );
};
