import { apiSlice } from '../../app/api/apiSlice';

export const focusAreaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFocusArea: builder.mutation({
      query: (details) => ({
        url: '/focusareas',
        method: 'POST',
        body: { ...details },
      }),
    }),
    updateFocusArea: builder.mutation({
      query: (data) => ({
        url: `/focusareas/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
    }),
    deleteFocusArea: builder.mutation({
      query: (id) => ({
        url: `/focusareas/${id}`,
        method: 'PUT',
        body: {},
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getFocusArea: builder.query({
      query: ({ id, params }) => ({
        url: `/focusareas/${id}`,
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        const result = response.data;
        const { policies, ...rest } = result;
        let tmp = [...policies].sort(
          (a, b) => a['policy_number'] - b['policy_number']
        );
        result.policies = tmp;
        return { policies: tmp, ...rest };
      },
    }),
    getAllFocusAreas: builder.query({
      query: (params) => ({
        url: '/focusareas',
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useCreateFocusAreaMutation,
  useUpdateFocusAreaMutation,
  useDeleteFocusAreaMutation,
  useGetAllFocusAreasQuery,
  useGetFocusAreaQuery,
} = focusAreaApiSlice;
