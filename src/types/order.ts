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
  payment_type: 'cash' | 'card' | 'online';
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrderRequest {
  payment_type?: 'cash' | 'card' | 'online';
}

export interface CreateDirectOrderRequest {
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total_price: number;
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