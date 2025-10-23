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
    }),
    updateImplementer: builder.mutation({
      query: (data) => ({
        url: `/implementers/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
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
    }),
    getImplementer: builder.query({
      query: ({ id, params }) => ({
        url: `/implementers/${id}`,
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getAllImplementers: builder.query({
      query: ({ params }) => ({
        url: '/implementers',
        params, // RTK Query will automatically serialize this object into a query string
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
