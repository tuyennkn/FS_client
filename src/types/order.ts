export interface OrderItem {
  book_id: string;
  book?: {
    id: string;
    title: string;
    author: string;
    image?: string;
    slug: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  shipping_fee: number;
  shipping_address: string;
  shipping_phone_number: string;
  payment_type: 'cash' | 'card' | 'online';
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  shipping_address: string;
  shipping_phone_number: string;
  shipping_fee?: number;
  payment_type?: 'cash' | 'card' | 'online';
}

export interface CreateDirectOrderRequest {
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total_price: number;
  shipping_address: string;
  shipping_phone_number: string;
  shipping_fee?: number;
  payment_type?: 'cash' | 'card' | 'online';
}

export interface OrderListResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}