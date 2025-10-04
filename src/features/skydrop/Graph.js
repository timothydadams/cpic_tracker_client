import React, { useEffect, useState, useReducer } from 'react';
import {
  useGetSkydropMetaQuery,
  useGetStationsQuery,
  useGetStationDataQuery,
} from './skydropApiSlice';
import { skipToken } from '@reduxjs/toolkit/query';
import { Dots } from 'components/Spinners';
import { CustomChart } from './PureChart';
import { StationSelector } from './StationSelector';
import { StationPages } from './Paginator';
import { Text } from 'catalyst/text';
import { Map } from '../maps/map';
import { stateReducer } from 'utils/helpers';

const options = {
  scales: {
    x: {
      type: 'time',
      time: {
        // Specify Luxon formatting options
        tooltipFormat: 'MM-dd | HH:MM', // Format for tooltip display
        unit: 'day', // Unit for axis labels
        displayFormats: {
          day: 'MM-dd', // Format for axis labels
        },
      },
      adapters: {
        zone: 'America/New_York',
      },
      title: {
        display: true,
        text: 'Timestamp',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Temp (Deg F)',
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: 'Temp vs Time',
    },
    legend: {
      display: true,
    },
  },
};

const buildGeoJson = (stations) => ({
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: stations.map((s) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [s.LONGITUDE, s.LATITUDE],
      },
      properties: {
        title: 'Mapbox',
        description: s.NAME,
      },
    })),
  },
});

export const Graph = () => {
  const { data, isFetching, isLoading, error } = useGetSkydropMetaQuery();
  const { data: stations } = useGetStationsQuery();

  //const [station, setStation] = useState(null);
  const [station, setStation] = useReducer(stateReducer, {
    id: null,
    callSign: null,
  });

  const {
    data: stationData,
    isLoading: stationLoading,
    isFetching: stationFetching,
  } = useGetStationDataQuery(
    !station?.id || !station?.callSign ? skipToken : station
  );
  const [chartData, setChartData] = useState(null);
  const [sourceLocations, setSourceLocations] = useState(null);

  const [coords, updateCoords] = useReducer(stateReducer, {
    latitude: 42.9,
    longitude: -72.2666,
  });

  useEffect(() => {
    if (stationData && stationData.length > 0) {
      const latitude = stationData[0].lat;
      const longitude = stationData[0].lon;
      updateCoords({ latitude, longitude });
    }
  }, [stationData]);

  useEffect(() => {
    if (stations) {
      setSourceLocations(buildGeoJson(stations));
    }
  }, [stations]);

  useEffect(() => {
    const chartData = {
      // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
      datasets: [
        ...(data
          ? [
              {
                label: 'Trail Cam Temp',
                data: data.map((x) => ({
                  x: x['isoString'],
                  y: x['rawTempF'],
                })),
                borderWidth: 1,
                borderColor: 'red',
              },
            ]
          : []),
        ...(stationData
          ? [
              {
                label: 'Station Temp',
                data: stationData
                  .filter((x) => x.temp_f < 999)
                  .map((x) => ({ x: x['luxon_dtg'], y: x['temp_f'] })), //temp_f
                borderWidth: 1,
                borderColor: 'teal',
              },
            ]
          : []),
        ...(stationData
          ? [
              {
                label: 'RAIN',
                data: stationData
                  .filter(
                    (x) => x.wxString !== null && x.wxString.includes('RA')
                  )
                  .map((x) => ({ x: x['luxon_dtg'], y: 40 })), //temp_f
                borderWidth: 2,
                borderColor: 'green',
                showLine: false,
              },
            ]
          : []),
        ...(stationData
          ? [
              {
                label: 'Cloud Coverage',
                data: stationData
                  .filter(
                    (x) =>
                      x.clouds &&
                      x.clouds.filter((c) => c.cover !== 'CLR').length > 0
                  )
                  .map((x) => ({ x: x['luxon_dtg'], y: 92 })), //temp_f
                borderWidth: 2,
                borderColor: 'yellow',
                showLine: false,
              },
            ]
          : []),
      ],
    };

    if (data || stationData) {
      setChartData(chartData);
    }
  }, [data, stationData]);

  return isLoading || isFetching ? (
    <Dots />
  ) : (
    <div className='mx-auto w-full'>
      {stationData && stationData.length > 0 && (
        <Text>
          {stationData[0].name}
          {` - (lat:${stationData[0].lat}, lng:${stationData[0].lon})`}
        </Text>
      )}
      {chartData && (
        <CustomChart type={'line'} options={options} chartData={chartData} />
      )}

      {stations && (
        <StationPages
          station={station?.id}
          stations={stations.map((x) => ({
            id: x.STATION,
            callSign: x.callSign,
          }))}
          changeStation={setStation}
        />
      )}

      {coords && sourceLocations && (
        <Map
          coords={coords}
          sourceLocations={sourceLocations}
          disableBtn={true}
        />
      )}
    </div>
  );
};
