'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Book } from '../types/book';
import { useAppDispatch } from '../hooks/redux';
import { addToCart } from '../features/cart/cartSlice';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Star, ShoppingCart } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ product_id: book.id, quantity: 1 })).unwrap();
      // You can add a toast notification here
      console.log('Book added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link href={`/books/${book.slug}`}>
          <Image
            src={book.image[0] || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Link>
        {book.quantity === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
        {book.sold > 50 && (
          <Badge variant="success" className="absolute top-2 left-2">
            Bestseller
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <Link href={`/books/${book.slug}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
        
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(book.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({book.rating.toFixed(1)})
          </span>
        </div>

        <div className="mt-2">
          <p className="text-lg font-bold text-primary">
            {formatPrice(book.price)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={book.quantity === 0 || book.isDisable}
          className="w-full"
          variant={book.quantity === 0 ? "outline" : "default"}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {book.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookCard;