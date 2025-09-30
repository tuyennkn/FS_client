import { ApiResponse } from '.';

export interface CartItem {
  product_id: string;
  product?: {
    id: string;
    title: string;
    author: string;
    price: number;
    image?: string;
    slug: string;
    quantity: number;
  };
  quantity: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  product_id: string;
  quantity: number;
}

export interface CartResponse extends ApiResponse<Cart>{
  data: Cart;
}