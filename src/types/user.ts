import { BaseEntity } from ".";
import { Category } from "./category";


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

// Book attributes
export interface BookAttributes {
  isbn?: string;
  publisher?: string;
  firstPublishDate?: string;
  publishDate?: string;
  pages?: number;
  language?: string;
  edition?: string;
  bookFormat?: string;
  characters?: string[];
  awards?: string[];
}

// Book types
export interface Book extends BaseEntity {
  title: string;
  author: string;
  description: string; // Changed from summary
  slug: string; // New required field
  publisher?: string; // Keep for backward compatibility, moved to attributes
  price: number;
  rating: number;
  category: Category | string | null;
  genre: string; // New field
  embedding?: number[]; // Changed from summaryvector
  quantity: number;
  sold: number;
  isDisable: boolean;
  image?: string[]; // Changed from imageUrl to array
  score?: number; // For search results
  attributes?: BookAttributes; // New attributes object
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


