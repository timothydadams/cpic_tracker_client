import React, { useState, useEffect } from 'react';
import { VerifyInvitationCode } from './InvitationCode';
import { UserInfo } from './UserInfo';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../authSlice';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from 'ui/button';
import * as yup from 'yup';
import { sanitizeString } from 'utils/rhf_helpers';
import {
  useRegisterMutation,
  useGetPasskeyRegOptionsMutation,
  useVerifyPasskeyRegMutation,
} from '../authApiSlice';
import { startRegistration } from '@simplewebauthn/browser';
import usePersist from 'hooks/usePersist';
import { Spinner } from 'ui/spinner';
import { enqueueSnackbar } from 'notistack';

const schema = yup.object().shape({
  inviteCode: yup
    .string()
    .transform((value) => sanitizeString(value))
    .required('Valid invite code is required'),
  inviteDetails: yup.object().shape({
    roleId: yup.string().required(),
    roleType: yup.string().required(),
  }),
  user: yup.object().shape({
    email: yup
      .string()
      .email()
      .transform((value) =>
        value ? sanitizeString(value.trim().toLowerCase()) : value
      )
      .required('Email is required'),
    family_name: yup
      .string()
      .transform((value) => sanitizeString(value))
      .required('Last name is required'),
    given_name: yup
      .string()
      .transform((value) => sanitizeString(value))
      .required('First name is required'),
    username: yup
      .string()
      .transform((value) => (value ? sanitizeString(value) : value))
      .notRequired(),
    implementer_org_id: yup
      .string()
      .nullable()
      .test(
        'implementer-org-required',
        'Please select your organization',
        function (value) {
          const roleType = this.from[1]?.value?.inviteDetails?.roleType;
          return roleType === 'Implementer' ? !!value : true;
        }
      ),
    assigned_implementers: yup
      .array()
      .of(yup.string())
      .test(
        'assigned-implementers-required',
        'Please select at least one implementer',
        function (value) {
          const roleType = this.from[1]?.value?.inviteDetails?.roleType;
          return roleType === 'Implementer' ? true : value && value.length > 0;
        }
      ),
  }),
});

const defaultFormValues = {
  inviteCode: '',
  inviteDetails: {
    roleId: '',
    roleType: '',
  },
  user: {
    email: '',
    family_name: '',
    given_name: '',
    username: '',
    implementer_org_id: null,
    assigned_implementers: [],
  },
};

export function OnboardingForm() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email');
  const [persist] = usePersist();
  const dispatch = useDispatch();

  const [createUserAccount] = useRegisterMutation();
  const [genPasskeyRegOpts] = useGetPasskeyRegOptionsMutation();
  const [verifyPasskeyRegOpts] = useVerifyPasskeyRegMutation();

  const [registrationInProgress, setRegistrationInProgress] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, trigger, setValue } = methods;

  useEffect(() => {
    if (emailFromUrl) {
      setValue('user.email', emailFromUrl, { shouldDirty: true });
    }
  }, [emailFromUrl, setValue]);

  const handleNext = async () => {
    let fields;
    if (currentStepIndex === 0) {
      fields = ['inviteCode', 'inviteDetails.roleId', 'inviteDetails.roleType'];
    } else if (currentStepIndex === 1) {
      fields = [
        'user.email',
        'user.family_name',
        'user.given_name',
        'user.username',
        'user.implementer_org_id',
        'user.assigned_implementers',
      ];
    }

    const isValid = await trigger(fields);
    if (isValid && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const steps = [<VerifyInvitationCode nextStep={handleNext} />, <UserInfo />];

  const handleFinalSubmit = async (data, e) => {
    e.preventDefault();
    setRegistrationInProgress(true);
    const user_email = data.user.email;

    try {
      const { data: user } = await createUserAccount(data).unwrap();

      if (user && user.id) {
        const options = await genPasskeyRegOpts({ email: user_email }).unwrap();

        let attResp;
        try {
          attResp = await startRegistration({ optionsJSON: options });
        } catch (error) {
          throw error;
        }

        const verifcationResults = await verifyPasskeyRegOpts({
          email: user_email,
          duration: persist,
          webAuth: attResp,
        }).unwrap();

        const { verified, accessToken } = verifcationResults;

        if (verified && accessToken) {
          dispatch(setCredentials({ accessToken }));
        } else {
          enqueueSnackbar('Passkey verification failed. Please try again.', {
            variant: 'error',
          });
        }
      }
    } catch (e) {
      enqueueSnackbar(e?.data?.message || 'Registration failed', {
        variant: 'error',
      });
    } finally {
      setRegistrationInProgress(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFinalSubmit)}
        className='flex flex-col'
      >
        {steps[currentStepIndex]}
        <div className='pt-5 flex justify-between'>
          {currentStepIndex > 0 && !code && (
            <Button type='button' onClick={handlePrevious}>
              Previous
            </Button>
          )}

          {/* deliberately hiding next button on invite component (step 0), using verify button in input to progress */}
          {currentStepIndex < steps.length - 1 && currentStepIndex > 0 && (
            <Button type='button' onClick={handleNext}>
              Next
            </Button>
          )}

          {currentStepIndex === steps.length - 1 && (
            <Button disabled={registrationInProgress} type='submit'>
              {registrationInProgress ? (
                <>
                  <Spinner /> Creating Passkey
                </>
              ) : (
                'Set Up Passkey'
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
