import { apiSlice } from '../../app/api/apiSlice';

export const strategyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createStrategy: builder.mutation({
      query: (details) => ({
        url: '/strategies',
        method: 'POST',
        body: { ...details },
      }),
    }),
    updateStrategy: builder.mutation({
      query: (data) => ({
        url: `/strategies/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
    }),
    getStrategy: builder.query({
      query: (id) => `/strategies/${id}`,
    }),
    getAllStrategies: builder.query({
      query: () => `/strategies`,
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
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
  useGetAllStrategiesQuery,
} = strategyApiSlice;
