// Parent Component (e.g., OnboardingForm.jsx)
import React, { useState } from 'react';
import { FingerprintIcon } from 'lucide-react';
import { VerifyInvitationCode } from './InvitationCode';
import { UserInfo } from './UserInfo';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../authSlice';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams } from 'react-router-dom';
import { Button } from 'ui/button';
import * as yup from 'yup';
import { recursivelySanitizeObject, sanitizeString } from 'utils/rhf_helpers';
import {
  useRegisterMutation,
  useGetPasskeyRegOptionsMutation,
  useVerifyPasskeyRegMutation,
} from '../authApiSlice';
import { startRegistration } from '@simplewebauthn/browser';
import usePersist from 'hooks/usePersist';

//form validation
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
      .transform((value) => sanitizeString(value.trim().toLowerCase()))
      .required('Email is required'),
    family_name: yup
      .string()
      .transform((value) => sanitizeString(value))
      .required('Last name is required'),
    given_name: yup
      .string()
      .transform((value) => sanitizeString(value))
      .required('First name is required'),
    implementer_org_id: yup.string().notRequired(),
    assigned_implementers: yup.array().of(yup.string()).notRequired(),
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
    implementer_org_id: null,
    assigned_implementers: [],
  },
};

export function OnboardingForm() {
  const { code } = useParams();
  const [persist] = usePersist();
  const dispatch = useDispatch();

  const [createUserAccount, { data: user, isLoading }] = useRegisterMutation();
  const [getPasskeyRegOpts, { data: pk_reg_opts }] =
    useGetPasskeyRegOptionsMutation();
  const [verifyPasskeyRegOpts, { data: pk_reg_verification }] =
    useVerifyPasskeyRegMutation();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, trigger, getValues } = methods;

  const handleNext = async () => {
    let fields;
    if (currentStepIndex === 0) {
      fields = ['inviteCode', 'inviteDetails.roleId', 'inviteDetails.roleType'];
    } else if (currentStepIndex === 1) {
      fields = [
        'user.email',
        'user.family_name',
        'user.given_name',
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

  const handleFinalSubmit = async (data) => {
    // Send data to server
    console.log('Final Form Data:', data);
    console.log('sanitzed data:', recursivelySanitizeObject(data));

    try {
      //create new user and get user back
      await createUserAccount(data).unwrap();
      console.log(user);
      //start webauthn registration
      if (user && user.id) {
        await getPasskeyRegOpts(user.id).unwrap();
        let attResp;
        try {
          // Pass the options to the authenticator and wait for a response
          attResp = await startRegistration({ optionsJSON: pk_reg_opts });
        } catch (error) {
          console.log(error);
          throw error;
        }

        // POST the response to the endpoint that calls
        // @simplewebauthn/server -> verifyRegistrationResponse()
        await verifyPasskeyRegOpts({
          userId: user.id,
          duration: persist,
          webAuth: attResp,
        }).unwrap();

        const { verified, accessToken } = pk_reg_verification;

        // Show UI appropriate for the `verified` status
        if (verified && accessToken) {
          console.log('SUCCESS!');
          dispatch(setCredentials({ accessToken }));
        } else {
          console.error('problem:', pk_reg_verification);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <FormProvider {...methods}>
      {/* Stepper/Progress Indicator (Optional) */}
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

          {/* deliberatly hiding next button on invite component (step 0), using verify button in input to progress */}
          {currentStepIndex < steps.length - 1 && currentStepIndex > 0 && (
            <Button type='button' onClick={handleNext}>
              Next
            </Button>
          )}

          {currentStepIndex === steps.length - 1 && (
            <Button type='submit'>Complete Registration</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
