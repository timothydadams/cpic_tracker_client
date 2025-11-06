import { api } from '../../app/api/apiSlice';

export const inviteApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    validateCode: builder.query({
      query: (code) => `/invites/${code}/validate`,
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    createCode: builder.mutation({
      query: (data) => ({
        url: '/invites',
        method: 'POST',
        body: { ...data },
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    updateCode: builder.mutation({
      query: (data) => ({
        url: `/invites/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    deleteCode: builder.mutation({
      query: (id) => ({
        url: `/invites/${id}`,
        method: 'DELETE',
        body: {},
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getMyCodes: builder.query({
      query: () => ({
        url: `/invites/my-codes`,
        method: 'GET',
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getMyInvites: builder.query({
      query: () => ({
        url: `/invites/my-invites`,
        method: 'GET',
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getCodeStats: builder.query({
      query: (code) => ({
        url: `/invites/${code}/stats`,
        method: 'GET',
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useValidateCodeQuery,
  useGetMyCodesQuery,
  useGetMyInvitesQuery,
  useGetCodeStatsQuery,
  useCreateCodeMutation,
} = inviteApiSlice;
