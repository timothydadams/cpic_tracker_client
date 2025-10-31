import { cn } from 'utils/cn.js';
import { Button } from 'ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
//import { Input } from "ui/input"
//import { Label } from "ui/label"
import { Link } from './catalyst/link';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
//import { useDispatch } from 'react-redux';
//import { setCredentials } from './authSlice';
import { useLoginMutation } from '../features/auth/authApiSlice';
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
import GoogleAuth from '../features/auth/google_auth.js';
import { Separator } from './ui/separator';

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

export function LoginForm({ className, ...props }) {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.state?.from || '/';

  const [errorMsg, setErrorMsg] = useState(null);
  const [persist, setPersist] = usePersist();

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

  const togglePersist = () => {
    setPersist((prev) => (prev === 'SHORT' ? 'LONG' : 'SHORT'));
  };

  const handleLogin = async ({ email, password }, e) => {
    e.preventDefault();

    try {
      const res = await login({
        email,
        password,
        duration: persist,
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
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4'>
            <GoogleAuth
              className='w-full'
              extraState={{ persist, path: currentPath }}
            />
          </div>

          <Separator orientation='horizontal' className='mt-6' />

          <div className='py-6 flex items-center justify-between'>
            <div className='flex items-center'>
              <CheckboxField>
                <Checkbox
                  checked={persist === 'LONG'}
                  onChange={togglePersist}
                />
                <Label>Trust this device</Label>
                <Description>
                  {persist === 'LONG'
                    ? `We'll keep you logged in for a week`
                    : `Must login again after 30 minutes of inactivity`}
                </Description>
              </CheckboxField>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleLogin)}>
            <div className='grid gap-6'>
              <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200 dark:after:border-zinc-800'>
                <span className='relative z-10 bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400'>
                  Or continue with
                </span>
              </div>
              <div className='grid gap-6'>
                <div className='grid gap-2'>
                  <RegisteredInput
                    type='text'
                    label='Email'
                    name='email'
                    wrapperStyle='mt-2'
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className='grid gap-2'>
                  <RegisteredInput
                    id='password'
                    label='Password'
                    name='password'
                    type='password'
                    autoComplete='current-password'
                    wrapperStyle='mt-2'
                    register={register}
                    errors={errors}
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={!isDirty || !isValid}
                >
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className='text-balance text-center text-xs text-zinc-500 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-zinc-900  dark:text-zinc-400 dark:[&_a]:hover:text-zinc-50'>
        By clicking continue, you agree to our{' '}
        <Link href='/terms-of-service'>Terms of Service</Link> and{' '}
        <Link href='/privacy-policy'>Privacy Policy</Link>.
      </div>
    </div>
  );
}
