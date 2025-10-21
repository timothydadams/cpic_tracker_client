import { apiSlice } from '../../app/api/apiSlice';
//import { logout, setCredentials } from "../auth/authSlice";
import { setUserDetails } from './usersSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    create: builder.mutation({
      query: (userDetails) => ({
        url: '/users',
        method: 'POST',
        body: { ...userDetails },
      }),
    }),
    update: builder.mutation({
      query: (user) => ({
        url: `/users/${user.id}`,
        method: 'PUT',
        body: { ...user },
      }),
      /*
            async onQueryStarted(arg, { dispatch, queryFulfilled}) {
                try {
                    const { data } = await queryFulfilled
                    console.log('from put api call', data);
                    //const {accessToken} = data;
                    //dispatch( setCredentials({accessToken}))
                } catch(e) {
                    console.log('inside update mutation', e);
                }
            } */
    }),
    getAllUsers: builder.query({
      query: () => `/users`,
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
      //refetchOnMountOrArgChange: true,
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
  useCreateMutation,
  useUpdateMutation,
  useGetUserQuery,
  useGetAllUsersQuery,
  useGetRolesQuery,
  useGetUserRolesQuery,
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} = userApiSlice;
