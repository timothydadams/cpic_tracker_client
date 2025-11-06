import React from 'react';
import { useGetRolesQuery } from '../users/usersApiSlice';
import { useCreateCodeMutation } from './inviteApiSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import {
  Field,
  FieldDescription,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from 'ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';
import { recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Separator } from 'ui/separator';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import YupPassword from 'yup-password';
YupPassword(yup);
import { RegisteredInput } from 'components/forms/Input';
import { Button } from 'catalyst/button';
import useAuth from 'hooks/useAuth';
import { Skeleton } from 'ui/skeleton';

import { useCopyToClipboard } from '@uidotdev/usehooks';

import {
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconStar,
} from '@tabler/icons-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from 'ui/input-group';

import {
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from 'ui/hybrid-tooltip';

const schema = yup.object().shape({
  maxUses: yup.number().required(),
  expiresInDays: yup.number().required(),
  roleId: yup.string().uuid().required('Role is required'),
});

const addLabelValue = (item, labelKey, valueKey) => {
  return {
    ...item,
    label: item[labelKey],
    value: item[valueKey],
  };
};

export const RoleSelector = ({ id, fieldState, ...props }) => {
  const { data: roles, isLoading } = useGetRolesQuery();
  const [filteredRoles, setFilteredRoles] = React.useState([]);
  const user = useAuth();
  const { isCPICAdmin, isCPICMember, isImplementer } = user;

  React.useEffect(() => {
    console.log({ roles, isCPICAdmin, isCPICMember, isImplementer });
    if (roles) {
      if (isCPICMember || isCPICAdmin) {
        setFilteredRoles(roles.filter((r) => r.name !== 'Admin'));
      }
      if (isImplementer) {
        setFilteredRoles(roles.filter((r) => r.name === 'Implementer'));
      }
    }
  }, [roles]);

  if (isLoading) {
    return <Skeleton className='w-full h-[30px]' />;
  }

  return (
    roles && (
      <Select {...props}>
        <SelectTrigger
          id={id}
          className='w-[180px]'
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder='Associated Role' />
        </SelectTrigger>
        <SelectContent>
          {filteredRoles.length > 0
            ? filteredRoles
                .map((s) => addLabelValue(s, 'name', 'id'))
                .map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))
            : roles
                .map((s) => addLabelValue(s, 'name', 'id'))
                .map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
        </SelectContent>
      </Select>
    )
  );
};

const CopyUrlField = ({ code }) => {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const isCopied = Boolean(copiedText);

  const url = `https://cpic.dev/register/${code}`;

  return (
    <InputGroup>
      <InputGroupInput placeholder={url} readOnly />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          aria-label='Copy'
          title='Copy'
          size='icon-xs'
          onClick={() => {
            copyToClipboard(url);
          }}
        >
          {isCopied ? <IconCheck /> : <IconCopy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export const CreateCodeForm = ({}) => {
  const { data: roles, isLoading } = useGetRolesQuery();
  const [createCode, { isLoading: isLoadingCode }] = useCreateCodeMutation();

  const [codeGenerated, setCodeGenerated] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    control,
    setValue,
    reset,
    resetField,
    getValues,
    watch,
    getFieldState,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      maxUses: 1,
      expiresInDays: 7,
      roleId: '',
    },
  });

  const handleCreateCode = async (data, e) => {
    e.preventDefault();

    console.log('data to be sent to server:', {
      data: recursivelySanitizeObject(data),
    });

    try {
      const sanitezed = recursivelySanitizeObject(data);
      const { code } = await createCode(sanitezed).unwrap();
      if (code) {
        setCodeGenerated(code);
      }
      //enqueueSnackbar('Code created', { variant: 'success' });
    } catch (err) {
      console.log(err);
      //enqueueSnackbar('Failed to create account', { variant: 'error' });
    }
  };

  return (
    <form className='mt-4 space-y-6' onSubmit={handleSubmit(handleCreateCode)}>
      <RegisteredInput
        type='number'
        min='1'
        label='Max Uses'
        name='maxUses'
        register={register}
        errors={errors}
      />

      <RegisteredInput
        type='number'
        min='1'
        label='Expires in (days)'
        name='expiresInDays'
        register={register}
        errors={errors}
      />

      <Controller
        name='roleId'
        control={control}
        render={({ field, fieldState }) => (
          <Field orientation='responsive' data-invalid={fieldState.invalid}>
            <FieldContent>
              <FieldLabel htmlFor='role-id-field-selector'>
                Select role:
              </FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <RoleSelector
              fieldState={fieldState}
              id='role-id-field-selector'
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            />
          </Field>
        )}
      />

      {codeGenerated && <CopyUrlField code={codeGenerated} />}

      <div className='pt-5 flex justify-end'>
        <Button type='submit' outline='true' disabled={!isDirty || !isValid}>
          Generate New Code
        </Button>
      </div>
    </form>
  );
};
