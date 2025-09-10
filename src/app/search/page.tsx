'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert } from '@/components/ui/alert';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { searchBooks, setQuery, clearSearch } from '@/features/search/searchSlice';
import { Book } from '@/types/user';

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { query, results, isLoading, error, hasSearched } = useAppSelector((state) => state.search);
  const [inputValue, setInputValue] = useState(query);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch(setQuery(inputValue.trim()));
      dispatch(searchBooks(inputValue.trim()));
    }
  };

  const handleClear = () => {
    setInputValue('');
    dispatch(clearSearch());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }

    return stars;
  };

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Books</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search by title, author, or summary..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Search
              </Button>
              {(query || hasSearched) && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Searching books...</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && hasSearched && (
            <div>
              <div className="mb-4">
                <p className="text-gray-600">
                  {results.length > 0 
                    ? `Found ${results.length} book${results.length !== 1 ? 's' : ''} for "${query}"`
                    : `No books found for "${query}"`
                  }
                </p>
              </div>

              {results.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((book: Book) => (
                    <Card key={book.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        {/* Book Image */}
                        {book.imageUrl ? (
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-48 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                          </div>
                        )}

                        {/* Book Info */}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">by {book.author}</p>
                        </div>

                        {/* Score */}
                        <div className="text-sm text-gray-600">
                          Score: {book.score}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          {renderStars(book.rating)}
                          <span className="text-sm text-gray-600 ml-2">
                            ({book.rating.toFixed(1)})
                          </span>
                        </div>

                        {/* Summary */}
                        <p className="text-gray-700 text-sm overflow-hidden" style={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical' 
                        }}>
                          {book.summary}
                        </p>

                        {/* Price and Stock */}
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-blue-600">
                            {formatPrice(book.price)}
                          </span>
                          <span className="text-sm text-gray-600">
                            Stock: {book.quantity}
                          </span>
                        </div>

                        {/* Publisher */}
                        <p className="text-xs text-gray-500">
                          Publisher: {book.publisher}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Search for books</h3>
                <p className="mt-2 text-gray-600">
                  Enter a book title, author name, or keywords to find books in our library.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
