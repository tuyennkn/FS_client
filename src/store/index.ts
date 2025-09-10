import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';
import categoryReducer from '../features/category/categorySlice';
import bookReducer from '../features/book/bookSlice';
import commentReducer from '../features/comment/commentSlice';
import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    categories: categoryReducer,
    books: bookReducer,
    comments: commentReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
