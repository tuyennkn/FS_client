import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '../utils/tokenUtils';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  User
} from '../types/user';
import { ApiResponse } from '@/types';

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
        clearTokens();
        console.error('Refresh token failed', err);
        if(window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
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
      API_ENDPOINTS.USER.GET_BY_ID(id)
    );
    return response.data as ApiResponse<User>;
  },

  update: async (userData: Partial<User> & { id: string }): Promise<ApiResponse<User>> => {
    const { id, ...updateData } = userData;
    const response = await api.put(
      API_ENDPOINTS.USER.UPDATE(id),
      updateData
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

// ApiService with generic methods
export const apiService = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    const res = await api.get<T>(url, config);
    return res.data;
  },
  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await api.post<T>(url, data, config);
    return res.data;
  },
  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await api.put<T>(url, data, config);
    return res.data;
  },
  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await api.patch<T>(url, data, config);
    return res.data;
  },
  delete: async <T>(url: string, config?: any): Promise<T> => {
    const res = await api.delete<T>(url, config);
    return res.data;
  },
  uploadFile: async <T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: any
  ): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      },
    });

    return res.data;
  },
};
