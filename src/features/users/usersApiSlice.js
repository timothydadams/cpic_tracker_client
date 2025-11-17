import { api } from '../../app/api/apiSlice';
//import { logout, setCredentials } from "../auth/authSlice";
import { setUserDetails } from './usersSlice';

export const userApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    update: builder.mutation({
      query: (user) => ({
        url: `/users/${user.id}`,
        method: 'PUT',
        body: { ...user },
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
    getUserRoles: builder.query({
      query: (id) => `/users/${id}/roles`,
      transformResponse: (response, meta, arg) => {
        return response.data.map(({ createdAt, role }) => {
          return {
            ...role,
            createdAt,
          };
        });
      },
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
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
  useUpdateMutation,
  useGetUserQuery,
  useGetAllUsersQuery,
  useGetRolesQuery,
  useGetUserRolesQuery,
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} = userApiSlice;
