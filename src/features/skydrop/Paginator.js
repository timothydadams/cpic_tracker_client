import React, { useState, useEffect } from 'react';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid';

import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from 'catalyst/pagination';

export const StationPages = ({ station, stations, changeStation }) => {
  const [stationId, setStationId] = useState(
    station ? station : stations[0].id
  );

  const getNext = (e) => {
    e.preventDefault();
    const currentIdx = stations.findIndex((x) => x.id === stationId);
    const next =
      currentIdx === stations.length - 1 ? currentIdx : currentIdx + 1;
    const nextId = stations[next]?.id;
    setStationId(nextId);
  };

  const getPrev = (e) => {
    e.preventDefault();
    const currentIdx = stations.findIndex((x) => x.id === stationId);
    const prev = currentIdx === 0 ? 0 : currentIdx - 1;
    const prevId = stations[prev]?.id;
    setStationId(prevId);
  };

  useEffect(() => {
    changeStation(stations.find((x) => x.id === stationId));
  }, [stationId]);

  return (
    <Pagination>
      <PaginationPrevious children='Prev' onClick={(e) => getPrev(e)} />
      <PaginationList>
        {stations.map((s, i) => (
          <PaginationPage
            key={s.id}
            current={stationId === s.id}
            onClick={() => setStationId(s.id)}
          >
            {s.callSign}
          </PaginationPage>
        ))}
      </PaginationList>
      <PaginationNext children='Next' onClick={(e) => getNext(e)} />
    </Pagination>
  );
};
