// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User extends BaseEntity {
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  avatar?: string;
  persona?: string;
  address?: string;
  role: 'admin' | 'user';
  isDisable: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  avatar?: string;
  persona?: string;
  address?: string;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  description: string;
  isDisable: boolean;
}

// Book types
export interface Book extends BaseEntity {
  title: string;
  author: string;
  summary: string;
  publisher: string;
  price: number;
  rating: number;
  category_id: Category | string | null;
  summaryvector?: string;
  quantity: number;
  sold: number;
  isDisable: boolean;
  imageUrl?: string;
  score?: number; // For search results
}

// Comment types
export interface Comment extends BaseEntity {
  user_id: User | string;
  book_id: Book | string;
  rating: number;
  content: string;
}

export interface CreateCommentRequest {
  book_id: string;
  rating: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  statusCode: number;
}
