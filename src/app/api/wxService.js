import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.checkwx.com',
  prepareHeaders: (headers) => {
    headers.set('X-Api-Key', process.env.WX_API_KEY);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const wxSlice = createApi({
  baseQuery,
  reducerPath: 'wxSlice',
  endpoints: (builder) => ({
    getMetarByICAO: builder.query({
      query: (id) => ({
        url: `/metar/${id}/decoded`,
        method: 'GET',
        //responseHandler: async (response) => {
        //    let res = await response.json()
        //    console.log('wx response', res.data);
        //    return response.data
        //},
      }),
      transformResponse: (response, meta, arg) => {
        console.log('wx response in transform:', response);
        return response.data || [];
      },
    }),
    getMetarByCoords: builder.query({
      query: ({ latitude, longitude }) => ({
        url: `/metar/lat/${latitude}/lon/${longitude}/decoded`,
        method: 'GET',
        //responseHandler: async (response) => {
        //    let res = await response.json()
        //    console.log('wx response', res.data);
        //    return response.data
        //},
      }),
      transformResponse: (response, meta, arg) => {
        console.log('wx response in transform:', response);
        return response.data || [];
      },
    }),
  }),
});

export const { useGetMetarByICAOQuery, useGetMetarByCoordsQuery } = wxSlice;
