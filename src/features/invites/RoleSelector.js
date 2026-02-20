import React from 'react';
import { useGetRolesQuery } from '../users/usersApiSlice';
import useAuth from 'hooks/useAuth';
import { Skeleton } from 'ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

const ROLE_ALLOWLIST = {
  isAdmin: null, // null = all roles allowed
  isCPICAdmin: ['CPIC Admin', 'CPIC Member', 'Implementer'],
  isCPICMember: ['CPIC Member', 'Implementer'],
  isImplementer: ['Implementer'],
};

const ROLE_PRIORITY = [
  'isAdmin',
  'isCPICAdmin',
  'isCPICMember',
  'isImplementer',
];

const useFilteredRoles = (roles) => {
  const auth = useAuth();

  return React.useMemo(() => {
    if (!roles) return [];

    for (const roleKey of ROLE_PRIORITY) {
      if (auth[roleKey]) {
        const allowed = ROLE_ALLOWLIST[roleKey];
        return allowed === null
          ? roles
          : roles.filter((r) => allowed.includes(r.name));
      }
    }
    return [];
  }, [roles, auth]);
};

export const RoleSelector = ({ id, fieldState, ...props }) => {
  const { data: roles, isLoading } = useGetRolesQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  const filteredRoles = useFilteredRoles(roles);

  if (isLoading) {
    return <Skeleton className='w-full h-[36px]' />;
  }

  return (
    <Select {...props}>
      <SelectTrigger id={id} aria-invalid={fieldState?.invalid}>
        <SelectValue placeholder='Select role' />
      </SelectTrigger>
      <SelectContent>
        {filteredRoles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
