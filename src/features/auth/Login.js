import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApiSlice';
import usePersist from '../../Hooks/usePersist';
//form support
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuth from '../../Hooks/useAuth.js';
import { RegisteredInput } from '../../components/forms/Input';
import {
  Checkbox,
  CheckboxField,
  CheckboxGroup,
} from '../../components/catalyst/checkbox.jsx';
import {
  Description,
  Fieldset,
  Label,
  Legend,
} from '../../components/catalyst/fieldset.jsx';
import { Text } from '../../components/catalyst/text.jsx';
import { Button } from '../../components/catalyst/button.jsx';
import { Heading, Subheading } from '../../components/catalyst/heading.jsx';
import GoogleAuth from './google_auth.js';

const schema = yup
  .object({
    email: yup.string().email().required(),
    //username: yup.string().required(),
    password: yup.string().required(),
  })
  .required();

const Login = () => {
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
    mode: 'all',
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
    <>
      <div className='text-gray-400 flex flex-col justify-center py-6 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <Heading className='mt-4 text-center tracking-tight'>
            Sign in to your account
          </Heading>

          {errorMsg && (
            <p
              aria-live='assertive'
              className='whitespace-pre mt-2 text-center text-sm text-red-600'
            >
              {errorMsg}
            </p>
          )}
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className=' py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <form className='space-y-6' onSubmit={handleSubmit(handleLogin)}>
              <RegisteredInput
                type='text'
                label='Email'
                name='email'
                wrapperStyle='mt-2'
                register={register}
                errors={errors}
              />

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

              <div className='flex items-center justify-between'>
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

              <div>
                <Button
                  type='submit'
                  disabled={!isDirty || !isValid}
                  className='flex w-full'
                >
                  Sign in
                </Button>
              </div>
            </form>

            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 text-gray-400 bg-white dark:bg-zinc-900'>
                    Or
                  </span>
                </div>
              </div>

              <div className='mt-6'>
                <GoogleAuth />
              </div>
              <div className='mt-6 flex flex-row justify-between'>
                <div className='text-sm'>
                  <Button plain href='/resetpassword' className='font-medium'>
                    Forgot your password?
                  </Button>
                </div>

                <div className='text-sm'>
                  <Button plain href='/createaccount' className='font-medium'>
                    Create an account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
