import { apiService } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { User } from '../types/user';

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export const userService = {
  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiService.get<{ data: User }>(API_ENDPOINTS.USER.ME);
    return response.data;
  },

  // Update user profile
  async updateProfile(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiService.put<UpdateUserResponse>(
      API_ENDPOINTS.USER.UPDATE(userId), 
      data
    );
    return response.data;
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    const response = await apiService.get<{ data: User }>(
      API_ENDPOINTS.USER.GET_BY_ID(userId)
    );
    return response.data;
  },
};