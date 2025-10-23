import { api } from '../../app/api/apiSlice';
import { setStatuses } from './strategiesSlice';
import { convertNumericValuesToStringRecursive } from 'utils/helpers';

export const strategyApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createStrategy: builder.mutation({
      query: (details) => ({
        url: '/strategies',
        method: 'POST',
        body: { ...details },
      }),
    }),
    updateStrategy: builder.mutation({
      query: ({ id, data }) => ({
        url: `/strategies/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
    }),
    getStrategyComments: builder.query({
      query: ({ id, params }) => ({
        url: `/strategies/${id}/comments`,
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getStrategy: builder.query({
      query: ({ id, params }) => ({
        url: `/strategies/${id}`,
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        //add implementer details
        response.data.implementers = response.data.implementers
          .map(convertNumericValuesToStringRecursive)
          .map((i) => {
            const { implementer, ...otherDetails } = i;
            const { id, ...rest } = i.implementer;
            return {
              ...otherDetails,
              ...rest,
            };
          });

        return convertNumericValuesToStringRecursive(response.data);
      },
    }),
    getAllStrategies: builder.query({
      query: () => `/strategies`,
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getAllStatuses: builder.query({
      query: () => `/strategies/statuses`,
      transformResponse: (response, meta, arg) => {
        return response.data.map(convertNumericValuesToStringRecursive);
      },
    }),
    getAllTimelineOptions: builder.query({
      query: () => `/strategies/timeline_options`,
      transformResponse: (response, meta, arg) => {
        return response.data.map(convertNumericValuesToStringRecursive);
      },
    }),
    /*
    getAllPolicies: builder.query({
      query: () => `/strategies/policies`,
      transformResponse: (response, meta, arg) => {
        console.log(response.data);
        return response.data.map((item) => {
          console.log(item);
          return {
            value: item.description,
            label: item.description,
          }
          
        });
      },
    }), 
    getAllFocusAreas: builder.query({
      query: () => `/strategies/focusareas`,
      transformResponse: (response, meta, arg) => {
        return response.data.map(({name}) => ({
          value:name,
          label:name,
        }));
      },
    }),*/

    addImplementerToStrategy: builder.mutation({
      /*
      query: ({userId, roleId}) => ({
        url: `/users/${userId}/role`,
        method: 'POST',
        body: { roleId },
      }),
      */
    }),
    removeImplementerFromStrategy: builder.mutation({
      /*
      query: ({userId, roleId}) => ({
        url: `/users/${userId}/role`,
        method: 'DELETE',
        body: { roleId },
      }),
      */
    }),
  }),
});

export const {
  useCreateStrategyMutation,
  useUpdateStrategyMutation,
  useGetStrategyQuery,
  useGetAllStrategiesQuery,
  useGetAllStatusesQuery,
  useGetAllTimelineOptionsQuery,
  useGetStrategyCommentsQuery,
  //useGetAllFocusAreasQuery,
} = strategyApiSlice;
