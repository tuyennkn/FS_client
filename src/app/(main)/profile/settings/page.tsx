'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bell, Shield, Eye, Globe } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import { toast } from '@/utils/toast';

export default function ProfileSettingsPage() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        promotionalEmails: true,
        orderUpdates: true,
        newBooks: false,
        privacy: 'public', // public, friends, private
        language: 'vi',
        showEmail: false,
        showPhone: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSwitchChange = (key: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSelectChange = (key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Implement settings update API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
            toast.success('Cài đặt đã được lưu thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu cài đặt');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push('/profile');
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto text-center">
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
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cài đặt tài khoản</h1>
                        <p className="text-muted-foreground">
                            Quản lý cài đặt và tùy chọn của bạn
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Thông báo
                            </CardTitle>
                            <CardDescription>
                                Chọn cách bạn muốn nhận thông báo về đơn hàng và sản phẩm mới
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email thông báo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận thông báo qua email về hoạt động tài khoản
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(value) => handleSwitchChange('emailNotifications', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">SMS thông báo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận thông báo qua SMS về đơn hàng quan trọng
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.smsNotifications}
                                    onCheckedChange={(value) => handleSwitchChange('smsNotifications', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email khuyến mãi</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận email về các chương trình khuyến mãi và ưu đãi
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.promotionalEmails}
                                    onCheckedChange={(value) => handleSwitchChange('promotionalEmails', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Cập nhật đơn hàng</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thông báo về trạng thái đơn hàng và vận chuyển
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.orderUpdates}
                                    onCheckedChange={(value) => handleSwitchChange('orderUpdates', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Sách mới</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thông báo về sách mới và sách được đề xuất
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.newBooks}
                                    onCheckedChange={(value) => handleSwitchChange('newBooks', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Quyền riêng tư
                            </CardTitle>
                            <CardDescription>
                                Kiểm soát ai có thể xem thông tin của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Hiển thị profile</Label>
                                <Select
                                    value={settings.privacy}
                                    onValueChange={(value) => handleSelectChange('privacy', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn mức độ riêng tư" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Công khai</SelectItem>
                                        <SelectItem value="friends">Chỉ bạn bè</SelectItem>
                                        <SelectItem value="private">Riêng tư</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Công khai: Mọi người có thể xem profile của bạn
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Hiển thị email</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cho phép người khác xem địa chỉ email của bạn
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.showEmail}
                                    onCheckedChange={(value) => handleSwitchChange('showEmail', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Hiển thị số điện thoại</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cho phép người khác xem số điện thoại của bạn
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.showPhone}
                                    onCheckedChange={(value) => handleSwitchChange('showPhone', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Cài đặt chung
                            </CardTitle>
                            <CardDescription>
                                Tùy chỉnh trải nghiệm sử dụng của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Ngôn ngữ</Label>
                                <Select
                                    value={settings.language}
                                    onValueChange={(value) => handleSelectChange('language', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn ngôn ngữ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                'Lưu cài đặt'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}