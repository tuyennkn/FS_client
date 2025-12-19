'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, RefreshCw, X, GitCompare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';
import { BookCard } from '@/components/BookCard';
import { ProductComparison } from '@/components/ProductComparison';
import { toast } from '@/utils/toast';
import { useAppSelector } from '@/hooks/redux';

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for search and data
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
    const [searchInput, setSearchInput] = useState(searchParams?.get('q') || '');
    
    // Search result metadata
    const [queryType, setQueryType] = useState<'VECTOR_SEARCH' | 'KEYWORD_SEARCH' | null>(null);
    const [appliedFilters, setAppliedFilters] = useState<any>(null);
    const [processedQuery, setProcessedQuery] = useState<string>('');

    // Comparison states
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);

    // Categories
    const categories = useAppSelector(state => state.categories.categories);

    // Load initial search from URL
    useEffect(() => {
        const urlQuery = searchParams?.get('q');
        if (urlQuery) {
            setSearchInput(urlQuery);
            setSearchQuery(urlQuery);
            handleSearch(urlQuery);
        }
    }, []);

    // Update URL when search query changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set('q', searchQuery);
        }
        const newUrl = params.toString() ? `/books?${params.toString()}` : '/books';
        window.history.replaceState({}, '', newUrl);
    }, [searchQuery]);

    const handleSearch = async (query?: string) => {
        const searchText = query || searchInput;
        
        if (!searchText.trim()) {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        try {
            setLoading(true);
            setSearchQuery(searchText);
            
            const response = await bookService.searchBooks(searchText);
            
            // Handle response
            if (response.queryType === 'INVALID') {
                toast.error(response.message || 'Query không hợp lệ');
                setBooks([]);
                setQueryType(null);
                setAppliedFilters(null);
                return;
            }

            const validBooks = Array.isArray(response.data) ? response.data : [];
            setBooks(validBooks);
            setQueryType(response.queryType);
            setProcessedQuery(response.searchQuery);
            setAppliedFilters(response.filters);

        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Không thể tìm kiếm sách');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchInput('');
        setBooks([]);
        setQueryType(null);
        setAppliedFilters(null);
        setProcessedQuery('');
        window.history.replaceState({}, '', '/books');
    };

    // Comparison functions
    const toggleProductSelection = (bookId: string) => {
        setSelectedForComparison(prev => {
            if (prev.includes(bookId)) {
                return prev.filter(id => id !== bookId);
            } else if (prev.length >= 5) {
                toast.error('Chỉ có thể chọn tối đa 5 sản phẩm để so sánh');
                return prev;
            } else {
                return [...prev, bookId];
            }
        });
    };

    const toggleComparisonMode = () => {
        setComparisonMode(!comparisonMode);
        if (comparisonMode) {
            setSelectedForComparison([]);
        }
    };

    const handleCompare = () => {
        if (selectedForComparison.length < 2) {
            toast.error('Vui lòng chọn ít nhất 2 sản phẩm để so sánh');
            return;
        }
        setShowComparison(true);
    };

    const clearComparisonSelection = () => {
        setSelectedForComparison([]);
        setComparisonMode(false);
    };

    const getSelectedProducts = () => {
        return books.filter(book => selectedForComparison.includes(book.id));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || categoryId;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Search Header */}
                <div className="mb-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Tìm kiếm sách thông minh
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Mô tả sách bạn muốn tìm hoặc nhập từ khóa cụ thể..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-12 pr-24 h-14 text-lg rounded-xl border-2 focus:border-blue-500"
                            />
                            {searchInput && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-20 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                            <Button 
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-lg"
                            >
                                Tìm kiếm
                            </Button>
                        </div>
                    </form>

                    {/* AI Status Indicator */}
                    <div className="max-w-3xl mx-auto mt-4 text-center">
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Hệ thống hỗ trợ phân loại mọi nội dung bạn nhập vào
                        </p>
                    </div>
                </div>

                {/* Results Section */}
                {searchQuery && (
                    <>
                        {/* Results Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Kết quả tìm kiếm
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-gray-600">
                                            {loading ? "Đang tìm kiếm..." : `Tìm thấy ${books.length} cuốn sách`}
                                        </p>
                                        {queryType && !loading && (
                                            <Badge variant={queryType === 'VECTOR_SEARCH' ? 'default' : 'secondary'}>
                                                {queryType === 'VECTOR_SEARCH' ? (
                                                    <>
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        Tìm kiếm thông minh
                                                    </>
                                                ) : (
                                                    <>Tìm kiếm từ khóa</>
                                                )}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Comparison Mode Toggle */}
                                    <Button
                                        variant={comparisonMode ? "default" : "outline"}
                                        size="sm"
                                        onClick={toggleComparisonMode}
                                        className="flex items-center gap-2"
                                    >
                                        <GitCompare className="h-4 w-4" />
                                        So sánh
                                        {selectedForComparison.length > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {selectedForComparison.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Search Details */}
                            {processedQuery && processedQuery !== searchQuery && !loading && (
                                <div className="mt-3 text-sm text-gray-500">
                                    Query đã xử lý: <span className="font-medium">&quot;{processedQuery}&quot;</span>
                                </div>
                            )}

                            {/* Applied Filters (for keyword search) */}
                            {queryType === 'KEYWORD_SEARCH' && appliedFilters && !loading && (
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-sm text-gray-600">Bộ lọc đã áp dụng:</span>
                                        {appliedFilters.category && (
                                            <Badge variant="outline">
                                                Thể loại: {getCategoryName(appliedFilters.category)}
                                            </Badge>
                                        )}
                                        {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
                                            <Badge variant="outline">
                                                Giá: {appliedFilters.minPrice ? formatCurrency(appliedFilters.minPrice) : '0'} - {appliedFilters.maxPrice ? formatCurrency(appliedFilters.maxPrice) : 'Không giới hạn'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Comparison Bar */}
                        {comparisonMode && selectedForComparison.length > 0 && (
                            <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3">
                                        <GitCompare className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-semibold text-purple-900">
                                                Đã chọn {selectedForComparison.length}/5 sản phẩm để so sánh
                                            </p>
                                            <p className="text-sm text-purple-700">
                                                {selectedForComparison.length >= 2 
                                                    ? 'Nhấn "So sánh ngay" để xem phân tích'
                                                    : `Chọn thêm ${2 - selectedForComparison.length} sản phẩm nữa`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCompare}
                                            disabled={selectedForComparison.length < 2}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            So sánh ngay
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={clearComparisonSelection}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                    <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                                    <p className="text-lg text-gray-600">Đang phân tích và tìm kiếm...</p>
                                    <p className="text-sm text-gray-400 mt-2">AI đang xử lý yêu cầu của bạn</p>
                                </div>
                            </div>
                        )}

                        {/* Books Grid */}
                        {!loading && books.length > 0 && (
                            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {books.map((book) => (
                                    <div key={book.id} className="relative">
                                        {comparisonMode && (
                                            <div className="absolute top-2 left-2 z-10">
                                                <div className="bg-white rounded-lg shadow-md p-2">
                                                    <Checkbox
                                                        checked={selectedForComparison.includes(book.id)}
                                                        onCheckedChange={() => toggleProductSelection(book.id)}
                                                        className="h-5 w-5"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <BookCard book={book} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && books.length === 0 && (
                            <div className="text-center py-16">
                                <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-sm">
                                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Không tìm thấy sách</h3>
                                    <p className="text-gray-600 mb-4">
                                        Không có kết quả cho &quot;{searchQuery}&quot;. Thử thay đổi từ khóa tìm kiếm hoặc mô tả chi tiết hơn.
                                    </p>
                                    <div className="mt-6">
                                        <p className="text-sm text-gray-500 mb-3">Gợi ý tìm kiếm:</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <Badge 
                                                variant="outline" 
                                                className="cursor-pointer hover:bg-gray-100" 
                                                onClick={() => {
                                                    setSearchInput('sách lập trình Python');
                                                    handleSearch('sách lập trình Python');
                                                }}
                                            >
                                                sách lập trình Python
                                            </Badge>
                                            <Badge 
                                                variant="outline" 
                                                className="cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    setSearchInput('tiểu thuyết tình cảm');
                                                    handleSearch('tiểu thuyết tình cảm');
                                                }}
                                            >
                                                tiểu thuyết tình cảm
                                            </Badge>
                                            <Badge 
                                                variant="outline" 
                                                className="cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    setSearchInput('sách kinh doanh giá dưới 200k');
                                                    handleSearch('sách kinh doanh giá dưới 200k');
                                                }}
                                            >
                                                sách kinh doanh giá rẻ
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button onClick={clearSearch} variant="outline" className="mt-6">
                                        Xóa tìm kiếm
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Results Summary */}
                        {!loading && books.length > 0 && (
                            <div className="text-center text-gray-500 text-sm mt-8">
                                Hiển thị {books.length} kết quả
                            </div>
                        )}
                    </>
                )}

                {/* Initial State (No search yet) */}
                {!searchQuery && !loading && (
                    <div className="text-center py-16">
                        <div className="max-w-lg mx-auto">
                            <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                            <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                                Bắt đầu tìm kiếm
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Nhập mô tả hoặc từ khóa về cuốn sách bạn muốn tìm.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 text-left">
                                <h4 className="font-semibold mb-3 text-gray-900">Ví dụ tìm kiếm:</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-500 font-bold">•</span>
                                        <span><strong>Tìm kiếm thông minh:</strong> &quot;Sách hay về tình yêu&quot;, &quot;Truyện buồn&quot;</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 font-bold">•</span>
                                        <span><strong>Tìm kiếm từ khóa:</strong> &quot;Harry Potter&quot;, &quot;Nguyễn Nhật Ánh&quot;</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">•</span>
                                        <span><strong>Với bộ lọc:</strong> &quot;Sách kinh doanh giá dưới 200k&quot;</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Comparison Modal */}
            {showComparison && (
                <ProductComparison
                    selectedProducts={getSelectedProducts()}
                    onClose={() => setShowComparison(false)}
                    onClearSelection={clearComparisonSelection}
                />
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
