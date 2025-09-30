import { apiService } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Cart, AddToCartRequest, UpdateCartItemRequest, CartResponse } from '../types/cart';

export const cartService = {
  // Get user's cart
  async getCart(): Promise<Cart> {
    const response = await apiService.get<CartResponse>(API_ENDPOINTS.CART.GET);
    return response.data;
  },

  // Add item to cart
  async addToCart(request: AddToCartRequest): Promise<Cart> {
    const response = await apiService.post<CartResponse>(
      API_ENDPOINTS.CART.ADD,
      request
    );
    return response.data;
  },

  // Update item quantity in cart
  async updateCartItem(request: UpdateCartItemRequest): Promise<Cart> {
    const response = await apiService.put<CartResponse>(
      API_ENDPOINTS.CART.UPDATE,
      request
    );
    return response.data;
  },

  // Remove item from cart
  async removeFromCart(productId: string): Promise<Cart> {
    const response: CartResponse = await apiService.delete(
      `${API_ENDPOINTS.CART.REMOVE}/${productId}`
    );
    return response.data;
  },

  // Clear cart
  async clearCart(): Promise<Cart> {
    const response = await apiService.delete<CartResponse>(API_ENDPOINTS.CART.CLEAR);
    return response.data;
  },
};