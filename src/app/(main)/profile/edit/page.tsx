'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { toast } from '@/utils/toast';
import { User } from '@/types/user';
import { updateUser } from '@/features/auth/authSlice';

export default function EditProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);
    const user: User | null = auth.user;
    const loading = auth.loading;

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        address: '',
        avatar: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || '',
            });
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chọn file ảnh hợp lệ');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullname.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        setIsSubmitting(true);

        try {
            const updateData = { ...formData };

            // If there's a new avatar file, we would upload it here
            // For now, we'll just use the existing avatar URL
            if (avatarFile) {
                // TODO: Implement avatar upload to Cloudinary or similar service
                console.log('Avatar file to upload:', avatarFile);
            }

            const result = await dispatch(updateUser({
                ...updateData, id: user?.id
            })).unwrap();

            if (result) {
                toast.success('Cập nhật thông tin thành công');
                router.push('/profile');
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/profile');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-300 rounded"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-300 rounded"></div>
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
                        onClick={handleCancel}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa thông tin</h1>
                        <p className="text-muted-foreground">
                            Cập nhật thông tin cá nhân của bạn
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>
                                Thông tin này sẽ được hiển thị trên profile công khai của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatarPreview} alt="Avatar preview" />
                                        <AvatarFallback className="text-lg">
                                            {formData.fullname.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Label
                                        htmlFor="avatar-upload"
                                        className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Label>
                                    <Input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Nhấp vào biểu tượng camera để thay đổi ảnh đại diện
                                    <br />
                                    Kích thước tối đa: 5MB
                                </p>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullname">
                                    Họ và tên <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="fullname"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ email"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ của bạn"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
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
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}