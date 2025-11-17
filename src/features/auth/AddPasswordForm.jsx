import { cn } from 'utils/cn.js';
import { Button } from 'ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Link } from '../../components/catalyst/link';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import { useDispatch } from 'react-redux';
//import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApiSlice';
import usePersist from 'hooks/usePersist';
//form support
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuth from 'hooks/useAuth.js';
import { RegisteredInput } from 'components/forms/Input';
import { Checkbox, CheckboxField, CheckboxGroup } from 'catalyst/checkbox.jsx';
import { Description, Fieldset, Label, Legend } from 'catalyst/fieldset.jsx';
import { Text } from 'catalyst/text.jsx';
//import { Button } from 'catalyst/button.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import GoogleAuth from './google_auth.js';
import { Separator } from 'ui/separator';
import { PresentationChartLineIcon } from '@heroicons/react/24/solid';

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

export const LoginWrapper = ({ children }) => {
  return (
    <>
      <div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
        <div className='flex w-full max-w-sm flex-col gap-6'>
          <div className='flex items-center gap-2 self-center font-medium'>
            <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
              <PresentationChartLineIcon className='size-4' />
            </div>
            Winthrop Comprehensive Plan Tracker
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export function AddPasswordForm({ className, ...props }) {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.state?.from || '/';

  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setErrorMsg(null);
  }, [errors, isDirty, isValid]);

  const onUpdateUser = async (data, e) => {
    e.preventDefault();
    console.log('update data', data);

    /*
    try {
      const res = await login({
        password,
      }).unwrap();

      navigate(currentPath, { replace: true });
    } catch (err) {
      if (!err?.originalStatus) {
        setErrorMsg('No server response');
      } else if (err?.originalStatus === 400) {
        setErrorMsg('Missing username or password');
      } else {
        setErrorMsg('Login failed');
      }
    }
      */
  };

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Add a Password</CardTitle>
          <CardDescription>
            Please create a password to aid in account recovery!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='mt-4 space-y-6'
            onSubmit={handleSubmit(onUpdateUser)}
          >
            <div className='grid gap-6'>
              <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200 dark:after:border-zinc-800'>
                <span className='relative z-10 bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400'>
                  Or continue with
                </span>
              </div>
              <div>
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
                  Add Password
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
