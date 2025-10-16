import { apiSlice } from '../../app/api/apiSlice';

export const policyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPolicy: builder.mutation({
      query: (details) => ({
        url: '/policies',
        method: 'POST',
        body: { ...details },
      }),
    }),
    updatePolicy: builder.mutation({
      query: (data) => ({
        url: `/policies/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
    }),
    deletePolicy: builder.mutation({
      query: (id) => ({
        url: `/policies/${id}`,
        method: 'PUT',
        body: {},
      }),
    }),
    getPolicy: builder.query({
      query: (id) => `/policies/${id}`,
    }),
    getAllPolicies: builder.query({
      query: (params) => ({
        url: '/policies',
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
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
