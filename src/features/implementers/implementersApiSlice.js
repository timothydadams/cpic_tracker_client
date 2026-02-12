import { api } from '../../app/api/apiSlice';
import { convertNumericValuesToStringRecursive } from 'utils/helpers';
import { setImplementers } from './implementersSlice';

export const implementersApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createImplementer: builder.mutation({
      query: (details) => ({
        url: '/implementers',
        method: 'POST',
        body: { ...details },
      }),
      invalidatesTags: [{ type: 'Implementer', id: 'LIST' }],
    }),
    updateImplementer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/implementers/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Implementer', id: arg.id },
        { type: 'Implementer', id: 'LIST' },
      ],
    }),
    deleteImplementer: builder.mutation({
      query: (id) => ({
        url: `/implementers/${id}`,
        method: 'DELETE',
        body: {},
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'Implementer', id: arg },
        { type: 'Implementer', id: 'LIST' },
      ],
    }),
    getImplementer: builder.query({
      query: ({ id, params }) => ({
        url: `/implementers/${id}`,
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: (result, error, arg) => [
        { type: 'Implementer', id: arg.id },
      ],
    }),
    getAllImplementers: builder.query({
      query: ({ params }) => ({
        url: '/implementers',
        params,
      }),
      transformResponse: (response, meta, arg) => {
        const converted = response.data.map(
          convertNumericValuesToStringRecursive
        );
        if (arg.applyTransformation) {
          return converted.map((r) => ({
            ...r,
            label: r.name,
            value: r.id,
          }));
        }
        return converted;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Implementer', id })),
              { type: 'Implementer', id: 'LIST' },
            ]
          : [{ type: 'Implementer', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setImplementers({ data }));
        } catch (e) {
          console.log(e);
        }
      },
    }),
  }),
});

export const {
  useCreateImplementerMutation,
  useUpdateImplementerMutation,
  useDeleteImplementerMutation,
  useGetAllImplementersQuery,
  useGetImplementerQuery,
} = implementersApiSlice;
