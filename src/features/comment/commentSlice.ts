import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../../types/user';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { apiService } from '@/services/apiService';
import { ApiResponse } from '@/types';

export interface CommentState {
  comments: Comment[];
  bookComments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  bookComments: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Comment[]> = await apiService.get(API_ENDPOINTS.COMMENT.ALL);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const fetchCommentsByBook = createAsyncThunk(
  'comments/fetchByBook',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Comment[]> = await apiService.get(API_ENDPOINTS.COMMENT.GET_BY_BOOK(bookId));
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch book comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async (commentData: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Comment> = await apiService.post(API_ENDPOINTS.COMMENT.CREATE, commentData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ id, data }: { id: string; data: UpdateCommentRequest }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Comment> = await apiService.put(API_ENDPOINTS.COMMENT.UPDATE(id), data);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<any> = await apiService.delete(API_ENDPOINTS.COMMENT.DELETE(id));
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBookComments: (state) => {
      state.bookComments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch comments by book
      .addCase(fetchCommentsByBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByBook.fulfilled, (state, action) => {
        state.loading = false;
        state.bookComments = action.payload;
        state.error = null;
      })
      .addCase(fetchCommentsByBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
        state.bookComments.push(action.payload);
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const commentIndex = state.comments.findIndex(c => c.id === action.payload.id);
        if (commentIndex !== -1) {
          state.comments[commentIndex] = action.payload;
        }
        const bookCommentIndex = state.bookComments.findIndex(c => c.id === action.payload.id);
        if (bookCommentIndex !== -1) {
          state.bookComments[bookCommentIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(c => c.id !== action.payload);
        state.bookComments = state.bookComments.filter(c => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBookComments } = commentSlice.actions;
export default commentSlice.reducer;
