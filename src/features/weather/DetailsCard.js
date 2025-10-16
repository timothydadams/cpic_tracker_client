import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  CreditCardIcon,
  UserCircleIcon,
} from '@heroicons/react/20/solid';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from 'catalyst/description-list.jsx';
import { Badge } from 'catalyst/badge.jsx';
import { Text } from 'catalyst/text.jsx';
import { genDT } from '../../utils/helpers';
import { Metar } from './Metar';
import { TAF } from './TAF';
import { Forecast } from './ShortForecast';
import { Dots } from 'components/Spinners';

const statusColors = {
  good: 'emerald',
  extreme: 'red',
  warning: 'yellow',
  error: 'red',
  na: 'zinc',
  loading: 'blue',
};

const StatusBadge = ({ status, label }) => {
  const color = statusColors[status];
  return <Badge color={statusColors[status]}>{label}</Badge>;
};

const Header = ({
  details: { name, icao, distance },
  metarStatus,
  tafStatus,
}) => (
  <div className='border-b dark:border-white border-zinc-800'>
    <div className='flex justify-between'>
      <div>
        <Subheading>
          {icao} ({(distance / 1000).toFixed(1)} KM)
        </Subheading>
      </div>
      <div>
        <StatusBadge status={metarStatus} label={'METAR'} />{' '}
        <StatusBadge status={tafStatus} label={'TAF'} />
      </div>
    </div>
    <div className='w-full'>
      <Text className='truncate'>{name}</Text>
    </div>
  </div>
);

export default function DetailsCard({
  airport: {
    taf = null,
    metar = null,
    has_metar,
    has_taf,
    lat,
    lon,
    ...details
  },
}) {
  const [metarStatus, setMetarStatus] = useState(
    has_metar === null || has_metar === false || !metar
      ? 'na'
      : metar?.error !== undefined
        ? 'error'
        : 'loading'
  );
  const [tafStatus, setTafStatus] = useState(
    has_taf === null || has_taf === false
      ? 'na'
      : taf?.error !== undefined
        ? 'error'
        : 'loading'
  );

  return (
    <>
      <div className='bg-zinc-100 dark:bg-zinc-900 rounded-lg p-2 ring-1 ring-slate-900/5 shadow-xs dark:ring-slate-50/75'>
        <Header
          details={details}
          metarStatus={metarStatus}
          tafStatus={tafStatus}
        />

        <div className='px-1 py-2 '>
          {lat && lon && <Forecast latitude={lat} longitude={lon} />}
        </div>
        <div className='px-1 py-2 min-h-16 border-t border-gray-900/5 dark:border-white'>
          <TAF taf={taf} actions={{ setTafStatus }} />
        </div>

        <div className='mt-2 border-t border-gray-900/5 dark:border-white px-1 pt-2'>
          <Metar metar={metar} actions={{ setMetarStatus }} />
        </div>
        {/* <div className="mt-2 border-t border-gray-900/5 dark:border-white px-2 py-2">
            <div className="flex justify-between">
                <div>
                    <Subheading>METAR</Subheading>
                </div>
                <div>
                    <Text>{metar?.obsTime ? `observed @ ${genDT(metar.obsTime)}` : `N/A`}</Text>
                </div>
            </div>
            <Text>
                {metar?.rawOb && JSON.stringify(metar.rawOb)}
            </Text>
        </div> */}
      </div>
    </>
  );
}
