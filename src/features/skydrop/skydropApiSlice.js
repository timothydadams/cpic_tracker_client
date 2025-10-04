import { apiSlice } from '../../app/api/apiSlice';
import { DateTime } from 'luxon';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSkydropMeta: builder.query({
      query: () => `/skydrop/meta`,
      transformResponse: (response, meta, arg) => {
        const { data } = response;
        const temps = data.map((i) => {
          if (
            (!i['AmbientTemperatureFahrenheit'] && !i['CreateDate']) ||
            i['Error']
          ) {
            return false;
          } else {
            const tmp = Number(i['AmbientTemperatureFahrenheit'].split(' ')[0]);
            let [date, time] = i['CreateDate'].split(' ');
            date = date.replace(/[:]/g, '-');
            i['rawTempF'] = tmp;
            i['isoString'] = `${date}T${time}.000-04:00`;
            i['luxon_dtg'] = DateTime.fromISO(i['isoString'], {
              setZone: true,
            }).toLocaleString(DateTime.DATE_FULL);

            return i;
          }
        });
        const sorted = temps.filter(Boolean).sort(function (a, b) {
          return a['isoString'] < b['isoString']
            ? -1
            : a['isoString'] > b['isoString']
              ? 1
              : 0;
        });

        return sorted;
      },
    }),
    getStations: builder.query({
      query: () => `/skydrop/stations`,
      transformResponse: (response, meta, arg) => {
        const { data } = response;
        return data.map((s) => {
          let tmp = s['CALL_SIGN'];
          s['callSign'] = tmp;
          return s;
        });
      },
    }),
    getStationData: builder.query({
      query: ({ id, callSign }) => ({
        url: `/skydrop/station`,
        method: 'POST',
        body: { id, callSign },
      }),
      transformResponse: (response, meta, arg) => {
        const { data } = response;
        const notNull = data.filter((x) => x.temp !== null);
        const dataWithDates = notNull.map((x) => {
          x['luxon_dtg'] = DateTime.fromSeconds(x.obsTime, {
            zone: 'utc',
          }).toISO();
          return x;
        });

        const sorted = dataWithDates.sort(function (a, b) {
          return a['obsTime'] < b['obsTime']
            ? -1
            : a['obsTime'] > b['obsTime']
              ? 1
              : 0;
        });
        return sorted;
      },
    }),
  }),
});

export const {
  useGetSkydropMetaQuery,
  useGetStationDataQuery,
  useGetStationsQuery,
} = userApiSlice;
