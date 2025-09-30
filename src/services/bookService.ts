import { apiService } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { Book, BookListResponse, BookResponse, BookSearchParams, SearchResponse } from '../types/book';

export const bookService = {
    // Get all books with filters and pagination
    async getAllBooks(params?: BookSearchParams): Promise<BookListResponse> {
        const searchParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const url = queryString ? `${API_ENDPOINTS.BOOK.ALL}?${queryString}` : API_ENDPOINTS.BOOK.ALL;

        const response = await apiService.get<BookListResponse>(url);
        return response;
    },

    // Traditional search with filters using POST
    async traditionalSearch(params?: BookSearchParams): Promise<BookListResponse> {
        const response = await apiService.post<BookListResponse>(
            API_ENDPOINTS.BOOK.SEARCH_FILTERS, 
            params || {}
        );
        return response;
    },

    async getFeaturedBooks(page: number = 1, limit: number = 8): Promise<BookListResponse> {
        const response = await apiService.get<BookListResponse>(API_ENDPOINTS.BOOK.FEATURED);
        return response;
    },

    // Get book by ID
    async getBookById(id: string): Promise<Book> {
        const response = await apiService.get<BookResponse>(`${API_ENDPOINTS.BOOK.GET_BY_ID}/${id}`);
        return response.data;
    },

    // Get book by slug
    async getBookBySlug(slug: string): Promise<Book> {
        const response = await apiService.get<BookResponse>(`${API_ENDPOINTS.BOOK.GET_BY_SLUG}/${slug}`);
        return response.data;
    },

    // Search books using semantic search
    async searchBooks(query: string, limit?: number): Promise<Book[]> {
        const requestBody: { query: string; limit?: number } = { query };
        if (limit) requestBody.limit = limit;

        const response = await apiService.post<SearchResponse>(
            API_ENDPOINTS.BOOK.SEMATIC_SEARCH, 
            requestBody
        );
        return response.data;
    },
};