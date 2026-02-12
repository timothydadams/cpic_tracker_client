import { apiSlice } from '../../app/api/apiSlice';
//import { logout, setCredentials } from "../auth/authSlice";

export const awcApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getKPIndex: builder.query({
      query: () => `/wx/kpindex`,
      transformResponse: (response, meta, arg) => {
        const { data, error } = response;

        if (error) return error;

        if (data) {
          let [timestamp, kp, ...rest] = data[0];
          timestamp = `${timestamp.replace(/\s/, 'T')}Z`;
          return { timestamp, kp: Number(kp).toFixed(1) };
        }
      },
      // Pick out errors and prevent nested properties in a hook or selector
      //transformErrorResponse: (response, meta, arg) => response.status,
      //providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    getForecastByCoords: builder.query({
      query: ({ longitude, latitude }) => ({
        url: '/wx/forecast',
        method: 'POST',
        body: { longitude, latitude },
      }),
      transformResponse: (response, meta, arg) => {
        const { data, error } = response;
        if (data) {
          return data.slice(0, 3);
        }
      },
      transformErrorResponse: (error) => {
        return error.data.error;
      },
    }),
    getMetarByCoords: builder.query({
      query: ({ longitude, latitude }) => ({
        url: '/wx/nearestAirports',
        method: 'POST',
        body: { longitude, latitude },
      }),
      transformResponse: (response, meta, arg) => {
        let airports = response.data;

        return airports;
      },
    }),
    /*
        update: builder.mutation({
            query: (user) => ({
                url: `/users/${user.id}`,
                method:'PUT',
                body: { ...user }
            }),
            
            async onQueryStarted(arg, { dispatch, queryFulfilled}) {
                try {
                    const { data } = await queryFulfilled
                    console.log('from put api call', data);
                    //const {accessToken} = data;
                    //dispatch( setCredentials({accessToken}))
                } catch(e) {
                    console.log('inside update mutation', e);
                }
            } 
        }),
        */
  }),
});

export const {
  useGetKPIndexQuery,
  useGetMetarByCoordsQuery,
  useGetForecastByCoordsQuery,
} = awcApiSlice;
