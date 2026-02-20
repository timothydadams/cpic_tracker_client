import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../../features/auth/authSlice';

const base_url =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:3500'
    : process.env.API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: `${base_url}/api`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise = null;

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const duration = localStorage.getItem('persist') || 'SHORT';
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST', body: { duration } },
          api,
          extraOptions
        );

        if (refreshResult?.data) {
          api.dispatch(setCredentials({ ...refreshResult.data }));
          return { success: true };
        } else {
          if (refreshResult?.error?.status === 401) {
            refreshResult.error.data.message = 'Expired login';
          }
          api.dispatch(logout());
          return { success: false, result: refreshResult };
        }
      })().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshOutcome = await refreshPromise;

    if (refreshOutcome.success) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      return refreshOutcome.result;
    }
  }
  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  //refetchOnFocus: true,
  tagTypes: [
    'FocusArea',
    'Policy',
    'Implementer',
    'Strategy',
    'Comment',
    'Invite',
    'FeatureFlag',
    'ScorecardConfig',
  ],
  endpoints: (builder) => ({}),
});
