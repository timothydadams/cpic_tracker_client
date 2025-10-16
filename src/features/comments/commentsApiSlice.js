import { apiSlice } from '../../app/api/apiSlice';

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: (details) => ({
        url: '/comments',
        method: 'POST',
        body: { ...details },
      }),
    }),
    updateComment: builder.mutation({
      query: (data) => ({
        url: `/comments/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
        body: {},
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getComment: builder.query({
      query: ({ id, params }) => ({
        url: `/comments/${id}`,
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getAllComments: builder.query({
      query: (params) => ({
        url: '/comments',
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetAllCommentsQuery,
  useGetCommentQuery,
} = commentApiSlice;
