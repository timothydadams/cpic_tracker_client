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
import { stateReducer, genDT, genDTFromISOWithDate } from 'utils/helpers';
import { useGetKPIndexQuery } from './wxApiSlice';
import { Loading, Dots } from 'components/Spinners';
import { DateTime } from 'luxon';
import { Badge, Tile } from 'catalyst/badge';
import { genHoursFromISO } from 'utils/helpers';

const statusColors = {
  none: 'emerald',
  minor: 'emerald',
  moderate: 'yellow',
  strong: 'orange',
  severe: 'red',
  extreme: 'red',
  unkown: 'red',
};

const TimeDisplay = ({ startTime }) => {
  const [valid, setIsValid] = useState(false);
  const [end, setEndTime] = useState(null);

  useEffect(() => {
    if (DateTime.fromISO(startTime).isValid) {
      setEndTime(DateTime.fromISO(startTime).plus({ hours: 3 }));
      setIsValid(true);
    }
  }, [startTime]);

  return (
    <div>
      {valid && end ? (
        <Text>
          {genHoursFromISO(startTime)} - {end && genHoursFromISO(end)}
        </Text>
      ) : (
        <Text>`Invalid Date`</Text>
      )}
    </div>
  );
};

export const KPIndex = () => {
  const { data, isFetching, isLoading, isError } = useGetKPIndexQuery();

  const [stormCat, setCat] = useState(null);

  useEffect(() => {
    if (data?.kp) {
      const { kp } = data;
      let cat;
      switch (true) {
        case kp >= 5 && kp < 6:
          cat = 'minor';
          break;
        case kp >= 6 && kp < 7:
          cat = 'moderate';
          break;
        case kp >= 7 && kp < 8:
          cat = 'strong';
          break;
        case kp >= 8 && kp < 9:
          cat = 'severe';
          break;
        case kp >= 9:
          cat = 'extreme';
          break;
        default:
          cat = 'none';
      }
      setCat(cat);
    } else {
      setCat('unknown');
    }
  }, [data]);

  return (
    <Tile
      className='h-32 w-32 p-2 shadow-md'
      color={data?.kp && stormCat ? statusColors[stormCat] : 'red'}
    >
      <div className='h-full grid grid-rows-3'>
        <div className='flex justify-between'>
          <div>
            <Heading>Kp</Heading>
          </div>
          {isLoading ? (
            <Dots />
          ) : isError ? null : data?.timestamp ? (
            <TimeDisplay startTime={data.timestamp} />
          ) : null}
        </div>
        <div className='mx-auto font-bold text-4xl'>
          {isLoading ? (
            <Dots />
          ) : isError ? (
            'Error'
          ) : data?.kp ? (
            data.kp
          ) : (
            'data issue'
          )}
        </div>
        <div className='mx-auto my-auto text-sm uppercase'>
          {isLoading ? (
            <Dots />
          ) : isError ? (
            'API ISSUE'
          ) : stormCat ? (
            stormCat
          ) : null}
        </div>
      </div>
    </Tile>
  );
};
