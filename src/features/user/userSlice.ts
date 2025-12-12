import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';
import { apiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const retrieveUser = createAsyncThunk(
  'user/retrieveUser',
  async (_: void, { rejectWithValue }) => {
    try {
      const response: any = await apiService.get(API_ENDPOINTS.AUTH.ME);
      
      if (response.data) {
        return response.data as User;
      } else {
        return rejectWithValue('Failed to fetch user data');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(retrieveUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retrieveUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(retrieveUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
