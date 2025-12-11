'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Book } from '../types/book';
import { useAppDispatch } from '../hooks/redux';
import { addToCart } from '../features/cart/cartSlice';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Star, ShoppingCart, Heart, Eye, TrendingUp, Flame, PackageX, AlertTriangle, Award } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(addToCart({ product_id: book.id, quantity: 1 })).unwrap();
      console.log('Đã thêm sách vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const isOutOfStock = book.quantity === 0 || book.isDisable;
  const isBestseller = book.sold > 50;
  const hasHighRating = book.rating >= 4.5;
  const isLowStock = book.quantity > 0 && book.quantity <= 5;

  return (
    <Card 
      className="group relative h-full overflow-hidden border-2 border-gray-100 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section with Overlay */}
      <Link href={`/books/${book.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          <Image
            src={book.image[0] || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Status Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-start z-10">
            <div className="flex flex-col gap-2">
              {isOutOfStock && (
                <Badge variant="destructive" className="shadow-lg backdrop-blur-sm bg-red-500/90 border-0">
                  Hết hàng
                </Badge>
              )}
              {isBestseller && !isOutOfStock && (
                <Badge className="shadow-lg backdrop-blur-sm bg-gradient-to-r from-orange-500 to-pink-500 border-0 animate-pulse">
                  <Flame className="w-3 h-3 mr-1" />
                  Bán chạy
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge className="shadow-lg backdrop-blur-sm bg-orange-500/90 border-0">
                  Sắp hết
                </Badge>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className={`flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              {/* <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white hover:scale-110 transition-all"
                onClick={toggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button> */}
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white hover:scale-110 transition-all"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Quick Add Button - Shows on Hover */}
          {/* {!isOutOfStock && (
            <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary/95 backdrop-blur-sm hover:bg-primary shadow-lg font-semibold"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Thêm vào giỏ
              </Button>
            </div>
          )} */}
        </div>
      </Link>
      
      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        <Link href={`/books/${book.slug}`}>
          <h3 className="font-bold text-base line-clamp-2 hover:text-primary transition-colors leading-tight min-h-[2.5rem]">
            {book.title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 line-clamp-1">{book.author}</p>
        
        {/* Rating & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(book.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {book.rating.toFixed(1)}
            </span>
          </div>
          
          {book.sold > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3" />
              <span>{book.sold} đã bán</span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {formatPrice(book.price)}
            </p>
            
          </div>
          
          {/* Stock Info */}
          {!isOutOfStock && book.quantity <= 10 && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              Chỉ còn {book.quantity} cuốn
            </p>
          )}
        </div>
      </CardContent>

      {/* Footer - Desktop Only Add to Cart */}
      <CardFooter className="p-4 pt-0 hidden sm:block border-t-0">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full font-semibold transition-all"
          variant={isOutOfStock ? "outline" : "default"}
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </CardFooter>

      {/* Shine Effect on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transition-all duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} style={{ pointerEvents: 'none' }} />
    </Card>
  );
};

export default BookCard;