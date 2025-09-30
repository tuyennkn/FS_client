'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@/types/book';
import { useAppDispatch } from '@/hooks/redux';
import { addToCart } from '@/features/cart/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { toast } from '@/utils/toast';

interface EnhancedBookCardProps {
  book: Book;
  viewMode?: 'grid' | 'list';
}

export const EnhancedBookCard: React.FC<EnhancedBookCardProps> = ({ book, viewMode = 'grid' }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ product_id: book.id, quantity: 1 })).unwrap();
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (viewMode === 'list') {
    return (
      <div className="relative flex flex-row rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image */}
        <div className="relative w-40 h-56 bg-gray-50 group flex-shrink-0">
          <Link href={`/books/${book.slug}`}>
            <Image
              src={book.image[0] || '/placeholder-book.jpg'}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {book.quantity === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Hết hàng
            </Badge>
          )}
          {book.sold > 50 && (
            <Badge variant="default" className="absolute top-2 left-2 bg-green-500 text-white">
              Bán chạy
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          {/* Category */}
          <div className="text-xs text-gray-500 mb-2">
            <span>{book.category || book.genre || "Sách"}</span>
          </div>

          {/* Title */}
          <Link href={`/books/${book.slug}`}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-sm text-gray-600 mb-3">Tác giả: {book.author}</p>

          {/* Description */}
          {book.description && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-3">
              {book.description}
            </p>
          )}

          {/* Book details */}
          {book.attributes && (
            <div className="text-xs text-gray-400 mb-4 space-y-1">
              {book.attributes.publisher && (
                <div>Nhà xuất bản: {book.attributes.publisher}</div>
              )}
              {book.attributes.pages && (
                <div>Số trang: {book.attributes.pages}</div>
              )}
              {book.attributes.language && (
                <div>Ngôn ngữ: {book.attributes.language}</div>
              )}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
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
            <span className="text-sm text-gray-500">
              ({book.rating.toFixed(1)})
            </span>
            <span className="text-xs text-gray-400 ml-4">
              Đã bán: {book.sold}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(book.price)}
              </span>
              {book.quantity > 0 && book.quantity < 10 && (
                <span className="text-xs text-orange-500">
                  Chỉ còn {book.quantity} cuốn
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={book.quantity === 0 || book.isDisable}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {book.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view - use original BookCard style
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
            Hết hàng
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
          {book.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedBookCard;