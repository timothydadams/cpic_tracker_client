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
import { stateReducer, genDT } from 'utils/helpers';
import { useSelector } from 'react-redux';
import { selectCurrentWind, selectCurrentAlt } from './wxSlice';
import { Dots } from 'components/Spinners';
import { handleWeather } from '../../utils/wxAnalysis';

export const Metar = ({ metar, actions, ...props }) => {
  const windLimit = useSelector(selectCurrentWind);
  const altLimit = useSelector(selectCurrentAlt);
  const [wxAlerts, setWXAlerts] = useState([]);

  useEffect(() => {
    console.log('metar updated', metar);

    if (metar) {
      if (metar?.error) {
        actions.setMetarStatus('error');
      } else {
        const alerts = handleWeather(metar, { windLimit, altLimit });
        const isExtreme = alerts.find((x) => x?.extreme);
        console.log('alerts in useEffect', { alerts, isExtreme });
        if (alerts.length > 0) {
          if (isExtreme) {
            actions.setMetarStatus('extreme');
          } else {
            actions.setMetarStatus('warning');
          }
        } else {
          actions.setMetarStatus('good');
        }

        setWXAlerts(alerts);
      }
    } else {
      actions.setMetarStatus('na');
    }
  }, [metar, windLimit, altLimit]);

  return (
    <>
      <div className='flex justify-between'>
        <div>
          <Subheading>METAR</Subheading>
        </div>
        <div>
          <Text>
            {!metar
              ? 'Service not provided'
              : metar?.error
                ? metar.error
                : metar?.obsTime
                  ? `observed @ ${genDT(metar.obsTime)}`
                  : 'N/A'}
          </Text>
          {/* <Text>{metar?.obsTime ? `observed @ ${genDT(metar.obsTime)}` : `N/A`}</Text>*/}
        </div>
      </div>
      {!metar || metar?.error ? null : wxAlerts.length === 0 ? (
        <Text>No wx concerns</Text>
      ) : (
        wxAlerts.map((x, i) => <Text key={i}>{x.message}</Text>)
      )}
      {/* <Text>{metar?.rawOb && JSON.stringify(metar.rawOb)}</Text> */}
    </>
  );
};
