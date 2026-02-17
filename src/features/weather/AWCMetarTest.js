import React, { useEffect } from 'react';
//import { useGetMetarQuery } from '../../app/api/wxService.js';
import { useGetJokeQuery } from '../../app/api/jokesApiSlice.js';
import { useGetMetarByICAOQuery } from '../../app/api/aviationWXCenterSlice.js';
import { useGetMetarQuery, useGetMetarByCoordsQuery } from './wxApiSlice.js';
import { Text } from '../../components/c2/text.jsx';

export const AWCMetar = ({ coords, ...props }) => {
  const { latitude, longitude } = coords;
  //const { statement: { isConfirmed }, statement } = this.props; //get both nested prop and whole obj
  /*  
const {
    data,
    isFetching,
    isLoading,
    isError,
  } = useGetMetarQuery(
    'KU00'
  )
*/
  const { data, isFetching, isLoading, isError } = useGetMetarByCoordsQuery(
    { latitude, longitude },
    {
      selectFromResult: ({ data, isFetching, isLoading, isError }) => ({
        data,
        isFetching,
        isLoading,
        isError,
      }),
    }
  );

  if (isLoading) return <Text>Loading...</Text>;
  if (!data || data.length === 0 || isError)
    return <Text>Invalid ICAO / Metar unavailable...</Text>;

  return (
    <>
      {
        <Text>
          {data &&
            Math.floor(
              (Date.now() - Date.parse(`${data[0].reportTime}Z`)) / (1000 * 60)
            ) + ` minute(s) ago`}
        </Text>
      }
      {isFetching ? '...refetching' : ''}
    </>
  );
};
