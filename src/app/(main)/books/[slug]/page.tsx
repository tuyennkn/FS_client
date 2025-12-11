'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addToCart } from '@/features/cart/cartSlice';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BookCard } from '@/components/BookCard';
import BookComments from '@/components/BookComments';
import PersonaNote from '@/components/book/PersonaNote';
import {
    Star,
    ShoppingCart,
    ArrowLeft,
    Package,
    BookOpen,
    Calendar,
    Languages,
    Award,
    Check,
    Truck,
    Shield,
    RotateCcw,
    FileText,
    User,
    BookMarked,
    AlertCircle,
    StarIcon,
    FireExtinguisherIcon
} from 'lucide-react';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading: cartLoading } = useAppSelector((state) => state.cart);
    const { user } = useAppSelector((state) => state.auth);

    const [book, setBook] = useState<Book | null>(null);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                setError(null);
                const bookData = await bookService.getBookBySlug(params.slug as string);
                setBook(bookData);
                console.log(bookData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch book details');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchBook();
        }
    }, [params.slug]);

    // Fetch related books when book is loaded
    useEffect(() => {
        const fetchRelatedBooks = async () => {
            if (!book?.id) return;
            
            try {
                setRelatedLoading(true);
                const response = await bookService.getRelatedBooks(book.id, 6);
                setRelatedBooks(response.data);
            } catch (err) {
                console.error('Error fetching related books:', err);
            } finally {
                setRelatedLoading(false);
            }
        };

        fetchRelatedBooks();
    }, [book?.id]);

    const handleAddToCart = async () => {
        if (!book) return;

        try {
            await dispatch(addToCart({ product_id: book.id, quantity })).unwrap();
            alert('Đã thêm sách vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Không thể thêm sách vào giỏ hàng. Vui lòng thử lại.');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Không tìm thấy sách'}</p>
                    <Button onClick={() => router.back()}>Quay lại</Button>
                </div>
            </div>
        );
    }

    const inStock = book.quantity > 0 && !book.isDisable;
    const isLowStock = book.quantity > 0 && book.quantity <= 5;
    const isBestseller = book.sold > 50;
    const hasHighRating = book.rating >= 4.5;

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">
                        Trang chủ
                    </button>
                    <span>/</span>
                    <button onClick={() => router.push('/books')} className="hover:text-primary transition-colors">
                        Sách
                    </button>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{book.title}</span>
                </div>

                {/* Main Content - New Dynamic Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - Image Gallery */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            {/* Main Image with Badges */}
                            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl group">
                                <Image
                                    src={book.image[selectedImage] || '/placeholder-book.jpg'}
                                    alt={book.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Floating Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                    {!inStock && (
                                        <Badge variant="destructive" className="shadow-lg backdrop-blur-sm bg-red-500/90">
                                            Out of Stock
                                        </Badge>
                                    )}
                                    {isBestseller && inStock && (
                                        <Badge className="shadow-lg backdrop-blur-sm bg-gradient-to-r from-orange-500 to-pink-500 border-0 animate-pulse">
                                            <FireExtinguisherIcon className="inline-block w-5 h-5 mr-1" /> Bestseller
                                        </Badge>
                                    )}
                                    {hasHighRating && (
                                        <Badge className="shadow-lg backdrop-blur-sm bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0 ml-auto">
                                            <StarIcon className="inline-block w-5 h-5 mr-1" /> {book.rating.toFixed(1)}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {book.image.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {book.image.slice(0, 4).map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all transform hover:scale-105 ${
                                                selectedImage === index
                                                    ? 'border-primary ring-4 ring-primary/30 shadow-lg'
                                                    : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${book.title} ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Stats Card */}
                            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-primary">{book.sold}</div>
                                            <div className="text-xs text-gray-600">Đã bán</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-primary">{book.rating.toFixed(1)}</div>
                                            <div className="text-xs text-gray-600">Đánh giá</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Middle & Right Column - Combined Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Persona-based Recommendation Note */}
                        <PersonaNote bookSlug={params.slug as string} />

                        {/* Header Section with Purchase Box */}
                        <Card className="border-2 shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Left: Title & Info */}
                                    <div className="flex-1 space-y-4">
                                        {/* Title */}
                                        <div>
                                            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                                {book.title}
                                            </h1>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 text-lg">
                                                    <User className="h-5 w-5 text-primary" />
                                                    <span className="text-primary hover:underline cursor-pointer font-semibold">
                                                        {book.author}
                                                    </span>
                                                </div>
                                                {book.genre && (
                                                    <>
                                                        <Separator orientation="vertical" className="h-6" />
                                                        <Badge variant="outline" className="text-sm">
                                                            {book.genre}
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Rating & Stats Bar */}
                                        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-5 h-5 ${
                                                                i < Math.floor(book.rating)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-bold text-gray-900 text-lg">
                                                    {book.rating.toFixed(1)}
                                                </span>
                                            </div>
                                            <Separator orientation="vertical" className="h-6" />
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Package className="h-4 w-4" />
                                                <span className="font-medium">{book.sold} đã bán</span>
                                            </div>
                                            {inStock && (
                                                <>
                                                    <Separator orientation="vertical" className="h-6" />
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <Check className="h-4 w-4" />
                                                        <span className="font-medium">Còn hàng</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Purchase Box */}
                                    <div className="lg:w-80">
                                        <Card className="border-2 border-primary shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
                                            <CardContent className="p-6 space-y-4">
                                                {/* Price */}
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Giá</div>
                                                    <div className="text-3xl font-bold text-primary mb-2">
                                                        {formatPrice(book.price)}
                                                    </div>
                                                    { isLowStock && inStock && (
                                                        <div className="text-orange-600 text-sm font-medium flex items-center gap-1 animate-pulse">
                                                            <AlertCircle className="h-4 w-4" />
                                                            Chỉ còn {book.quantity} cuốn!
                                                        </div>
                                                    )}
                                                </div>

                                                {inStock && (
                                                    <>
                                                        <Separator />
                                                        
                                                        {/* Quantity Selector */}
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                                Số lượng
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                                    disabled={quantity <= 1}
                                                                    className="h-10 w-10"
                                                                >
                                                                    -
                                                                </Button>
                                                                <input
                                                                    type="number"
                                                                    value={quantity}
                                                                    onChange={(e) =>
                                                                        setQuantity(
                                                                            Math.max(
                                                                                1,
                                                                                Math.min(
                                                                                    book.quantity,
                                                                                    parseInt(e.target.value) || 1
                                                                                )
                                                                            )
                                                                        )
                                                                    }
                                                                    className="flex-1 h-10 px-3 text-center border-2 rounded-lg font-semibold"
                                                                    min="1"
                                                                    max={book.quantity}
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        setQuantity(Math.min(book.quantity, quantity + 1))
                                                                    }
                                                                    disabled={quantity >= book.quantity}
                                                                    className="h-10 w-10"
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Add to Cart Button */}
                                                        <Button
                                                            onClick={handleAddToCart}
                                                            disabled={cartLoading}
                                                            className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                                            size="lg"
                                                        >
                                                            <ShoppingCart className="h-5 w-5 mr-2" />
                                                            {cartLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
                                                        </Button>
                                                    </>
                                                )}

                                                {!inStock && (
                                                    <div className="text-center py-4">
                                                        <div className="text-red-600 font-semibold mb-2">Hết hàng</div>
                                                        <Button variant="outline" className="w-full" disabled>
                                                            Thông báo khi có hàng
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description & Details in Tabs-like Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Description */}
                            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Giới thiệu sách</h3>
                                    </div>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {book.description || 'Không có mô tả.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Details */}
                            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Chi tiết sản phẩm</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {book.attributes?.isbn && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">ISBN</span>
                                                <span className="font-medium text-sm">{book.attributes.isbn}</span>
                                            </div>
                                        )}
                                        {book.attributes?.publisher && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">Nhà xuất bản</span>
                                                <span className="font-medium text-sm">{book.attributes.publisher}</span>
                                            </div>
                                        )}
                                        {book.attributes?.publishDate && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">Ngày xuất bản</span>
                                                <span className="font-medium text-sm">
                                                    {formatDate(book.attributes.publishDate)}
                                                </span>
                                            </div>
                                        )}
                                        {book.attributes?.pages && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">Số trang</span>
                                                <span className="font-medium text-sm">{book.attributes.pages}</span>
                                            </div>
                                        )}
                                        {book.attributes?.language && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">Ngôn ngữ</span>
                                                <span className="font-medium text-sm">{book.attributes.language}</span>
                                            </div>
                                        )}
                                        {book.attributes?.bookFormat && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">Định dạng</span>
                                                <span className="font-medium text-sm">{book.attributes.bookFormat}</span>
                                            </div>
                                        )}
                                        {book.attributes?.edition && (
                                            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                                                <span className="text-gray-600 text-sm">Phiên bản</span>
                                                <span className="font-medium text-sm">{book.attributes.edition}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Awards Section */}
                                    {book.attributes?.awards && book.attributes.awards.length > 0 && (
                                        <div className="mt-6 pt-4 border-t">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Award className="h-5 w-5 text-yellow-600" />
                                                <span className="font-semibold text-gray-900">Giải thưởng & Danh hiệu</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {book.attributes.awards.map((award, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        variant="secondary" 
                                                        className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300"
                                                    >
                                                        🏆 {award}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Related Books Section */}
                {relatedBooks.length > 0 && (
                    <Card className="mb-8 border-2 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <BookMarked className="h-7 w-7 text-primary" />
                                </div>
                                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    Có thể bạn cũng thích
                                </span>
                            </h2>
                            <p className="text-gray-600 mt-2 ml-14">Dựa trên thể loại và phong cách của cuốn sách này</p>
                        </div>
                        <CardContent className="p-6">
                            {relatedLoading ? (
                                <div className="flex justify-center py-12">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {relatedBooks.map((relatedBook) => (
                                        <div key={relatedBook.id} className="transform transition-all hover:scale-105">
                                            <BookCard book={relatedBook} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Comments Section */}
                <Card className="border-2 shadow-xl">
                    <div className="bg-gradient-to-r from-gray-50 to-transparent p-6 border-b">
                        <h2 className="text-3xl font-bold text-gray-900">Đánh giá của khách hàng</h2>
                        <p className="text-gray-600 mt-1">Chia sẻ suy nghĩ của bạn với những khách hàng khác</p>
                    </div>
                    <CardContent className="p-6">
                        <BookComments bookId={book.id} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}