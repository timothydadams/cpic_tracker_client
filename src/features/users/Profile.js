import React, { useState, useEffect } from 'react';
import {
  useUpdateMutation,
  useGetUserQuery,
  useRemovePasskeyFromUserMutation,
} from './usersApiSlice.js';
import {
  useGetPasskeyRegOptionsMutation,
  useVerifyPasskeyRegMutation,
} from 'features/auth/authApiSlice';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from 'ui/button.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { enqueueSnackbar } from 'notistack';

//AUTOMATICALLY CONROLS FORM State so you dont need a million useStates etc
//yup does the validation and you can make up custom "formulas" for different types of fields
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RegisteredInput } from 'components/forms/Input';
import { useSelector } from 'react-redux';
import { selectCurrentUserId, selectCurrentRoles } from '../auth/authSlice.js';
import { Skeleton } from 'ui/skeleton.jsx';
import { sanitizeString } from 'utils/rhf_helpers.js';

import GoogleAuth from '../auth/google_auth.js';

import { useGetAllImplementersQuery } from 'features/implementers/implementersApiSlice';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from 'ui/field';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

import { MultiSelect } from 'components/Multiselect';

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from 'ui/item';
import { Spinner } from 'ui/spinner.jsx';
import {
  recursivelySanitizeObject,
  getDirtyValues,
} from 'utils/rhf_helpers.js';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'ui/alert-dialog';

