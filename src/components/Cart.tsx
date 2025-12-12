'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../features/cart/cartSlice';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { LoadingSpinner } from './ui/loading-spinner';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart, isLoading, error } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartItem({ product_id: productId, quantity })).unwrap();
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    // Redirect to checkout page where shipping info will be collected
    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => dispatch(fetchCart())} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-4">
            Looks like you haven't added any books to your cart yet.
          </p>
          <Link href="/books">
            <Button>Continue Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Button
          variant="outline"
          onClick={handleClearCart}
          disabled={isLoading}
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.product_id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-24 flex-shrink-0">
                    <Image
                      src={item.product?.image || '/placeholder-book.jpg'}
                      alt={item.product?.title || 'Book'}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <Link href={`/books/${item.product?.slug}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {item.product?.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.product?.author}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                          className="w-20 text-center"
                          min="1"
                          max={item.product?.quantity || 999}
                        />
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.quantity || 0) || isLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveItem(item.product_id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {item.product?.quantity !== undefined && item.quantity > item.product.quantity && (
                      <p className="text-sm text-red-500">
                        Only {item.product.quantity} items available in stock
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Items ({cart.total_items})</span>
                <span>{formatPrice(cart.total_price)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cart.total_price)}</span>
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full"
              >
                Proceed to Checkout
              </Button>
              
              <Link href="/books">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;