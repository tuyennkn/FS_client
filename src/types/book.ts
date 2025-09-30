import { ApiResponse } from ".";

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  slug: string;
  price: number;
  rating: number;
  category?: string;
  genre?: string;
  quantity: number;
  sold: number;
  image: string[];
  isDisable: boolean;
  attributes?: {
    isbn?: string;
    publisher?: string;
    firstPublishDate?: Date;
    publishDate?: Date;
    pages?: number;
    language?: string;
    edition?: string;
    bookFormat?: string;
    characters?: string[];
    awards?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BookSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'sold';
  sortOrder?: 'asc' | 'desc';
}

export interface BookListResponse {
  data: Book[];
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }
}

export interface BookResponse {
  data: Book;
}

export interface SearchResponse extends ApiResponse<Book[]> {
  data: Book[];
}