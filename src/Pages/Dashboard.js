import React, { useReducer, useEffect } from 'react';
import { Text } from 'catalyst/text.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { Metar } from '../features/weather/Metar.js';
import { Airports } from '../features/weather/AirportsDisplay.js';
import { useGeolocated } from 'react-geolocated';
import { Map } from '../features/maps/map.js';
import { update } from 'lodash';
import { stateReducer } from 'utils/helpers.js';
import { Loading } from 'components/Spinners.js';
import { KPIndex } from '../features/weather/KPIndex.js';
import { WeatherLimitController } from '../features/weather/LimitSelection.js';

export const Dashboard = () => {
  return (
    <>
      <div className='flex'>
        <div>
          <Heading>FUTURE CPIC DASHBOARD METRICS</Heading>
          <Text>
            Figure out public-facing metrics for the community (external)
          </Text>
          <Text>Figure out admin-facing metrics (internal)</Text>
        </div>
      </div>
    </>
  );
};
