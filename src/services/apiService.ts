import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken } from '../utils/tokenUtils';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
        setAccessToken(res.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // handle logout
      }
    }
    return Promise.reject(error);
  }
);


export const apiService = {
  get: (url: string, config?: any) => api.get(url, config),
  post: (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: (url: string, config?: any) => api.delete(url, config),
  patch: (url: string, data?: any, config?: any) => api.patch(url, data, config),
  request: (config: any) => api.request(config),
};
