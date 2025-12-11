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

    // Search books using semantic search with conversational support
    async searchBooks(query: string, limit?: number, conversationHistory?: any[]): Promise<any> {
        const requestBody: any = { query };
        if (limit) requestBody.limit = limit;
        if (conversationHistory && conversationHistory.length > 0) {
            requestBody.conversationHistory = conversationHistory;
        }

        const response = await apiService.post<any>(
            API_ENDPOINTS.BOOK.SEMATIC_SEARCH, 
            requestBody
        );
        
        // Return full response to handle needsClarification
        return response;
    },

    // Get recommended books (persona-based for logged-in users, newest for guests)
    async getRecommendedBooks(limit: number = 9): Promise<BookListResponse> {
        const url = `${API_ENDPOINTS.BOOK.RECOMMENDED}?limit=${limit}`;
        const response = await apiService.get<BookListResponse>(url);
        return response;
    },

    // Get related books (similar books based on title + genre)
    async getRelatedBooks(bookId: string, limit: number = 5): Promise<BookListResponse> {
        const url = `${API_ENDPOINTS.BOOK.GET_RELATED(bookId)}?limit=${limit}`;
        const response = await apiService.get<BookListResponse>(url);
        return response;
    },

    // Get persona-based recommendation note for a book
    async getBookPersonaNote(slug: string): Promise<{ level: 'warning' | 'explore' | 'highly-recommend', reason: string }> {
        const response = await apiService.get<{ data: { level: 'warning' | 'explore' | 'highly-recommend', reason: string } }>(`${API_ENDPOINTS.BOOK.GET_BY_SLUG}/${slug}/persona-note`);
        return response.data;
    },
};