import { api } from '../../app/api/apiSlice';
import { logout, setCredentials } from './authSlice';

export const authApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userDetails) => ({
        url: '/auth/register',
        method: 'POST',
        body: { ...userDetails },
      }),
    }),
    getPasskeyRegOptions: builder.mutation({
      query: (data) => ({
        url: '/auth/generate-passkey-reg-options',
        method: 'POST',
        body: { ...data },
      }),
    }),
    verifyPasskeyReg: builder.mutation({
      query: (data) => ({
        url: '/auth/passkey-reg-verification',
        method: 'POST',
        body: { ...data },
      }),
    }),
    getUserLoginOptions: builder.mutation({
      query: (email) => ({
        url: '/auth/get-auth-options',
        method: 'POST',
        body: { email },
      }),
    }),
    verifyPasskeyAuth: builder.mutation({
      query: (data) => ({
        url: '/auth/passkey-auth-verify',
        method: 'POST',
        body: { ...data },
      }),
    }),
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
        } catch (e) {
          // login error handled by UI
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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          setTimeout(() => {
            dispatch(api.util.resetApiState());
          }, 1000);
        } catch (e) {
          // logout error handled by UI
        }
      },
    }),
    refresh: builder.mutation({
      query: (duration = 'SHORT') => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { duration },
      }),
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
        } catch (e) {
          // refresh error handled by baseQueryWithReauth
        }
      },
    }),
  }),
});

export const {
  useGetPasskeyRegOptionsMutation,
  useVerifyPasskeyRegMutation,
  useVerifyPasskeyAuthMutation,
  useGetUserLoginOptionsMutation,
  useRegisterMutation,
  useLoginMutation,
  useSendLogoutMutation,
  useRefreshMutation,
  useGetGoogleURIQuery,
} = authApiSlice;
