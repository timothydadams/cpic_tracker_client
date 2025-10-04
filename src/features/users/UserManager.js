import React, { useReducer, useEffect, useState } from 'react';
import { Text } from '../../components/catalyst/text.jsx';
import { Heading, Subheading } from '../../components/catalyst/heading.jsx';
import { Loading } from '../../components/Spinners.js';
import { KPIndex } from '../weather/KPIndex.js';
import { WeatherLimitController } from '../weather/LimitSelection.js';
import useAuth from '../../Hooks/useAuth.js';
import { DynamicTable } from '../../components/layout/DynamicTable.js';
import { useGetAllUsersQuery } from './usersApiSlice.js';
import { UserList } from './UserListTable.js';

export const UserManager = () => {
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAllUsersQuery();

  return (
    <>
      <div className='flex'>
        <div>
          <Heading>Manage Users</Heading>
        </div>
      </div>
      {isSuccess && data ? <UserList users={data} /> : <Loading />}
    </>
  );
};
