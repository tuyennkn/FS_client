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
import {
    Star,
    ShoppingCart,
    ArrowLeft,
    Package,
    BookOpen,
    Calendar,
    Languages,
    Award
} from 'lucide-react';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading: cartLoading } = useAppSelector((state) => state.cart);

    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

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

    const handleAddToCart = async () => {
        if (!book) return;

        try {
            await dispatch(addToCart({ product_id: book.id, quantity })).unwrap();
            alert('Book added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add book to cart. Please try again.');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Book not found'}</p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Books
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Book Image */}
                <div className="space-y-4">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                        <Image
                            src={book.image[0] || '/placeholder-book.jpg'}
                            alt={book.title}
                            fill
                            className="object-cover"
                        />
                        {book.quantity === 0 && (
                            <Badge variant="destructive" className="absolute top-4 right-4">
                                Out of Stock
                            </Badge>
                        )}
                        {book.sold > 50 && (
                            <Badge variant="success" className="absolute top-4 left-4">
                                Bestseller
                            </Badge>
                        )}
                    </div>

                    {/* Additional Images */}
                    {book.image.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {book.image.slice(1, 5).map((image, index) => (
                                <div key={index} className="relative aspect-[3/4] overflow-hidden rounded">
                                    <Image
                                        src={image}
                                        alt={`${book.title} ${index + 2}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Book Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                        <p className="text-xl text-muted-foreground mb-4">{book.author}</p>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(book.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                ({book.rating.toFixed(1)})
                            </span>
                            <span className="text-sm text-muted-foreground">
                                • {book.sold} sold
                            </span>
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(book.price)}
                            </span>
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="font-medium">Quantity:</label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </Button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-20 px-3 py-1 text-center border rounded"
                                            min="1"
                                            max={book.quantity}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.min(book.quantity, quantity + 1))}
                                            disabled={quantity >= book.quantity}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    {book.quantity > 0 ? (
                                        <span>{book.quantity} items available</span>
                                    ) : (
                                        <span className="text-red-500">Out of stock</span>
                                    )}
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    disabled={book.quantity === 0 || book.isDisable || cartLoading}
                                    className="w-full"
                                    size="lg"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Book Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Description */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2" />
                            Description
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {book.description || 'No description available.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Book Attributes */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Book Details</h2>
                        <div className="space-y-3">
                            {book.attributes?.isbn && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ISBN:</span>
                                    <span>{book.attributes.isbn}</span>
                                </div>
                            )}
                            {book.attributes?.publisher && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Publisher:</span>
                                    <span>{book.attributes.publisher}</span>
                                </div>
                            )}
                            {book.attributes?.publishDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Publish Date:</span>
                                    <span>{formatDate(book.attributes.publishDate)}</span>
                                </div>
                            )}
                            {book.attributes?.pages && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pages:</span>
                                    <span>{book.attributes.pages}</span>
                                </div>
                            )}
                            {book.attributes?.language && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Language:</span>
                                    <span>{book.attributes.language}</span>
                                </div>
                            )}
                            {book.attributes?.bookFormat && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Format:</span>
                                    <span>{book.attributes.bookFormat}</span>
                                </div>
                            )}
                            {book.genre && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Genre:</span>
                                    <span>{book.genre}</span>
                                </div>
                            )}
                        </div>

                        {book.attributes?.awards && book.attributes.awards.length > 0 && (
                            <>
                                <Separator className="my-4" />
                                <div>
                                    <h3 className="font-medium mb-2 flex items-center">
                                        <Award className="h-4 w-4 mr-2" />
                                        Awards
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {book.attributes.awards.map((award, index) => (
                                            <Badge key={index} variant="success">
                                                {award}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}