export function ConfirmDelete({
  actionCB = () => {},
  showButtonProps,
  actionButtonProps,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button {...showButtonProps}>Delete Passkey</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Continuing will permanently delete
            this passkey. If you proceed, it may also be necessary to delete
            this passkey from your passkey manager / browser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            {...actionButtonProps}
            onClick={actionCB}
          >
            Delete Passkey
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

//form validation
const schema = yup.object().shape({
  display_name: yup
    .string()
    .transform((value) => sanitizeString(value))
    .optional(),
  username: yup
    .string()
    .transform((value) => sanitizeString(value))
    .optional(),
  //email: yup.string().email().required('Email is required'),
  family_name: yup
    .string()
    .transform((value) => sanitizeString(value))
    .optional(),
  given_name: yup
    .string()
    .transform((value) => sanitizeString(value))
    .optional(),
  assigned_implementers: yup.array().of(yup.string()).optional(),
});

const PasskeyManager = ({ passkeys, userData: { id, email }, refetchUser }) => {
  const [deletePasskey] = useRemovePasskeyFromUserMutation();
  const [genPasskeyRegOpts] = useGetPasskeyRegOptionsMutation();
  const [verifyPasskeyRegOpts] = useVerifyPasskeyRegMutation();
  const [registrationInProgress, setRegistrationInProgress] = useState(false);

  const handleDeletePasskey = async ({ target: { value } }) => {
    try {
      await deletePasskey({ userId: id, pk_id: value }).unwrap();
      refetchUser();
    } catch (e) {
      console.log(e);
    }
    return;
  };

  const registerNewKey = async (e) => {
    e.preventDefault();
    setRegistrationInProgress(true);
    try {
      const options = await genPasskeyRegOpts({ email }).unwrap();
      const attResp = await startRegistration({ optionsJSON: options });
      const verifcationResults = await verifyPasskeyRegOpts({
        email,
        duration: null,
        webAuth: attResp,
      }).unwrap();
      const { verified } = verifcationResults;
      // Show UI appropriate for the `verified` status
      if (verified) {
        refetchUser();
      } else {
        console.error('pk registration error:', verifcationResults);
        setRegistrationInProgress(false);
      }
    } catch (error) {
      // Handle the "Authenticated already registered" error
      if (error.name === 'InvalidStateError') {
        alert('This authenticator is already registered for your account.');
        // You might want to offer an option to log in instead, or simply inform the user.
      } else {
        // Handle other potential errors during registration
        console.error('Registration failed:', error);
        alert('Registration failed: ' + error.message);
      }
    }

    setRegistrationInProgress(false);
  };

  return (
    <>
      <Subheading>Passkey Management</Subheading>
      <div className='flex w-full max-w-md flex-col gap-6'>
        {passkeys.map((x, i) => {
          const { user_agent } = x;
          const pk_createdAt = new Date(x.createdAt);
          const title = user_agent
            ? `${user_agent.platform} - ${user_agent.browser} - ${user_agent.os}`
            : `${x.deviceType} [${x.transports.join(' / ')}]`;
          return (
            <Item variant='outline' key={i}>
              <ItemContent>
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>
                  Created:{' '}
                  {`${pk_createdAt.toLocaleDateString()} ${pk_createdAt.toLocaleTimeString()}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {/* <Button
                  value={x.id}
                  variant='destructive'
                  size='sm'
                  disabled={passkeys.length === 1}
                  onClick={handleDeletePasskey}
                >
                  Delete
                </Button> */}
                <ConfirmDelete
                  variant='destructive'
                  actionCB={handleDeletePasskey}
                  showButtonProps={{
                    variant: 'destructive',
                    size: 'sm',
                    disabled: passkeys.length === 1,
                  }}
                  actionButtonProps={{
                    value: x.id,
                  }}
                />
              </ItemActions>
            </Item>
          );
        })}

        <Button
          size='sm'
          disabled={registrationInProgress}
          onClick={registerNewKey}
        >
          {registrationInProgress && <Spinner />}
          Add Passkey
        </Button>
      </div>
    </>
  );
};

export const ProfileContainer = () => {
  const userId = useSelector(selectCurrentUserId);
  const userRoles = useSelector(selectCurrentRoles);

  const params = {
    federated_idps: true,
    passkeys: true,
    assigned_implementers: true,
    implementer_org: true,
  };

  const { data, isLoading, refetch } = useGetUserQuery(
    { id: userId, params },
    {
      skip: !userId,
    }
  );

  const { data: implementers, isLoading: implementersLoading } =
    useGetAllImplementersQuery({
      applyTransformation: true,
    });

  if (isLoading || implementersLoading) {
    return <Skeleton className='' />;
  }

  const usesGmail = data?.email && data.email.endsWith('gmail.com');
  const googlePreviouslyEnabled =
    data?.federated_idps &&
    data.federated_idps.find((idp) => idp.name == 'google');

  return (
    data &&
    implementers && (
      <>
        {usesGmail && !googlePreviouslyEnabled && (
          <GoogleAuth
            displayText='Enable Google Login'
            extraState={{
              path: { pathname: '/profile' },
              email: data.email,
              isAuthed: true,
            }}
          />
        )}

        {usesGmail && googlePreviouslyEnabled && (
          <Button>Disable Google Authentication</Button>
        )}

        <PasskeyManager
          passkeys={data.passkeys}
          userData={data}
          refetchUser={refetch}
        />

        <ProfileForm
          userData={data}
          userId={userId}
          refetchUser={refetch}
          implementers={implementers}
          userRoles={userRoles}
        />
      </>
    )
  );
};

const ProfileForm = ({
  userData,
  userId,
  refetchUser,
  implementers,
  userRoles,
}) => {
  const userType = userRoles.includes('Implementer') ? 'Implementer' : 'CPIC';

  const [update, { isLoading }] = useUpdateMutation();

  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting, dirtyFields },
    control,
    reset,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      ...userData,
      implementer_org: userData.implementer_org
        ? userData.implementer_org.id.toString()
        : null,
      assigned_implementers: userData.assigned_implementers
        ? userData.assigned_implementers.map((x) => x.id.toString())
        : [],
    },
  });

  useEffect(() => {
    setErrorMsg(null);
  }, [errors, isDirty, isValid]);

  const updateProfile = async (data, e) => {
    e.preventDefault();
    //console.log('user updates:', data);
    const changedFields = getDirtyValues(dirtyFields, data);
    const sanitzedData = recursivelySanitizeObject(changedFields);

    try {
      const result = await update({ id: userId, ...sanitzedData }).unwrap();
      refetchUser();
      //console.log('update response', data);
      enqueueSnackbar('Profile saved', { variant: 'success' });
      //reset({...data})
      //refetchUser();
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

      <Heading>Update your profile</Heading>

      <form className='mt-4 space-y-6' onSubmit={handleSubmit(updateProfile)}>
        <RegisteredInput
          disabled
          type='text'
          label='Email'
          name='email'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='text'
          label='Username'
          name='username'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='text'
          label='Display Name'
          name='display_name'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='text'
          label='First Name'
          name='given_name'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='text'
          label='Last Name'
          name='family_name'
          register={register}
          errors={errors}
        />

        {userType === 'Implementer' ? (
          <FieldGroup>
            <Controller
              name='implementer_org_id'
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='responsive'
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor='form-rhf-select-department'>
                      Department/Org/Committee
                    </FieldLabel>
                    <FieldDescription>
                      Please select the organization you are a member of.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id='form-rhf-select-department'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Select' />
                    </SelectTrigger>
                    <SelectContent position='item-aligned'>
                      {implementers.map((imp) => (
                        <SelectItem key={imp.id} value={imp.id}>
                          {imp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        ) : (
          <FieldGroup>
            <Controller
              name='assigned_implementers'
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  orientation='responsive'
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor='form-rhf-select-department'>
                      Select your assigned implementers
                    </FieldLabel>
                    <FieldDescription>
                      Please select implementers you've been assigned.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <MultiSelect
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    placeholder='Select implementers...'
                    maxCount={5}
                    options={implementers}
                    aria-label='Implementer selection'
                    variant='inverted'
                  />
                </Field>
              )}
            />
          </FieldGroup>
        )}

        <div className='pt-5 flex justify-end'>
          <Button
            type='submit'
            outline='true'
            disabled={!isDirty || !isValid || isSubmitting || isLoading}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};
