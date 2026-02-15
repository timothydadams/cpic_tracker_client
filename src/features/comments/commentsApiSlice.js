import { api } from '../../app/api/apiSlice';

export const commentApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: (details) => ({
        url: '/comments',
        method: 'POST',
        body: { ...details },
      }),
      invalidatesTags: [{ type: 'Comment', id: 'LIST' }],
    }),
    updateComment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/comments/${id}`,
        method: 'PUT',
        body: { ...data },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Comment', id: arg.id },
        { type: 'Comment', id: 'LIST' },
      ],
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
      invalidatesTags: (result, error, arg) => [
        { type: 'Comment', id: arg },
        { type: 'Comment', id: 'LIST' },
      ],
    }),
    getComment: builder.query({
      query: ({ id, params }) => ({
        url: `/comments/${id}`,
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: (result, error, arg) => [{ type: 'Comment', id: arg.id }],
    }),
    getAllComments: builder.query({
      query: (params) => ({
        url: '/comments',
        params, // RTK Query will automatically serialize this object into a query string
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Comment', id })),
              { type: 'Comment', id: 'LIST' },
            ]
          : [{ type: 'Comment', id: 'LIST' }],
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
