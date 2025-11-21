import { api } from '../../app/api/apiSlice';
//import { logout, setCredentials } from "../auth/authSlice";
import { setUserDetails } from './usersSlice';

export const userApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    update: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: { ...userData },
      }),
      //invalidatesTags: (result, error, { id }) => [{ type: 'User', id }], // Invalidate the tag
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
      //providesTags: (result, error, id) => [{ type: 'User', id }],
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      /*
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            dispatch(setUserDetails(data));
          } catch (e) {
            console.log('could not load user info',e);
          }
        },
      */
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
