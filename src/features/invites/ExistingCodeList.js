import React from 'react';
import { useGetRolesQuery } from '../users/usersApiSlice';
import { useGetMyCodesQuery } from './inviteApiSlice';
import { InviteCodeItem } from './InviteCodeItem';
import { EmptyContainer } from 'components/EmptyContainer';
import { Skeleton } from 'ui/skeleton';

export const ExistingCodeList = () => {
  const { data: roles } = useGetRolesQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });

  const { data: myCodes, isLoading } = useGetMyCodesQuery(
    { params: { activeOnly: true } },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  const mappedCodes = React.useMemo(() => {
    if (!myCodes || !roles) return null;
    return myCodes.map((c) => ({
      ...c,
      roleName: roles.find((r) => r.id === c.roleId)?.name ?? 'Unknown',
    }));
  }, [myCodes, roles]);

  if (isLoading || mappedCodes === null) {
    return <Skeleton className='w-full h-[100px]' />;
  }

  if (mappedCodes.length === 0) {
    return (
      <EmptyContainer
        title='No active invite codes'
        description='Create one using the form above'
      />
    );
  }

  return (
    <div className='flex w-full flex-col gap-2'>
      {mappedCodes.map((code) => (
        <InviteCodeItem key={code.id} invite={code} />
      ))}
    </div>
  );
};
