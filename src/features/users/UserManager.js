import React, { useReducer, useEffect, useState } from 'react';
import { Text } from 'catalyst/text';
import { Heading, Subheading } from 'catalyst/heading';
import { Loading } from 'components/Spinners.js';
import useAuth from 'hooks/useAuth.js';
import { useGetAllUsersQuery } from './usersApiSlice.js';
import { UserList } from './UserListTable.js';

export const UserManager = () => {
  const { data, isLoading, isFetching, isSuccess, isError, error, refetch } =
    useGetAllUsersQuery();

  return (
    <>
      <div className='flex'>
        <div>
          <Heading>Manage Users</Heading>
        </div>
      </div>
      {isSuccess && data ? (
        <UserList users={data} refetchUsers={refetch} />
      ) : (
        <Loading />
      )}
    </>
  );
};
