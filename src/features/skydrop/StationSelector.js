import React, { useState } from 'react';
import { Field, Label } from 'catalyst/fieldset';
import { Select } from 'catalyst/select';
import { useGetStationsQuery } from './skydropApiSlice';

export const StationSelector = ({ station, setStation }) => {
  const { data: stations } = useGetStationsQuery();

  return stations ? (
    <Field>
      <Label>Select a Station to Add to Chart</Label>
      <Select
        name='status'
        defaultValue={station}
        onChange={(e) => setStation(e.target.value)}
      >
        <option value={null}>Please select a station to see its data</option>
        {stations.map((x) => (
          <option value={x.STATION} key={x.STATION}>
            {x.NAME}
          </option>
        ))}
      </Select>
    </Field>
  ) : null;
};
