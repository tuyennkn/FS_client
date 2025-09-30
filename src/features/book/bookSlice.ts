import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Book } from '../../types/user';
import { apiService } from '@/services/apiService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { ApiResponse } from '@/types';

export interface BookState {
  books: Book[];
  selectedBook: Book | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    search: string;
    priceRange: [number, number];
    rating: number;
  };
}

const initialState: BookState = {
  books: [],
  selectedBook: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    priceRange: [0, 1000000],
    rating: 0,
  },
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Book[]> = await apiService.get(API_ENDPOINTS.BOOK.ALL);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Book> = await apiService.get(`${API_ENDPOINTS.BOOK.GET_BY_ID}/${id}`);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch book');
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        search: '',
        priceRange: [0, 1000000],
        rating: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.filter(book => !book.isDisable && book.quantity > 0);
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch book by ID
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBook = action.payload;
        state.error = null;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setSelectedBook, 
  clearSelectedBook, 
  setFilters, 
  clearFilters 
} = bookSlice.actions;
export default bookSlice.reducer;
