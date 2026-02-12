import { cn } from 'utils/cn.js';
import { Button } from 'ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Link } from 'catalyst/link';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import {
  useGetUserLoginOptionsMutation,
  useVerifyPasskeyAuthMutation,
} from './authApiSlice';
import usePersist from 'hooks/usePersist';
//form support
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
//import useAuth from 'hooks/useAuth.js';
import { RegisteredInput } from 'components/forms/Input';
import { Checkbox, CheckboxField, CheckboxGroup } from 'catalyst/checkbox.jsx';
import { Description, Fieldset, Label, Legend } from 'catalyst/fieldset.jsx';
import { Text } from 'catalyst/text.jsx';
//import { Button } from 'catalyst/button.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import GoogleAuth from './google_auth.js';
import { Separator } from 'ui/separator';
import { PresentationChartLineIcon } from '@heroicons/react/24/solid';
import { FingerprintIcon } from 'lucide-react';
import { sanitizeString } from 'utils/rhf_helpers';
import { startAuthentication } from '@simplewebauthn/browser';
import { Spinner } from 'ui/spinner';

const schema = yup.object().shape({
  email: yup
    .string()
    .email()
    .transform((value) => sanitizeString(value.trim().toLowerCase()))
    .required('You must provide your email to sign in.'),
});

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

/*
const Step0 = () => (

);

const Step1 = () => {
  return (
    <div></div>
  )
}
*/

export function LoginForm({ className, ...props }) {
  const dispatch = useDispatch();
  const [verifyPasskey] = useVerifyPasskeyAuthMutation();

  const [authInProgress, setAuthInprogress] = useState(false);

  const [passkey, setPasskey] = useState(null);
  const [socialLogins, setSocialLogins] = useState([]);

  const [getOptions, { data: authOpts, reset: resetAuthOptions }] =
    useGetUserLoginOptionsMutation();

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.state?.from || '/';

  const [errorMsg, setErrorMsg] = useState(null);
  const [persist, setPersist] = usePersist();

  async function setAuthOpts(email) {
    try {
      const result = await getOptions(email).unwrap();
      const { passkey, socials } = result;
      if (passkey?.allowCredentials.length > 0) {
        setPasskey((prev) => passkey);
      } else {
        setPasskey((prev) => null);
      }

      if (socials.length > 0) {
        setSocialLogins((prev) => socials);
      } else {
        setSocialLogins((prev) => []);
      }
    } catch (e) {
      //console.log(e);
    }
  }

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const emailValue = watch('email');

  useEffect(() => {
    setPasskey((prev) => null);
    setSocialLogins((prev) => []);
  }, [emailValue, watch]);

  const togglePersist = () => {
    setPersist((prev) => (prev === 'SHORT' ? 'LONG' : 'SHORT'));
  };

  const handlePasskeyLogin = async ({ email }, e) => {
    e.preventDefault();
    setAuthInprogress(true);
    const authOpts = await getOptions(email).unwrap();
    const { passkey } = authOpts;

    //console.log('optionsJSON for webauthn start:', passkey);

    let asseResp;
    try {
      asseResp = await startAuthentication({ optionsJSON: passkey });
      //console.log('asse response from auth start:', asseResp);
      const verifyResults = await verifyPasskey({
        email,
        duration: persist,
        webAuth: asseResp,
      }).unwrap();
      if (verifyResults) {
        //console.log('verificationResults from verification step:',verifyResults);
        const { verified, accessToken } = verifyResults;
        if (verified && accessToken) {
          dispatch(setCredentials({ accessToken }));
          navigate(currentPath, { replace: true });
        }
      }
    } catch (err) {
      setAuthInprogress(false);
      if (!err?.originalStatus) {
        setErrorMsg('No server response');
      } else if (err?.originalStatus === 400) {
        setErrorMsg('Missing data');
      } else {
        setErrorMsg('Login failed');
      }
    }
  };

  return (
    <LoginWrapper>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Welcome back</CardTitle>
            <CardDescription>
              Enter your email to start the sign-in process
            </CardDescription>
          </CardHeader>
          <CardContent>
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

            <form onSubmit={handleSubmit(handlePasskeyLogin)}>
              <div className='grid gap-6'>
                <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200 dark:after:border-zinc-800'>
                  <span className='relative z-10 bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400'>
                    Login or Register
                  </span>
                </div>
                <div className='grid gap-6'>
                  <div className='grid gap-2'>
                    <RegisteredInput
                      type='email'
                      label='Email'
                      name='email'
                      autoComplete='email webauthn'
                      wrapperStyle='mt-2'
                      register={register}
                      errors={errors}
                    />
                  </div>

                  {socialLogins.includes('google') && (
                    <div className='flex flex-col gap-4'>
                      <GoogleAuth
                        className='w-full'
                        extraState={{
                          persist,
                          path: currentPath,
                          email: emailValue,
                        }}
                      />
                    </div>
                  )}

                  {passkey && (
                    <div className='flex flex-col gap-4'>
                      <Button type='submit' disabled={authInProgress}>
                        {authInProgress ? (
                          <>
                            <Spinner /> Signing In...
                          </>
                        ) : (
                          <>
                            <FingerprintIcon /> Sign in with Passkey
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!passkey && socialLogins.length === 0 && (
                    <div className='grid grid-cols-2 gap-5'>
                      <div>
                        <Button
                          type='button'
                          className='w-full'
                          disabled={!isDirty && !isValid}
                          onClick={() => setAuthOpts(emailValue.toLowerCase())}
                        >
                          Login
                        </Button>
                      </div>
                      <div>
                        <Button className='w-full' asChild>
                          <Link href='/register'>Register</Link>
                        </Button>
                      </div>
                    </div>
                  )}
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
    </LoginWrapper>
  );
}
