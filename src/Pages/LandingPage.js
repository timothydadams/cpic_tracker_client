import React, { useReducer, useEffect } from 'react';
import { Text } from '../components/catalyst/text.jsx';
import { Heading, Subheading } from '../components/catalyst/heading.jsx';
import { Metar } from '../features/weather/Metar.js';
import { Airports } from '../features/weather/AirportsDisplay.js';
import { useGeolocated } from 'react-geolocated';
import { Map } from '../features/maps/map.js';
import { update } from 'lodash';
import { stateReducer } from '../utils/helpers.js';
import { Loading } from '../components/Spinners.js';
import { KPIndex } from '../features/weather/KPIndex.js';
import { WeatherLimitController } from '../features/weather/LimitSelection.js';

const LandingPage = () => {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  const initialState = {
    latitude: null,
    longitude: null,
  };

  const [location, updateLocation] = useReducer(stateReducer, initialState);

  useEffect(() => {
    if (coords?.latitude && coords?.longitude) {
      const { latitude, longitude } = coords;
      updateLocation({ latitude, longitude });
    }
  }, [coords]);

  return (
    <>
      <div className='flex'>
        <div>
          <Heading>WX UPDATES</Heading>
          <KPIndex />
        </div>
        <div className='flex-grow'>
          <WeatherLimitController />
        </div>
      </div>

      {location.latitude ? (
        <>
          <Airports coords={location} />
          <Map coords={location} updateLocation={updateLocation} />
        </>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default LandingPage;
