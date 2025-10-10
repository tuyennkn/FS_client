import { apiService } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { 
  Order, 
  OrderListResponse, 
  CreateOrderRequest, 
  CreateDirectOrderRequest 
} from '../types/order';

export const orderService = {
  // Create order from cart
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const response = await apiService.post<any>(
      API_ENDPOINTS.ORDER.CREATE,
      request
    );
    return response.data || response;
  },

  // Create order directly (without cart)
  async createDirectOrder(request: CreateDirectOrderRequest): Promise<Order> {
    const response = await apiService.post<any>(
      API_ENDPOINTS.ORDER.CREATE_DIRECT,
      request
    );
    return response.data || response;
  },

  // Get user's orders
  async getUserOrders(page: number = 1, limit: number = 10): Promise<OrderListResponse> {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.ORDER.MY_ORDERS}?page=${page}&limit=${limit}`
    );
    
    // Transform backend response to frontend expected format
    if (response.data && response.meta?.pagination) {
      return {
        data: response.data,
        pagination: {
          page: response.meta.pagination.currentPage,
          limit: response.meta.pagination.itemsPerPage,
          total: response.meta.pagination.totalItems,
          totalPages: response.meta.pagination.totalPages,
        }
      };
    }
    
    // Fallback for direct response
    return response.data || response;
  },

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.ORDER.GET_BY_ID}/${id}`
    );
    // The backend returns { success: true, data: Order, message: string }
    return response.data || response;
  },
};