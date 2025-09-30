'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, ShoppingCart, RefreshCw, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { bookService } from '@/services/bookService';
import { Book, BookSearchParams } from '@/types/book';
import { BookCard } from '@/components/BookCard';
import { EnhancedBookCard } from '@/components/EnhancedBookCard';
import { toast } from '@/utils/toast';
import { useAppSelector } from '@/hooks/redux';

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for search mode and data
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchMode, setSearchMode] = useState<"semantic" | "traditional">(
        (searchParams?.get('mode') as "semantic" | "traditional") || "semantic"
    );

    // Filter states - Initialize from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || '');
    const [minPrice, setMinPrice] = useState<number>(parseInt(searchParams?.get('minPrice') || '0') || 0);
    const [maxPrice, setMaxPrice] = useState<number | null>(
        searchParams?.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null
    );
    const [sortBy, setSortBy] = useState(searchParams?.get('sort') || 'createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(searchParams?.get('order') as 'asc' | 'desc' || 'desc');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get('page') || '1') || 1);

    // Pagination
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Form states for inputs
    const [minPriceInput, setMinPriceInput] = useState(searchParams?.get('minPrice') || '');
    const [maxPriceInput, setMaxPriceInput] = useState(searchParams?.get('maxPrice') || '');

    // Categories mock data (you should fetch from API)
    const categories = useAppSelector(state => state.categories.categories);

    // Fetch initial data
    useEffect(() => {
        // Chỉ fetch nếu có filters hoặc ở traditional mode
        if (searchQuery || selectedCategory || minPrice > 0 || maxPrice || sortBy !== 'createdAt') {
            handleSearch();
        } else if (searchMode === 'traditional' && !searchQuery && !selectedCategory && minPrice === 0 && !maxPrice && sortBy === 'createdAt') {
            // Chỉ fetch books mặc định khi ở traditional mode và không có filter nào
            fetchBooks();
        }
    }, []);

    // Update state when URL params change
    useEffect(() => {
        const urlSearchQuery = searchParams?.get('q') || '';
        const urlCategory = searchParams?.get('category') || '';
        const urlMinPrice = parseInt(searchParams?.get('minPrice') || '0') || 0;
        const urlMaxPrice = searchParams?.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : null;
        const urlSort = searchParams?.get('sort') || 'createdAt';
        const urlOrder = searchParams?.get('order') as 'asc' | 'desc' || 'desc';
        const urlPage = parseInt(searchParams?.get('page') || '1') || 1;
        const urlMode = (searchParams?.get('mode') as "semantic" | "traditional") || "semantic";

        if (urlSearchQuery !== searchQuery) setSearchQuery(urlSearchQuery);
        if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
        if (urlMinPrice !== minPrice) setMinPrice(urlMinPrice);
        if (urlMaxPrice !== maxPrice) setMaxPrice(urlMaxPrice);
        if (urlSort !== sortBy) setSortBy(urlSort);
        if (urlOrder !== sortOrder) setSortOrder(urlOrder);
        if (urlPage !== currentPage) setCurrentPage(urlPage);
        if (urlMode !== searchMode) setSearchMode(urlMode);

        setMinPriceInput(searchParams?.get('minPrice') || '');
        setMaxPriceInput(searchParams?.get('maxPrice') || '');
    }, [searchParams?.toString()]);

    // Fetch data when search parameters change (excluding searchQuery to avoid auto-search while typing)
    useEffect(() => {
        // Bỏ qua lần đầu tiên (đã được xử lý trong useEffect đầu tiên)
        if (selectedCategory || minPrice > 0 || maxPrice || sortBy !== 'createdAt' || currentPage > 1) {
            handleSearch();
        } else if (!selectedCategory && minPrice === 0 && !maxPrice && sortBy === 'createdAt' && currentPage === 1) {
            // Chỉ fetch books mặc định nếu ở traditional mode và không có filter nào
            if (!searchQuery && searchMode === 'traditional') {
                fetchBooks();
            }
        }
    }, [selectedCategory, minPrice, maxPrice, sortBy, sortOrder, currentPage, searchMode]);

    // Update URL when state changes (including searchQuery for URL sync)
    useEffect(() => {
        updateUrlParams();
    }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, sortOrder, currentPage, searchMode]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params: BookSearchParams = {
                page: currentPage,
                limit: 12,
                sortBy: sortBy as any,
                sortOrder,
            };

            // Chỉ thêm các filter nếu có giá trị
            if (selectedCategory) params.category = selectedCategory;
            if (minPrice > 0) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            const response = await bookService.traditionalSearch(params);
            setBooks(response.data || []);
            setTotalPages(response.meta.pagination.totalPages);
            setTotalResults(response.meta.pagination.totalItems);
        } catch (error) {
            console.error('Failed to fetch books:', error);
            toast.error('Không thể tải sách');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            
            if (searchMode === 'semantic' && searchQuery.trim()) {
                // Semantic search - chỉ khi có query text
                const results = await bookService.searchBooks(searchQuery, 12);
                setBooks(results || []);
                setTotalResults(results?.length || 0);
                setTotalPages(1); // Semantic search typically returns all results at once
            } else {
                // Traditional search with filters - có thể không cần query text
                const params: BookSearchParams = {
                    page: currentPage,
                    limit: 12,
                    sortBy: sortBy as any,
                    sortOrder,
                };

                // Chỉ thêm search query nếu có
                if (searchQuery.trim()) params.search = searchQuery;
                if (selectedCategory) params.category = selectedCategory;
                if (minPrice > 0) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;

                const response = await bookService.traditionalSearch(params);
                setBooks(response.data || []);
                setTotalPages(response.meta.pagination.totalPages);
                setTotalResults(response.meta.pagination.totalItems);
            }
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Không thể tìm kiếm sách');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to update URL parameters
    const updateUrlParams = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (minPrice > 0) params.set('minPrice', minPrice.toString());
        if (maxPrice) params.set('maxPrice', maxPrice.toString());
        if (searchMode !== 'semantic') params.set('mode', searchMode);
        if (sortBy !== 'createdAt') params.set('sort', sortBy);
        if (sortOrder !== 'desc') params.set('order', sortOrder);
        if (currentPage > 1) params.set('page', currentPage.toString());

        // Sử dụng window.history để tránh _rsc parameters
        const newUrl = params.toString() ? `/books?${params.toString()}` : '/books';
        window.history.replaceState({}, '', newUrl);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value === 'all' ? '' : value);
        setCurrentPage(1);
        // URL sẽ được update tự động bởi useEffect
    };

    const handlePriceFilter = () => {
        const min = parseInt(minPriceInput) || 0;
        const max = parseInt(maxPriceInput) || null;
        setMinPrice(min);
        setMaxPrice(max);
        setCurrentPage(1);
        // URL sẽ được update tự động bởi useEffect
    };

    const handleRecommendedPriceRange = (min: number, max: number | null) => {
        setMinPrice(min);
        setMaxPrice(max);
        setMinPriceInput(min.toString());
        setMaxPriceInput(max ? max.toString() : '');
        setCurrentPage(1);
        // URL sẽ được update tự động bởi useEffect
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setCurrentPage(1);
        // URL sẽ được update tự động bởi useEffect
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setMinPrice(0);
        setMaxPrice(null);
        setMinPriceInput('');
        setMaxPriceInput('');
        setSearchMode('semantic'); // Reset to default search mode
        setSortBy('createdAt');
        setSortOrder('desc');
        setCurrentPage(1);
        
        // Sử dụng window.history để tránh _rsc parameters
        window.history.replaceState({}, '', '/books');
        
        // Fetch books sau khi clear filters
        setTimeout(() => {
            fetchBooks();
        }, 100);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // URL sẽ được update tự động bởi useEffect
    };

    const handleSearchModeChange = (checked: boolean) => {
        const newMode = checked ? 'traditional' : 'semantic';
        setSearchMode(newMode);
        setCurrentPage(1); // Reset to first page when switching modes
        // URL sẽ được update tự động bởi useEffect
    };

    // Update URL params whenever filters or pagination change
    useEffect(() => {
        updateUrlParams();
        console.log('updated url params');
    }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, sortOrder, currentPage, searchMode, currentPage]);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Search Header */}
                <div className="mb-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Tìm kiếm sách
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Khám phá hàng ngàn cuốn sách với công nghệ tìm kiếm thông minh hoặc bộ lọc truyền thống
                        </p>
                    </div>

                    {/* Search Mode Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white rounded-lg p-1 border shadow-sm">
                            <div className="flex items-center space-x-4 px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm font-medium">Tìm kiếm thông minh</span>
                                </div>
                                <Switch
                                    checked={searchMode === 'traditional'}
                                    onCheckedChange={handleSearchModeChange}
                                />
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">Tìm kiếm từ khóa</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder={searchMode === 'semantic' 
                                    ? "Tìm kiếm bằng ngôn ngữ tự nhiên: ví dụ 'sách khoa học viễn tưởng về không gian'" 
                                    : "Tìm kiếm theo tên sách, tác giả..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-12 pr-20 h-14 text-lg rounded-xl border-2 focus:border-blue-500"
                            />
                            <Button 
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 rounded-lg"
                            >
                                Tìm kiếm
                            </Button>
                        </div>
                    </div>

                    {/* Search Mode Description */}
                    <div className="max-w-3xl mx-auto mt-4">
                        <p className="text-center text-sm text-gray-500">
                            {searchMode === 'semantic' ? (
                                <>
                                    <Sparkles className="inline h-4 w-4 mr-1" />
                                    Tìm kiếm thông minh: Mô tả nội dung bạn muốn tìm bằng ngôn ngữ tự nhiên
                                </>
                            ) : (
                                <>
                                    <Filter className="inline h-4 w-4 mr-1" />
                                    Tìm kiếm từ khóa: Sử dụng từ khóa cụ thể và bộ lọc nâng cao
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Results Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {searchQuery ? (
                                    <>Kết quả tìm kiếm cho: <span className="text-blue-600">"{searchQuery}"</span></>
                                ) : (
                                    "Tất cả sách"
                                )}
                            </h2>
                            <p className="text-gray-600">
                                {loading ? "Đang tải..." : `Tìm thấy ${totalResults} cuốn sách`}
                                {searchMode === 'semantic' && searchQuery && (
                                    <Badge variant="secondary" className="ml-2">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Tìm kiếm thông minh
                                    </Badge>
                                )}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex border rounded-md">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className="rounded-r-none"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="rounded-l-none"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters - Only show for traditional search */}
                {searchMode === 'traditional' && (
                    <>
                        {/* Mobile Filter Toggle */}
                        <div className="md:hidden mb-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="w-full"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Bộ lọc sản phẩm
                                {showMobileFilters ? (
                                    <ChevronUp className="h-4 w-4 ml-auto" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 ml-auto" />
                                )}
                            </Button>
                        </div>

                        <Card className={`mb-6 ${!showMobileFilters ? 'hidden md:block' : ''}`}>
                            <CardHeader>
                                <CardTitle className="text-lg">Bộ lọc sách</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Category & Controls */}
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div className="flex items-start gap-2 flex-col">
                                            <span className="text-sm font-medium text-gray-700">Thể loại:</span>
                                            <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Thể loại" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả thể loại</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Bộ lọc nâng cao
                                        </Button>
                                        {(searchQuery || selectedCategory || minPrice > 0 || maxPrice !== null) && (
                                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                                <X className="h-4 w-4 mr-2" />
                                                Xóa bộ lọc
                                            </Button>
                                        )}
                                    </div>
                                    {/* Sort */}
                                    <div className="flex gap-2">
                                        <Select value={sortBy} onValueChange={handleSortChange}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Sắp xếp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="createdAt">Mới nhất</SelectItem>
                                                <SelectItem value="price">Giá</SelectItem>
                                                <SelectItem value="rating">Đánh giá</SelectItem>
                                                <SelectItem value="sold">Bán chạy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Giảm dần</SelectItem>
                                                <SelectItem value="asc">Tăng dần</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label className="text-sm font-medium mb-3 block">Khoảng giá</Label>

                                                {/* Recommended Price Ranges */}
                                                <div className="mb-4">
                                                    <span className="text-xs text-gray-500 mb-2 block">Gợi ý khoảng giá:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge
                                                            variant={(minPrice === 0 && maxPrice === 100000) ? "default" : "secondary"}
                                                            className="cursor-pointer"
                                                            onClick={() => handleRecommendedPriceRange(0, 100000)}
                                                        >
                                                            Dưới 100K
                                                        </Badge>
                                                        <Badge
                                                            variant={(minPrice === 100000 && maxPrice === 300000) ? "default" : "secondary"}
                                                            className="cursor-pointer"
                                                            onClick={() => handleRecommendedPriceRange(100000, 300000)}
                                                        >
                                                            100K - 300K
                                                        </Badge>
                                                        <Badge
                                                            variant={(minPrice === 300000 && maxPrice === 500000) ? "default" : "secondary"}
                                                            className="cursor-pointer"
                                                            onClick={() => handleRecommendedPriceRange(300000, 500000)}
                                                        >
                                                            300K - 500K
                                                        </Badge>
                                                        <Badge
                                                            variant={(minPrice === 500000 && maxPrice === null) ? "default" : "secondary"}
                                                            className="cursor-pointer"
                                                            onClick={() => handleRecommendedPriceRange(500000, null)}
                                                        >
                                                            Trên 500K
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Custom Price Range */}
                                                <div>
                                                    <span className="text-xs text-gray-500 mb-2 block">Hoặc nhập khoảng giá tùy chỉnh:</span>
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            placeholder="Giá tối thiểu"
                                                            type="number"
                                                            value={minPriceInput}
                                                            onChange={(e) => setMinPriceInput(e.target.value)}
                                                            className="w-32"
                                                        />
                                                        <span className="text-gray-500">-</span>
                                                        <Input
                                                            placeholder="Giá tối đa"
                                                            type="number"
                                                            value={maxPriceInput}
                                                            onChange={(e) => setMaxPriceInput(e.target.value)}
                                                            className="w-32"
                                                        />
                                                        <Button onClick={handlePriceFilter} size="sm">
                                                            Áp dụng
                                                        </Button>
                                                    </div>
                                                </div>

                                                {(minPrice > 0 || maxPrice !== null) && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Hiện tại: {formatCurrency(minPrice)} - {maxPrice ? formatCurrency(maxPrice) : "Không giới hạn"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active Filters */}
                        {(searchQuery || selectedCategory || minPrice > 0 || maxPrice !== null) && (
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
                                    {searchQuery && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                                            <span>Từ khóa: {searchQuery}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-gray-200"
                                                onClick={() => setSearchQuery('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {selectedCategory && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                                            <span>Thể loại: {categories.find(c => c.id === selectedCategory)?.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-gray-200"
                                                onClick={() => setSelectedCategory('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {(minPrice > 0 || maxPrice !== null) && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                                            <span>Giá: {formatCurrency(minPrice)} - {maxPrice ? formatCurrency(maxPrice) : 'Không giới hạn'}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-gray-200"
                                                onClick={() => {
                                                    setMinPrice(0);
                                                    setMaxPrice(null);
                                                    setMinPriceInput('');
                                                    setMaxPriceInput('');
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                        <span className="text-lg">Đang tìm kiếm...</span>
                    </div>
                )}

                {/* Books Grid */}
                {!loading && (
                    <div
                        className={`grid gap-6 ${viewMode === "grid"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                            }`}
                    >
                        {books.map((book) => (
                            <EnhancedBookCard key={book.id} book={book} viewMode={viewMode} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && books.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">Không tìm thấy sách</h3>
                            <p>
                                {searchQuery 
                                    ? `Không có kết quả cho "${searchQuery}". Thử thay đổi từ khóa tìm kiếm${searchMode === 'traditional' ? ' hoặc bộ lọc' : ''}.`
                                    : 'Thử thay đổi bộ lọc để xem thêm sách.'
                                }
                            </p>
                            {searchMode === 'semantic' && searchQuery && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-400 mb-2">Gợi ý cho tìm kiếm thông minh:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('sách lập trình Python')}>
                                            sách lập trình Python
                                        </Badge>
                                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('tiểu thuyết tình cảm')}>
                                            tiểu thuyết tình cảm
                                        </Badge>
                                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('sách self-help phát triển bản thân')}>
                                            sách phát triển bản thân
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button onClick={clearFilters} variant="outline">
                            Xóa tất cả bộ lọc
                        </Button>
                    </div>
                )}

                {/* Pagination - Only show for traditional search */}
                {!loading && books.length > 0 && totalPages > 1 && searchMode === 'traditional' && (
                    <div className="flex items-center justify-center mt-12">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Trước
                            </Button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNumber)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNumber}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results Summary */}
                {!loading && books.length > 0 && (
                    <div className="text-center text-gray-500 text-sm mt-6">
                        {searchMode === 'semantic' ? (
                            `Hiển thị ${books.length} kết quả tìm kiếm thông minh`
                        ) : (
                            `Hiển thị ${((currentPage - 1) * 12) + 1} - ${Math.min(currentPage * 12, totalResults)} trong tổng số ${totalResults} cuốn sách`
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}