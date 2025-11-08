import { api } from '../../app/api/apiSlice';

export const focusAreaApiSlice = api.injectEndpoints({
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
        method: 'DELETE',
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
        return response.data;
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
