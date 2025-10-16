import React, { useState, useEffect } from 'react';
import { CameraInput } from 'components/forms/PhotoInput';
import { useUpdateMutation, useGetUserQuery } from './usersApiSlice.js';
import useAuth from 'hooks/useAuth.js';
import { Button } from 'catalyst/button.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { enqueueSnackbar } from 'notistack';

//AUTOMATICALLY CONROLS FORM State so you dont need a million useStates etc
//yup does the validation and you can make up custom "formulas" for different types of fields
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RegisteredInput, RegisteredSelect } from 'components/forms/Input';

//form validation
const schema = yup.object().shape({
  display_name: yup.string().optional(),
  nickname: yup.string().optional(),
  email: yup.string().email().required('Email is required'),
  family_name: yup.string().optional(),
  given_name: yup.string().optional(),
});

export const Profile = (props) => {
  const { id, username, roles, status, isEditor, isAdmin } = useAuth();

  console.log('id on login:', id);

  const [update, { isLoading }] = useUpdateMutation();

  useEffect(() => {
    console.log('isLoading', isLoading);
  }, [isLoading]);

  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isSuccess,
    isError,
    error,
  } = useGetUserQuery(id);

  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid },
    control,
    reset,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const updateFields = () => {
      setValue('username', user.username, { shouldDirty: false });
      setValue('email', user.email, { shouldDirty: false });
      setValue('profile.firstName', user.profile.firstName, {
        shouldDirty: false,
      });
      setValue('profile.lastName', user.profile.lastName, {
        shouldDirty: false,
      });
      setValue('profile.bio', user.profile.bio, { shouldDirty: false });
    };

    if (isSuccess && user) updateFields();
  }, [isSuccess, user]);

  useEffect(() => {
    setErrorMsg(null);
  }, [errors, isDirty, isValid]);

  const updateProfile = async (data, e) => {
    e.preventDefault();

    try {
      const res = await update({ id, ...data }).unwrap();
      console.log('update response', res);
      enqueueSnackbar('Profile saved', { variant: 'success' });
    } catch (err) {
      if (!err?.originalStatus) {
        enqueueSnackbar('No server response', { variant: 'error' });
        //setErrorMsg('No server response');
      } else if (err?.originalStatus === 400) {
        enqueueSnackbar('Missing username or password', { variant: 'error' });
        //setErrorMsg('Missing username or password');
      } else {
        enqueueSnackbar('Update failed', { variant: 'error' });
        //setErrorMsg('Update failed');
      }
    }
  };

  //shadow sm:rounded-lg sm:px-10

  return (
    <div className='py-8 px-4'>
      {errorMsg && (
        <p
          aria-live='assertive'
          className='whitespace-pre mt-2 text-center text-sm text-red-600'
        >
          {errorMsg}
        </p>
      )}

      <Heading>Update your profile information</Heading>

      <form className='mt-4 space-y-6' onSubmit={handleSubmit(updateProfile)}>
        <RegisteredInput
          type='text'
          label='Username'
          name='username'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='text'
          label='Email'
          name='email'
          register={register}
          errors={errors}
        />

        <Subheading>
          Optional Information - Other users can see this information.
        </Subheading>

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
          <Button
            type='submit'
            outline='true'
            disabled={!isDirty || !isValid || isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};
