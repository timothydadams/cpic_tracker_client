//import tw, { css, theme } from 'twin.macro';
import React, { useEffect, useState } from 'react';
import {
  NavLink,
  useNavigate,
  useLocation,
  Link,
  useParams,
} from 'react-router-dom';
import { useRegisterMutation } from './usersApiSlice';
import { useValidateCodeQuery } from '../invites/inviteApiSlice';
import { Skeleton } from 'ui/skeleton';
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
import { Button } from 'catalyst/button.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { enqueueSnackbar } from 'notistack';
import GoogleAuth from '../auth/google_auth';

//form validation
const schema = yup.object().shape({
  email: yup.string().email().required('Email is required'),
  family_name: yup.string().required('Last name is required'),
  given_name: yup.string().required('First name is required'),
  password: yup
    .string()
    .min(8, 'Password must be 8 characters long')
    .minUppercase(2, 'Password requires at least 2 uppercase letter')
    .minLowercase(2, 'Password requires at least 2 lowercase letters')
    .maxRepeating(2, 'Password cannot contain more than 2 repeating characters')
    .minNumbers(2, 'Password requires at least 2 numbers')
    .minSymbols(2, 'Password requires at least 2 symbols')
    .required(),
  verifyPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Must match "password" field value'),
});

export default function CreateAccount() {
  const { code } = useParams();
  const { data: inviteDetails, isLoading: isLoadingCode } =
    useValidateCodeQuery(code);
  const [create, { isLoading, isError, error }] = useRegisterMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.state?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    control,
    setValue,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const onCreateAccount = async (data, e) => {
    e.preventDefault();

    console.log('data to be sent to server:', data);

    try {
      const res = await create({
        user: data,
        inviteCode: code,
      }).unwrap();
      enqueueSnackbar('Account Created', { variant: 'success' });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      enqueueSnackbar('Failed to create account', { variant: 'error' });
    }
  };

  if (isLoadingCode) {
    return <Skeleton className='w-full h-full' />;
  }

  if (!inviteDetails?.valid) {
    return <p>Invalid registration code</p>;
  }

  return (
    inviteDetails?.valid && (
      <div className='flex flex-col gap-6'>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Register New Account</CardTitle>
            <CardDescription>Continue with Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4'>
              <GoogleAuth
                className='w-full'
                extraState={{
                  newuser: inviteDetails,
                  path: currentPath,
                  inviteCode: code,
                }}
              />
            </div>

            <form
              className='mt-4 space-y-6'
              onSubmit={handleSubmit(onCreateAccount)}
            >
              <div className='grid gap-6'>
                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200 dark:after:border-zinc-800'>
                  <span className='relative z-10 bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400'>
                    Or continue with
                  </span>
                </div>
                <div>
                  <RegisteredInput
                    type='text'
                    label='First Name'
                    name='given_name'
                    register={register}
                    errors={errors}
                  />

                  <RegisteredInput
                    label='Last name'
                    name='family_name'
                    type='text'
                    register={register}
                    errors={errors}
                  />

                  <RegisteredInput
                    type='text'
                    label='Email'
                    autoComplete='email'
                    name='email'
                    register={register}
                    errors={errors}
                  />

                  <RegisteredInput
                    label='Password'
                    name='password'
                    type='password'
                    autoComplete='new-password'
                    register={register}
                    errors={errors}
                  />

                  <RegisteredInput
                    label='Confirm Password'
                    name='verifyPassword'
                    type='password'
                    autoComplete='new-password'
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className='pt-5 flex justify-end'>
                  <Button
                    type='submit'
                    outline='true'
                    disabled={!isDirty || !isValid}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  );
}
