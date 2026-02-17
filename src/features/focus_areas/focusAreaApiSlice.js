import { api } from '../../app/api/apiSlice';

export const focusAreaApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createFocusArea: builder.mutation({
      query: (details) => ({
        url: '/focusareas',
        method: 'POST',
        body: { ...details },
      }),
      invalidatesTags: [{ type: 'FocusArea', id: 'LIST' }],
    }),
    updateFocusArea: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/focusareas/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'FocusArea', id: arg.id },
        { type: 'FocusArea', id: 'LIST' },
      ],
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
      invalidatesTags: (result, error, arg) => [
        { type: 'FocusArea', id: arg },
        { type: 'FocusArea', id: 'LIST' },
      ],
    }),
    getFocusArea: builder.query({
      query: ({ id, params }) => ({
        url: `/focusareas/${id}`,
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: (result, error, arg) => [{ type: 'FocusArea', id: arg.id }],
    }),
    getAllFocusAreas: builder.query({
      query: (params) => ({
        url: '/focusareas',
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'FocusArea', id })),
              { type: 'FocusArea', id: 'LIST' },
            ]
          : [{ type: 'FocusArea', id: 'LIST' }],
      keepUnusedDataFor: 600,
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
