//import tw, { css, theme } from 'twin.macro';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useCreateMutation } from './usersApiSlice';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(yup);
import { RegisteredInput } from '../../components/forms/Input';
import { Button } from '../../components/catalyst/button.jsx';
import { Heading, Subheading } from '../../components/catalyst/heading.jsx';
import { enqueueSnackbar } from 'notistack';

//form validation
const schema = yup.object().shape({
  user: yup.object().shape({
    email: yup.string().email().required('Email is required'),
    username: yup.string().required('Username is required'),
    password: yup
      .string()
      .min(8, 'Password must be 8 characters long')
      .minUppercase(2, 'Password requires at least 2 uppercase letter')
      .minLowercase(2, 'Password requires at least 2 lowercase letters')
      .maxRepeating(
        2,
        'Password cannot contain more than 2 repeating characters'
      )
      .minNumbers(2, 'Password requires at least 2 numbers')
      .minSymbols(2, 'Password requires at least 2 symbols')
      .required(),
    verifyPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Must match "password" field value'),
  }),
  profile: yup.object().shape({
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
    bio: yup.string().optional(),
  }),
});

export default function CreateAccount() {
  const [create, { isLoading, isError, error }] = useCreateMutation();
  const navigate = useNavigate();
  const location = useLocation();
  //const from = location.state?.from?.pathname || '/events';

  /*
  react-hook-form setup, use isDirty/isValid to control save btn disable, errors get
  passed back to inputs to get displayed under the input
  */
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
        data,
      }).unwrap();
      enqueueSnackbar('Account Created', { variant: 'success' });
      //navigate(currentPath, { replace: true });
    } catch (err) {
      enqueueSnackbar('Failed to create account', { variant: 'error' });
    }
  };

  return (
    <div className='py-8 px-4'>
      <Heading>Create a New Account</Heading>

      <form className='mt-4 space-y-6' onSubmit={handleSubmit(onCreateAccount)}>
        <Subheading>Required Fields</Subheading>

        <RegisteredInput
          type='text'
          label='Username'
          name='user.username'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='text'
          label='Email'
          autoComplete='email'
          name='user.email'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          label='Password'
          name='user.password'
          type='password'
          autoComplete='new-password'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          label='Confirm Password'
          name='user.verifyPassword'
          type='password'
          autoComplete='new-password'
          register={register}
          errors={errors}
        />

        <Subheading>Additional Details</Subheading>

        <RegisteredInput
          type='text'
          label='First Name'
          name='profile.firstName'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          label='Last name'
          name='profile.lastName'
          type='text'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          label='Bio'
          name='profile.bio'
          element='textarea'
          rows='3'
          register={register}
          errors={errors}
        />

        <div className='pt-5 flex justify-end'>
          <Button plain href={-1}>
            Cancel
          </Button>
          <Button type='submit' outline='true' disabled={!isDirty || !isValid}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
