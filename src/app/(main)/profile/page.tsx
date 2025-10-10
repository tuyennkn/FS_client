'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    UserIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit2,
    ShoppingBag,
    Heart,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/utils/dateUtils';
import { type User } from '@/types/user';

export default function ProfilePage() {
    const dispatch = useAppDispatch();

    const auth = useAppSelector((state) => state.auth);
    const user: User | null = auth.user;
    const [loading, setLoading] = useState(auth.loading);

    useEffect(() => {
        console.log('ProfilePage useEffect triggered', !user);
        if (user)
            setLoading(false);
    }, []);

    if (loading || status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <div className="h-64 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="h-64 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Không thể tải thông tin profile
                    </h1>
                    <Link href="/auth/login">
                        <Button>Đăng nhập</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">{user.fullname}</h1>
                    <Link href="/profile/edit">
                        <Button className="flex items-center space-x-2">
                            <Edit2 className="h-4 w-4" />
                            <span>Chỉnh sửa</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Info Card */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 border">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullname}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="h-12 w-12 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Basic Info */}
                                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                        {user.fullname}
                                    </h2>
                                    <Badge variant="secondary" className="mb-4">
                                        {user.role || 'Customer'}
                                    </Badge>

                                    {/* Stats */}
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Thành viên từ:</span>
                                            <span className="font-medium">
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/orders" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Đơn hàng của tôi
                                    </Button>
                                </Link>
                                <Link href="/wishlist" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Heart className="h-4 w-4 mr-2" />
                                        Sách yêu thích
                                    </Button>
                                </Link>
                                <Link href="/profile/settings" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Cài đặt
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <UserIcon className="h-5 w-5" />
                                    <span>Thông tin cá nhân</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Họ tên</label>
                                        <p className="font-medium">{user.fullname}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Email</label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    {user.phone && (
                                        <div>
                                            <label className="text-sm text-gray-600">Số điện thoại</label>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <p className="font-medium">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {user.address && (
                                        <div>
                                            <label className="text-sm text-gray-600">Địa chỉ</label>
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <p className="font-medium">{user.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div>
                                    <label className="text-sm text-gray-600">Ngày tham gia</label>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tóm tắt hoạt động</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">0</div>
                                        <div className="text-sm text-gray-600">Đơn hàng</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">0</div>
                                        <div className="text-sm text-gray-600">Sách đã mua</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">0</div>
                                        <div className="text-sm text-gray-600">Đánh giá</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}