import { apiSlice } from '../../app/api/apiSlice';
//import { logout, setCredentials } from "../auth/authSlice";

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
      // note: an optional `queryFn` may be used in place of `query`
      query: (id) => `/users/${id}`,
      // Pick out data and prevent nested properties in a hook or selector
      transformResponse: (response, meta, arg) => {
        console.log('response in transform:', response);
        if (response?.user?.profile == null) {
          //const user = {...response}
          response.user.profile = {
            firstName: '',
            lastName: '',
            bio: '',
          };
          //return user;
        }
        return response.user;
      },
      // Pick out errors and prevent nested properties in a hook or selector
      //transformErrorResponse: (response, meta, arg) => response.status,
      //providesTags: (result, error, id) => [{ type: 'Post', id }],
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
