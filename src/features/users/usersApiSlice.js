import { api } from '../../app/api/apiSlice';

export const userApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    update: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: { ...userData },
      }),
    }),
    getAllUsers: builder.query({
      query: () => `/users`,
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getRoles: builder.query({
      query: () => `/roles`,
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    addRoleToUser: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/role`,
        method: 'POST',
        body: { roleId },
      }),
    }),
    removeRoleFromUser: builder.mutation({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/role`,
        method: 'DELETE',
        body: { roleId },
      }),
    }),
    removePasskeyFromUser: builder.mutation({
      query: ({ userId, pk_id }) => ({
        url: `/users/${userId}/passkey`,
        method: 'DELETE',
        body: { pk_id },
      }),
    }),
    getUserRoles: builder.query({
      query: (id) => `/users/${id}/roles`,
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getUser: builder.query({
      query: ({ id, params }) => ({
        url: `/users/${id}`,
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useRemovePasskeyFromUserMutation,
  useUpdateMutation,
  useGetUserQuery,
  useGetAllUsersQuery,
  useGetRolesQuery,
  useGetUserRolesQuery,
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} = userApiSlice;
