'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserOrders } from '../features/order/orderSlice';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LoadingSpinner } from './ui/loading-spinner';
import { Package, Calendar, CreditCard } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, pagination, isLoading, error } = useAppSelector((state) => state.orders);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders({ page: 1, limit: 10 }));
    }
  }, [dispatch, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'pending':
        return 'default';
      case 'confirmed':
        return 'default';
      case 'processing':
        return 'default';
      case 'shipping':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Thanh toán khi nhận hàng';
      case 'card':
        return 'Thẻ tín dụng';
      case 'online':
        return 'Thanh toán online';
      default:
        return type;
    }
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      dispatch(fetchUserOrders({
        page: pagination.page + 1,
        limit: pagination.limit
      }));
    }
  };

  if (isLoading && (!orders || orders.length === 0)) {
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
        <Button onClick={() => dispatch(fetchUserOrders({ page: 1, limit: 10 }))} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-muted-foreground mb-4">
            Bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm để xem lịch sử đơn hàng tại đây.
          </p>
          <Link href="/books">
            <Button>Bắt đầu mua sắm</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>

      <div className="space-y-4">
        {orders && orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Đơn hàng #{order?.id?.slice(-8) || 'N/A'}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {order?.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {order?.payment_type ? getPaymentTypeLabel(order.payment_type) : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusVariant(order?.status || 'pending')}>
                    {getStatusLabel(order?.status || 'pending')}
                  </Badge>
                  <p className="text-lg font-semibold mt-1">
                    {formatPrice(order?.total_price || 0)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order?.items && order.items.map((item) => (
                  <div key={`${item.book_id}-${order?.id || 'unknown'}`} className="flex gap-3">
                    <div className="relative w-12 h-16 flex-shrink-0">
                      <Image
                        src={item.book?.image || '/placeholder-book.jpg'}
                        alt={item.book?.title || 'Book'}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/books/${item.book?.slug}`}>
                        <h4 className="font-medium hover:text-primary transition-colors line-clamp-2">
                          {item.book?.title}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.book?.author}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm">SL: {item.quantity}</span>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {order?.items?.length || 0} sản phẩm
                </span>
                <Link href={`/orders/${order?.id || ''}`}>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {pagination && pagination.page < pagination.totalPages && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Đang tải...' : 'Tải thêm đơn hàng'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;