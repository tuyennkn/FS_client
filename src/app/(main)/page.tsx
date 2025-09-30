'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/BookCard';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { ShoppingBag, BookOpen, Star, TrendingUp, Users, Award } from 'lucide-react';

export default function Home() {
  const { user } = useAppSelector((state) => state.auth);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getFeaturedBooks(1, 8);
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
      </div>


      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">50,000+</h3>
              <p className="text-muted-foreground">Books in our collection</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">100,000+</h3>
              <p className="text-muted-foreground">Happy readers worldwide</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold">25 Years</h3>
              <p className="text-muted-foreground">Of literary excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-balance">
            Join our community of book lovers
          </h2>
          <p className="text-lg opacity-90 leading-relaxed">
            Get personalized recommendations, exclusive access to author events, and special member discounts on your
            favorite titles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8">
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
