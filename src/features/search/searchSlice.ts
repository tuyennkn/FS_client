import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '@/types/book';
import { apiService } from '@/services/apiService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { SearchResponse } from '@/types/book';

interface SearchState {
  query: string;
  results: Book[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

const initialState: SearchState = {
  query: '',
  results: [],
  isLoading: false,
  error: null,
  hasSearched: false,
};

// Async thunks
export const searchBooks = createAsyncThunk(
  'search/searchBooks',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post<SearchResponse>(API_ENDPOINTS.BOOK.SEMATIC_SEARCH, {
        query,
      });
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
      state.hasSearched = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload as Book[];
        state.hasSearched = true;
        state.error = null;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasSearched = true;
      });
  },
});

export const { setQuery, clearSearch, clearError } = searchSlice.actions;
export default searchSlice.reducer;
