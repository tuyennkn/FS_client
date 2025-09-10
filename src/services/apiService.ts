import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken } from '../utils/tokenUtils';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  User,
  Category,
  Book,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  ApiResponse
} from '../types/user';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
});

api.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }, {
          baseURL: API_ENDPOINTS.BASE_URL
        });
        const data: any = res.data;
        setAccessToken(data.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // handle logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        console.error('Refresh token failed', err);
      }
    }
    return Promise.reject(error);
  }
);

// Auth methods
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data as LoginResponse;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await api.post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response.data as ApiResponse<User>;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data as ApiResponse<User>;
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const response = await api.post(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data as ApiResponse<any>;
  },
};

// User methods (client view only)
export const userAPI = {
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.post(
      API_ENDPOINTS.USER.GET_BY_ID,
      { id }
    );
    return response.data as ApiResponse<User>;
  },

  update: async (userData: Partial<User> & { id: string }): Promise<ApiResponse<User>> => {
    const response = await api.put(
      API_ENDPOINTS.USER.UPDATE,
      userData
    );
    return response.data as ApiResponse<User>;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get(
      API_ENDPOINTS.USER.ME
    );
    return response.data as ApiResponse<User>;
  },
};

// Category methods (read-only for client)
export const categoryAPI = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get(
      API_ENDPOINTS.CATEGORY.ALL
    );
    return response.data as ApiResponse<Category[]>;
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.post(
      API_ENDPOINTS.CATEGORY.GET_BY_ID,
      { id }
    );
    return response.data as ApiResponse<Category>;
  },
};

// Book methods (read-only for client)
export const bookAPI = {
  getAll: async (): Promise<ApiResponse<Book[]>> => {
    const response = await api.get(
      API_ENDPOINTS.BOOK.ALL
    );
    return response.data as ApiResponse<Book[]>;
  },

  getById: async (id: string): Promise<ApiResponse<Book>> => {
    const response = await api.get(
      `${API_ENDPOINTS.BOOK.GET_BY_ID}/${id}`
    );
    return response.data as ApiResponse<Book>;
  },

  search: async (query: string): Promise<ApiResponse<Book[]>> => {
    const response = await api.post(
      API_ENDPOINTS.BOOK.SEMATIC_SEARCH,
      { query }
    );
    // Filter books by title, author, or summary containing the query
    const books = response.data.data || [];
    console.log(response.data)
    // const filteredBooks = books.filter((book: Book) => 
    //   book.title?.toLowerCase().includes(query.toLowerCase()) ||
    //   book.author?.toLowerCase().includes(query.toLowerCase()) ||
    //   book.summary?.toLowerCase().includes(query.toLowerCase())
    // );
    return { ...response.data } as ApiResponse<Book[]>;
  },
};

// Comment methods (full CRUD for user's own comments)
export const commentAPI = {
  getAll: async (): Promise<ApiResponse<Comment[]>> => {
    const response = await api.get(
      API_ENDPOINTS.COMMENT.ALL
    );
    return response.data as ApiResponse<Comment[]>;
  },

  getByBook: async (bookId: string): Promise<ApiResponse<Comment[]>> => {
    const response = await api.get(
      `${API_ENDPOINTS.COMMENT.GET_BY_BOOK}/${bookId}`
    );
    return response.data as ApiResponse<Comment[]>;
  },

  create: async (commentData: CreateCommentRequest): Promise<ApiResponse<Comment>> => {
    const response = await api.post(
      API_ENDPOINTS.COMMENT.CREATE,
      commentData
    );
    return response.data as ApiResponse<Comment>;
  },

  update: async (id: string, commentData: UpdateCommentRequest): Promise<ApiResponse<Comment>> => {
    const response = await api.put(
      `${API_ENDPOINTS.COMMENT.UPDATE}/${id}`,
      commentData
    );
    return response.data as ApiResponse<Comment>;
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(
      `${API_ENDPOINTS.COMMENT.DELETE}/${id}`
    );
    return response.data as ApiResponse<any>;
  },
};

export const apiService = {
  get: <T = any>(url: string, config?: any) => api.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => api.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => api.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => api.delete<T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: any) => api.patch<T>(url, data, config),
  request: <T = any>(config: any) => api.request<T>(config),
};
