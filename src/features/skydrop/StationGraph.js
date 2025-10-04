import React, { useEffect, useState } from 'react';
//import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';
import { useGetStationDataQuery } from './skydropApiSlice';
import { skipToken } from '@reduxjs/toolkit/query';
import { Dots } from 'components/Spinners';
import { CustomChart } from './PureChart';
import { StationSelector } from './StationSelector';

const genOptions = (title) => ({
  scales: {
    x: {
      type: 'time',
      time: {
        // Specify Luxon formatting options
        tooltipFormat: 'yyyy-MM-dd', // Format for tooltip display
        unit: 'day', // Unit for axis labels
        displayFormats: {
          day: 'yyyy-MM-dd', // Format for axis labels
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
      text: title,
    },
    legend: {
      display: true,
    },
  },
});

export const StationGraph = ({ data = [], stationId, title }) => {
  const {
    data: stationData,
    isLoading,
    isFetching,
  } = useGetStationDataQuery(!stationId ? skipToken : stationId);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const chartData = {
      // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
      datasets: [
        ...(data
          ? [
              {
                label: 'Treasure Temp',
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
                  .map((x) => ({ x: x['DATE'], y: x['temp_f'] })),
                borderWidth: 1,
                borderColor: 'yellow',
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
  ) : chartData ? (
    <div className='mx-auto'>
      <CustomChart
        type={'line'}
        options={genOptions(title ? title : 'Temp vs Time')}
        chartData={chartData}
      />
    </div>
  ) : null;
};
