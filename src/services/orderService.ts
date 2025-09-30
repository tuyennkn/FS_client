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
    const response = await apiService.post<Order>(
      API_ENDPOINTS.ORDER.CREATE,
      request
    );
    return response;
  },

  // Create order directly (without cart)
  async createDirectOrder(request: CreateDirectOrderRequest): Promise<Order> {
    const response = await apiService.post<Order>(
      API_ENDPOINTS.ORDER.CREATE_DIRECT,
      request
    );
    return response;
  },

  // Get user's orders
  async getUserOrders(page: number = 1, limit: number = 10): Promise<OrderListResponse> {
    const response = await apiService.get<OrderListResponse>(
      `${API_ENDPOINTS.ORDER.MY_ORDERS}?page=${page}&limit=${limit}`
    );
    return response;
  },

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<Order>(
      `${API_ENDPOINTS.ORDER.GET_BY_ID}/${id}`
    );
    return response;
  },
};