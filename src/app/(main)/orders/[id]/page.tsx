'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { orderService } from '@/services/orderService';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Phone, 
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';

const statusConfig = {
  pending: { 
    label: 'Chờ xác nhận', 
    icon: Clock, 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Đơn hàng đang chờ được xác nhận'
  },
  confirmed: { 
    label: 'Đã xác nhận', 
    icon: CheckCircle, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Đơn hàng đã được xác nhận và đang chuẩn bị'
  },
  processing: { 
    label: 'Đang xử lý', 
    icon: Package, 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Đơn hàng đang được đóng gói'
  },
  shipping: { 
    label: 'Đang giao', 
    icon: Truck, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Đơn hàng đang trên đường giao đến bạn'
  },
  delivered: { 
    label: 'Đã giao', 
    icon: CheckCircle, 
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Đơn hàng đã được giao thành công'
  },
  cancelled: { 
    label: 'Đã hủy', 
    icon: XCircle, 
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Đơn hàng đã bị hủy'
  },
};

const paymentTypeLabels = {
  cash: 'Thanh toán khi nhận hàng',
  card: 'Thẻ tín dụng',
  online: 'Thanh toán online',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching order with ID:', orderId);
      const orderData = await orderService.getOrderById(orderId);
      console.log('Order data:', orderData);
      
      if (!orderData || !orderData.id) {
        throw new Error('Không tìm thấy dữ liệu đơn hàng');
      }
      
      setOrder(orderData);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-60" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg">
                      <Skeleton className="w-16 h-20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Có lỗi xảy ra</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={fetchOrderDetail} variant="outline">
                Thử lại
              </Button>
              <Button onClick={() => router.push('/orders')}>
                Quay lại danh sách đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order || !order.id) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-muted-foreground mb-4">
              Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button onClick={() => router.push('/orders')}>
              Quay lại danh sách đơn hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order?.status || 'pending');
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
          <p className="text-muted-foreground">#{order?.id?.slice(-8) || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={`${statusInfo.color} border px-3 py-1`}>
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusInfo.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {statusInfo.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order?.items && order.items.length > 0 ? order.items.map((item) => (
                  <div key={`${item.book_id}-${order?.id || 'unknown'}`} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-20 flex-shrink-0">
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
                          {item.book?.title || 'N/A'}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.book?.author || 'N/A'}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Số lượng: <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                          <p className="font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có sản phẩm nào trong đơn hàng này
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Shipping Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span>{order?.createdAt ? formatDate(order.createdAt) : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Thanh toán:</span>
                <span>{order?.payment_type ? (paymentTypeLabels[order.payment_type as keyof typeof paymentTypeLabels] || order.payment_type) : 'N/A'}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatPrice((order?.total_price || 0) - (order?.shipping_fee || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(order?.shipping_fee || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatPrice(order?.total_price || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ giao hàng:</p>
                  <p className="font-medium">{order?.shipping_address || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Số điện thoại:</p>
                  <p className="font-medium">{order?.shipping_phone_number || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  In đơn hàng
                </Button>
                {order?.status === 'pending' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Implement cancel order functionality
                      alert('Chức năng hủy đơn hàng sẽ được cập nhật trong tương lai');
                    }}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}