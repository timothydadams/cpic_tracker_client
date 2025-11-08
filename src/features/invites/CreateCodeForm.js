import React from 'react';
import { useGetRolesQuery } from '../users/usersApiSlice';
import { useCreateCodeMutation, useGetMyCodesQuery } from './inviteApiSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'ui/card';
import { Label } from 'ui/label';
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
import { Spinner } from 'ui/spinner';

import { useCopyToClipboard } from '@uidotdev/usehooks';

import { IconCheck, IconCopy } from '@tabler/icons-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from 'ui/input-group';

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

const MyExistingCodes = ({ roles }) => {
  console.log('roles', roles);
  const { data: myCodes, isLoading } = useGetMyCodesQuery();
  const [mappedCodes, setMappedCodes] = React.useState([]);

  React.useEffect(() => {
    if (myCodes && roles) {
      const mapped = myCodes.map((c) => {
        console.log('code:', { c });
        let name = roles.find((r) => r.id === c.roleId)?.name;
        return {
          ...c,
          roleName: name,
        };
      });
      setMappedCodes((prev) => mapped);
    }
  }, [myCodes, roles]);

  if (isLoading) {
    return <Skeleton className='w-full h-[100px]' />;
  }

  return (
    mappedCodes && (
      <Card>
        <CardHeader>
          <CardTitle>My Existing Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {mappedCodes.map((c) => (
            <CopyUrlField invite={c} key={c.id} />
          ))}
        </CardContent>
      </Card>
    )
  );
};

export const RoleSelector = ({ id, fieldState, ...props }) => {
  const { data: roles, isLoading } = useGetRolesQuery();
  const [filteredRoles, setFilteredRoles] = React.useState([]);
  const user = useAuth();
  const { isCPICAdmin, isCPICMember, isImplementer } = user;

  React.useEffect(() => {
    //console.log({ roles, isCPICAdmin, isCPICMember, isImplementer });
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

const CopyUrlField = ({ invite }) => {
  const { code, useCount, maxUses, roleId, roleName } = invite;
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = React.useState(false);

  const url = `https://cpic.dev/register/${code}`;

  const handleCopyToggle = () => {
    copyToClipboard(`https://cpic.dev/register/${code}`);
    setIsCopied(true);
  };

  React.useEffect(() => {
    if (copiedText) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [copiedText]);

  return (
    <InputGroup>
      <InputGroupInput placeholder={url} readOnly id={roleId} />

      <InputGroupAddon align='block-start'>
        <Label htmlFor={roleId} className='text-foreground'>
          {`${roleName} (${maxUses - useCount} uses remaining)`}
        </Label>

        <InputGroupButton
          aria-label='Copy'
          className='ml-auto'
          title='Copy'
          size='icon-xs'
          onClick={handleCopyToggle}
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
    watch,
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

    try {
      const sanitized = recursivelySanitizeObject(data);
      const payload = await createCode(sanitized).unwrap();
      if (payload) {
        setCodeGenerated({ ...payload, roleName: selectedRoleName });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const selectedRole = watch('roleId');
  const selectedRoleName =
    selectedRole !== '' ? roles.find((r) => r.id === selectedRole)?.name : '';

  return (
    <div>
      <MyExistingCodes roles={roles} />

      <form
        className='mt-4 space-y-6'
        onSubmit={handleSubmit(handleCreateCode)}
      >
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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

        {codeGenerated && <CopyUrlField invite={codeGenerated} />}

        <div className='pt-5 flex justify-end'>
          <Button
            type='submit'
            outline='true'
            disabled={!isDirty || !isValid || isLoadingCode}
          >
            {isLoadingCode ? (
              <>
                <Spinner />
                Processing
              </>
            ) : (
              'Generate New Code'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
