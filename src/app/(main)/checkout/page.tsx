'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchCart, clearCart } from '@/features/cart/cartSlice';
import { orderService } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  Smartphone,
  MapPin,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/utils/toast';
import { CreateOrderRequest } from '@/types/order';

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  // Shipping fee
  const SHIPPING_FEE = 30000; // 30,000 VND

  useEffect(() => {
    // Load cart if not already loaded
    if (!cart) {
      dispatch(fetchCart());
    }

    console.log('Current user in checkout page:', user);

    // Pre-fill user information if available
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [cart, user, dispatch]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart && cart.items.length === 0) {
      router.push('/cart');
      toast.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
    }
  }, [cart, router]);

  const handleInputChange = (field: keyof ShippingInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!shippingInfo.fullName.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!shippingInfo.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!shippingInfo.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingInfo.address.trim()) {
      errors.address = 'Địa chỉ là bắt buộc';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderRequest: CreateOrderRequest = {
        shipping_address: shippingInfo.address,
        shipping_phone_number: shippingInfo.phone,
        shipping_fee: SHIPPING_FEE,
        payment_type: paymentMethod
      };

      const order = await orderService.createOrder(orderRequest);
      
      // Clear cart after successful order
      dispatch(clearCart());
      
      setOrderSuccess(true);
      setOrderId(order.id);
      
      toast.success('Đặt hàng thành công!');
      
      // Redirect to order confirmation after 3 seconds
      setTimeout(() => {
        router.push(`/orders/${order.id}`);
      }, 3000);

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Loading state
  if (isLoading || !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order success state
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 rounded-lg p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-green-600 mb-4">
              Cảm ơn bạn đã mua hàng. Đơn hàng #{orderId} đã được tạo thành công.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Bạn sẽ được chuyển hướng đến trang đơn hàng trong giây lát...
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/orders/${orderId}`}>
                <Button>Xem chi tiết đơn hàng</Button>
              </Link>
              <Link href="/books">
                <Button variant="outline">Tiếp tục mua sắm</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h1>
          <p className="text-gray-600 mb-6">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>
          <Link href="/books">
            <Button>Khám phá sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.total_price || 0;
  const total = subtotal + SHIPPING_FEE;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Thanh toán</h1>
            <p className="text-muted-foreground">
              Hoàn tất đơn hàng của bạn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Thông tin giao hàng
                </CardTitle>
                <CardDescription>
                  Nhập thông tin để chúng tôi giao hàng đến bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange('fullName')}
                      placeholder="Nhập họ và tên"
                      className={validationErrors.fullName ? 'border-red-500' : ''}
                    />
                    {validationErrors.fullName && (
                      <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange('phone')}
                      placeholder="Nhập số điện thoại"
                      className={validationErrors.phone ? 'border-red-500' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-sm text-red-500">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange('email')}
                    placeholder="Nhập địa chỉ email"
                    className={validationErrors.email ? 'border-red-500' : ''}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange('address')}
                    placeholder="Nhập địa chỉ đầy đủ (số nhà, tên đường, phường/xã, quận/huyện, thành phố)"
                    className={validationErrors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {validationErrors.address && (
                    <p className="text-sm text-red-500">{validationErrors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="note"
                    value={shippingInfo.note}
                    onChange={handleInputChange('note')}
                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
                <CardDescription>
                  Chọn cách thức thanh toán cho đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card' | 'online')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Thanh toán khi nhận hàng</p>
                        <p className="text-sm text-muted-foreground">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Thẻ tín dụng/Ghi nợ</p>
                        <p className="text-sm text-muted-foreground">
                          Thanh toán bằng thẻ tín dụng hoặc thẻ ghi nợ
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Ví điện tử</p>
                        <p className="text-sm text-muted-foreground">
                          MoMo, ZaloPay, VNPay, v.v.
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Đơn hàng của bạn
                </CardTitle>
                <CardDescription>
                  {cart.items.length} sản phẩm trong giỏ hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-16 bg-gray-100 rounded flex-shrink-0">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {item.product?.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product?.author}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">
                            Số lượng: {item.quantity}
                          </span>
                          <span className="font-medium text-sm">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.items.length} sản phẩm)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(SHIPPING_FEE)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    `Đặt hàng • ${formatPrice(total)}`
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Bằng cách đặt hàng, bạn đồng ý với{' '}
                  <Link href="/terms" className="underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="underline">
                    Chính sách bảo mật
                  </Link>{' '}
                  của chúng tôi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}