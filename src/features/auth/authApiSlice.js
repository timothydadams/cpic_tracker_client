import { api } from '../../app/api/apiSlice';
import { logout, setCredentials } from './authSlice';
import { userApiSlice } from '../users/usersApiSlice';
import { resetUser } from '../users/usersSlice';
import { jwtDecode } from 'jwt-decode';

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
      query: (userId) => ({
        url: '/auth/passkey-reg-options',
        method: 'POST',
        body: { id: userId },
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
      query: (email) => ({
        url: '/auth/passkey-auth-verify',
        method: 'POST',
        body: { email },
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
            dispatch(api.util.resetApiState());
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
      /*
      async queryFn(_arg, { signal, dispatch, getState }, _extraOptions, fetchWithBQ) {
        //hit the refresh endpoint
        try {
          const { data } = await fetchWithBQ({
            url:'/auth/refresh',
            method: 'POST',
            body: { duration: localStorage.persist || "SHORT" }
          });
          if (!data) return { error: "didnt work"}

          console.log('data from refresh endpoint', data);

          const { accessToken } = data;
          const { id } = jwtDecode(accessToken);

          console.log('data from refresh endpoint', data);

          const {data: {data:userDetails}} = await fetchWithBQ({
            url: `/users/${id}`,
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          });

          dispatch(setCredentials({accessToken, ...userDetails}))
        } catch (e) {
          return { error: "problem loading user details"}
        }
        
      },
      */
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken } = data;
          dispatch(setCredentials({ accessToken }));
          /*
          const id = getState().auth.id;
          const { id } = jwtDecode(accessToken);
          console.log('id', id);
          const userData = await dispatch(
            userApiSlice.endpoints.getUser.initiate(id)
          ).unwrap();

          console.log('userdata', userData);

          dispatch(
            setCredentials({id, accessToken, ...userData})
          );
          */
        } catch (e) {
          console.log('tried to refresh', e);
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
