import React, { useEffect, useState } from 'react';
//import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import {
  useGetSkydropMetaQuery,
  useGetStationsQuery,
  useGetStationDataQuery,
} from './skydropApiSlice';
import { skipToken } from '@reduxjs/toolkit/query';
import { Dots } from 'components/Spinners';
import { StationGraph } from './StationGraph';
import { Text } from 'catalyst/text';

export const ShowAllStations = () => {
  //get treasure site
  const { data, isFetching, isLoading, error } = useGetSkydropMetaQuery();
  const { data: stations } = useGetStationsQuery();
  //get all stations

  return isLoading || isFetching ? (
    <Dots />
  ) : stations ? (
    stations.map((s) => (
      <div className='mx-auto' key={s.STATION}>
        <Text>{`${s.NAME} - (lat:${s.LATITUDE}, lng:${s.LONGITUDE})`}</Text>
        <StationGraph data={data} stationId={s.STATION} />
      </div>
    ))
  ) : null;
};
