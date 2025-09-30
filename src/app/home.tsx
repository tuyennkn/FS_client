'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/BookCard';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { ShoppingBag, BookOpen, Star, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getAllBooks({ 
          limit: 8, 
          sortBy: 'rating',
          sortOrder: 'desc' 
        });
        setFeaturedBooks(response.data);
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Discover Your Next Great Read
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our curated collection of books from bestsellers to hidden gems. 
            Find the perfect book for every mood and moment.
          </p>
          
          {user ? (
            <div className="flex gap-4 justify-center">
              <Link href="/books">
                <Button size="lg" className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Books
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" size="lg" className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  View Cart
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">Create Account</Button>
              </Link>
            </div>
          )}
        </section>

        {/* Featured Books Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Books
              </h2>
              <p className="text-gray-600">
                Discover our top-rated and bestselling books
              </p>
            </div>
            <Link href="/books">
              <Button variant="outline">
                View All Books
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Our Bookstore?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">
                Discover thousands of books across all genres and categories
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                All books are carefully selected and reviewed for quality
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing with regular discounts and promotions
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}