import { apiSlice } from '../../app/api/apiSlice';
import { logout, setCredentials, setUserData } from './authSlice';
import { userApiSlice } from '../users/usersApiSlice';
import { resetUser } from '../users/usersSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/self-sign-in',
        method: 'POST',
        body: { ...credentials },
      }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
          const id = getState().auth.id;
          const userData = await dispatch(
            userApiSlice.endpoints.getUser.initiate(id)
          ).unwrap();
          dispatch(setUserData(userData));
        } catch (e) {
          console.log(e);
        }
      },
    }),
    getGoogleURI: builder.query({
      query: ({ params }) => ({
        url: `/auth/google-url`,
        params,
      }),
    }),
    sendLogout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      //invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 1000);
        } catch (e) {
          console.log(e);
        }
      },
    }),
    refresh: builder.mutation({
      query: (duration = 'SHORT') => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { duration },
      }),
      //invalidatesTags: ['User'],
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
          const id = getState().auth.id;
          const userData = await dispatch(
            userApiSlice.endpoints.getUser.initiate(id)
          ).unwrap();
          dispatch(setUserData(userData));
        } catch (e) {
          console.log('tried to refresh', e);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSendLogoutMutation,
  useRefreshMutation,
  useGetGoogleURIQuery,
} = authApiSlice;
