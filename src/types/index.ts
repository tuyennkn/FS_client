// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
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