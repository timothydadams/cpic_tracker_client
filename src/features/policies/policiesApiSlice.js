import { api } from '../../app/api/apiSlice';

export const policyApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createPolicy: builder.mutation({
      query: (details) => ({
        url: '/policies',
        method: 'POST',
        body: { ...details },
      }),
      invalidatesTags: [
        { type: 'Policy', id: 'LIST' },
        { type: 'FocusArea', id: 'LIST' },
      ],
    }),
    updatePolicy: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/policies/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Policy', id: arg.id },
        { type: 'Policy', id: 'LIST' },
        { type: 'FocusArea', id: 'LIST' },
      ],
    }),
    deletePolicy: builder.mutation({
      query: (id) => ({
        url: `/policies/${id}`,
        method: 'DELETE',
        body: {},
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Policy', id: arg },
        { type: 'Policy', id: 'LIST' },
        { type: 'FocusArea', id: 'LIST' },
      ],
    }),
    getPolicy: builder.query({
      query: (id) => `/policies/${id}`,
      providesTags: (result, error, arg) => [{ type: 'Policy', id: arg }],
    }),
    getAllPolicies: builder.query({
      query: (params) => ({
        url: '/policies',
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Policy', id })),
              { type: 'Policy', id: 'LIST' },
            ]
          : [{ type: 'Policy', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
  useGetAllPoliciesQuery,
  useGetPolicyQuery,
} = policyApiSlice;
