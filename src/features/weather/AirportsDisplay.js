import React, { useState, useEffect } from 'react';
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
import { Subheading } from 'catalyst/heading.jsx';
import { Text } from 'catalyst/text.jsx';
import { useGetMetarByCoordsQuery } from './wxApiSlice.js';

import DetailsCard from './DetailsCard.js';
import { Dots } from '../../components/Spinners.js';

const ConditionsDL = ({ listArray, isWarning = false, ...props }) => {
  return isWarning ? (
    <DescriptionList {...props}>
      {isWarning && <DescriptionTerm>WARNING</DescriptionTerm>}
      <DescriptionDetails>
        {listArray.map((l, i) => (
          <Text key={i}>{l.text}</Text>
        ))}
      </DescriptionDetails>
    </DescriptionList>
  ) : listArray ? (
    listArray.map((item, i) => <Text key={i}>{item.text}</Text>)
  ) : null;
};

const CloudDL = ({ listArray, ...props }) => (
  <div {...props}>
    {listArray.map((a, i) => (
      <Text key={i}>
        {a.base ? `${a.base} - ` : null} {a.cover && a.cover}
      </Text>
    ))}
  </div>
);

export const Airports = ({ coords, ...props }) => {
  const { latitude, longitude } = coords;

  const [isWarning, setIsWarning] = useState(false);
  const [showConditions, setShowConditions] = useState(false);

  const {
    data: airports,
    isFetching: APfetching,
    isLoading: APLoading,
    isError: APError,
  } = useGetMetarByCoordsQuery(
    { latitude, longitude },
    {
      pollingInterval: 1000 * 60 * 10,
      selectFromResult: ({ data, isFetching, isLoading, isError }) => ({
        data,
        isFetching,
        isLoading,
        isError,
      }),
    }
  );

  if (APLoading) return <Dots />;

  return airports && airports.length > 0 ? (
    <div className='w-full grid lg:grid-cols-3 max-md:grid-cols-1 lg:gap-x-2  gap-y-2 my-2'>
      {airports.map((a, i) => (
        <DetailsCard airport={a} key={i} />
      ))}
    </div>
  ) : null;
};
