'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { bookService } from '../services/bookService';
import { Book, BookSearchParams } from '../types/book';
import { BookCard } from './BookCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { LoadingSpinner } from './ui/loading-spinner';
import { Search, Filter } from 'lucide-react';

interface BookListProps {
  initialBooks?: Book[];
  showSearch?: boolean;
  showFilters?: boolean;
}

export const BookList: React.FC<BookListProps> = ({ 
  initialBooks = [], 
  showSearch = true, 
  showFilters = true 
}) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BookSearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchBooks = async (params: BookSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getAllBooks(params);
      setBooks(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialBooks.length === 0) {
      fetchBooks(filters);
    }
  }, []);

  const handleSearch = async () => {
    const searchParams = {
      ...filters,
      search: searchQuery,
      page: 1
    };
    setFilters(searchParams);
    await fetchBooks(searchParams);
  };

  const handleFilterChange = async (newFilters: Partial<BookSearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    await fetchBooks(updatedFilters);
  };

  const handlePageChange = async (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    await fetchBooks(updatedFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchBooks(filters)} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {showSearch && (
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books by title, author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          )}
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="sold">Best Selling</option>
              </select>
              
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
              
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) || undefined })}
              />
              
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) || undefined })}
              />
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Books Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {books.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No books found.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookList;