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
import {
  stateReducer,
  genDT,
  ShortDTFromSeconds,
  timeAgoFromSeconds,
} from 'utils/helpers';
import { current } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { selectCurrentWind, selectCurrentAlt } from './wxSlice';
import { Dots } from 'components/Spinners';
import { DateTime } from 'luxon';
import { handleWeather } from '../../utils/wxAnalysis';

export const TAF = ({ taf, actions, ...props }) => {
  const windLimit = useSelector(selectCurrentWind);
  const altLimit = useSelector(selectCurrentAlt);
  const [isUpdating, setIsUpdating] = useState(false);
  const [wxAlerts, setWXAlerts] = useState([]);

  useEffect(() => {
    console.log('taf updated', taf, windLimit, altLimit);

    if (taf) {
      setIsUpdating(true);
      if (taf?.error) {
        actions.setTafStatus('error');
      } else {
        //checkWeather(taf);
        const issues = handleWeather(taf, { windLimit, altLimit });
        const isExtreme = issues.find((x) => x.alerts.find((i) => i.extreme));
        if (issues.length > 0) {
          if (isExtreme) {
            actions.setTafStatus('extreme');
          } else {
            actions.setTafStatus('warning');
          }
        } else {
          actions.setTafStatus('good');
        }
        console.log('taf alerts combined', issues);
        setWXAlerts(issues);
        setIsUpdating(false);
      }
    } else {
      actions.setTafStatus('na');
    }
  }, [taf, windLimit, altLimit]);

  let tafContent;
  const tafIssue = !!(!taf || taf?.error);
  if (tafIssue) {
    tafContent = null;
  } else if (!tafIssue && isUpdating) {
    tafContent = <Dots />;
  } else if (!tafIssue && !isUpdating) {
    if (wxAlerts.length === 0) {
      tafContent = <Text>No wx concerns</Text>;
    } else {
      tafContent = (
        <DescriptionList>
          {wxAlerts.map(({ start, end, alerts }) =>
            alerts.map((x, j) => (
              <React.Fragment key={j}>
                <DescriptionTerm>
                  {j == 0 ? (
                    timeAgoFromSeconds(start)
                  ) : (
                    <span className='sr-only'>{timeAgoFromSeconds(start)}</span>
                  )}
                </DescriptionTerm>
                <DescriptionDetails>{x.message}</DescriptionDetails>
              </React.Fragment>
            ))
          )}
        </DescriptionList>
      );
    }
  }

  return (
    <>
      <div className='flex justify-between'>
        <div>
          <Subheading>TAF</Subheading>
        </div>
        <div>
          <Text>
            {!taf
              ? 'service not provided'
              : taf?.error
                ? taf.error
                : taf?.validTimeTo && taf?.validTimeFrom
                  ? `${ShortDTFromSeconds(
                      taf.validTimeFrom
                    )} - ${ShortDTFromSeconds(taf.validTimeTo)}`
                  : 'N/A'}
          </Text>
          {/* <Text>{metar?.obsTime ? `observed @ ${genDT(metar.obsTime)}` : `N/A`}</Text>*/}
        </div>
      </div>
      <div className='overflow-y-auto h-32 taf'>{tafContent}</div>

      {/* <Text>{metar?.rawOb && JSON.stringify(metar.rawOb)}</Text> */}
    </>
  );
};
