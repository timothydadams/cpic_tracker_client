import React, { useState, useEffect, useReducer } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'catalyst/table.jsx';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from 'catalyst/description-list.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { Text } from 'catalyst/text.jsx';
import { stateReducer, genDT, genDTFromISO } from '../../utils/helpers';
import { useGetForecastByCoordsQuery } from './wxApiSlice.js';
import { Dots } from 'components/Spinners.js';

export const Forecast = ({ latitude, longitude, actions }, ...props) => {
  const { data, isFetching, isLoading, error } = useGetForecastByCoordsQuery({
    latitude,
    longitude,
  });

  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  useEffect(() => {
    if (data) {
      const { startTime, endTime } = data[0];
      setStart(genDTFromISO(startTime));
      setEnd(genDTFromISO(endTime));
    }
  }, [data]);

  if (isLoading || isFetching || !latitude || !longitude) return <Dots />;

  return error ? (
    <Text>{error}</Text>
  ) : (
    data && data.length > 0 && (
      <>
        <div className='flex justify-between'>
          <div>
            <Subheading>Ground Forecast</Subheading>
          </div>
          <div>
            <Text>{start && end && ` ${start} - ${end}`}</Text>
          </div>
        </div>

        <Text>{data[0].detailedForecast}</Text>
      </>
    )
  );
};
