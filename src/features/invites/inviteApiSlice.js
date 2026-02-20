import { api } from '../../app/api/apiSlice';

export const inviteApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    validateCode: builder.mutation({
      query: (code) => ({
        url: `/invites/${code}/validate`,
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
    }),
    createCode: builder.mutation({
      query: (data) => ({
        url: '/invites',
        method: 'POST',
        body: { ...data },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Invite', id: 'LIST' }],
    }),
    sendInvite: builder.mutation({
      query: (data) => ({
        url: '/invites/send',
        method: 'POST',
        body: { ...data },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Invite', id: 'LIST' }],
    }),
    resendInvite: builder.mutation({
      query: ({ code, ...data }) => ({
        url: `/invites/${code}/send`,
        method: 'POST',
        body: { ...data },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Invite', id: 'LIST' }],
    }),
    updateCode: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/invites/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
      transformResponse: (response) => response.data,
    }),
    deleteCode: builder.mutation({
      query: (id) => ({
        url: `/invites/${id}`,
        method: 'DELETE',
        body: {},
      }),
      transformResponse: (response) => response.data,
    }),
    getMyCodes: builder.query({
      query: ({ params }) => ({
        url: `/invites/my-codes`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Invite', id })),
              { type: 'Invite', id: 'LIST' },
            ]
          : [{ type: 'Invite', id: 'LIST' }],
    }),
    getMyInvites: builder.query({
      query: () => ({
        url: `/invites/my-invites`,
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
    }),
    getCodeStats: builder.query({
      query: (code) => ({
        url: `/invites/${code}/stats`,
        method: 'GET',
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useValidateCodeMutation,
  useGetMyCodesQuery,
  useGetMyInvitesQuery,
  useGetCodeStatsQuery,
  useCreateCodeMutation,
  useSendInviteMutation,
  useResendInviteMutation,
} = inviteApiSlice;
