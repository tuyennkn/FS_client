'use client';

import React, { useState } from 'react';
import { X, Sparkles, ShoppingCart, TrendingUp, AlertCircle, CheckCircle2, Clock, DollarSign, StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Book } from '@/types/book';
import comparisonService, { CompareResponse, CompareResultResponse } from '@/services/comparisonService';
import { toast } from '@/utils/toast';
import Image from 'next/image';

interface ProductComparisonProps {
  selectedProducts: Book[];
  onClose: () => void;
  onClearSelection: () => void;
}

export function ProductComparison({ selectedProducts, onClose, onClearSelection }: ProductComparisonProps) {
  const [step, setStep] = useState<'query' | 'options' | 'result'>('query');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedOptions, setSuggestedOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [result, setResult] = useState<CompareResultResponse | null>(null);

  const handleInitialCompare = async () => {
    if (selectedProducts.length < 2) {
      toast.error('Vui lòng chọn ít nhất 2 sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const response = await comparisonService.compareProducts({
        productIds: selectedProducts.map(p => p.id),
        query: query.trim(),
        selectedOptions: []
      });

      if (response.needsMoreInfo) {
        // Show options step
        setSuggestedOptions(response.suggestedOptions);
        setStep('options');
      } else {
        // Show result directly
        setResult(response);
        setStep('result');
      }
    } catch (error: any) {
      console.error('Comparison error:', error);
      toast.error(error.response?.data?.message || 'Không thể so sánh sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalCompare = async () => {
    setLoading(true);
    try {
      const response = await comparisonService.compareProducts({
        productIds: selectedProducts.map(p => p.id),
        query: query.trim(),
        selectedOptions
      });

      if (!response.needsMoreInfo) {
        setResult(response);
        setStep('result');
      }
    } catch (error: any) {
      console.error('Comparison error:', error);
      toast.error(error.response?.data?.message || 'Không thể so sánh sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleSkipOptions = () => {
    handleFinalCompare();
  };

  const handleReset = () => {
    setStep('query');
    setQuery('');
    setSuggestedOptions([]);
    setSelectedOptions([]);
    setResult(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b sticky top-0 bg-white z-10">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            So sánh sản phẩm
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Selected Products Preview */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm text-gray-600">
              Sản phẩm được chọn ({selectedProducts.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedProducts.map(product => (
                <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="relative w-12 h-16 flex-shrink-0">
                    <Image
                      src={product.image[0] || '/placeholder-book.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Query Input */}
          {step === 'query' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="comparison-query" className="text-base">
                  Bạn muốn so sánh theo tiêu chí gì? (Tùy chọn)
                </Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Ví dụ: "Sách nào phù hợp cho người mới bắt đầu?", "So sánh giá trị đồng tiền", "Sách nào hay hơn?"
                </p>
                <Textarea
                  id="comparison-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập tiêu chí so sánh hoặc để trống để chúng tôi tự phân tích..."
                  className="min-h-[100px]"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nếu bạn bỏ qua bước này, chúng tôi sẽ phân tích và đề xuất các tiêu chí so sánh phù hợp.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleInitialCompare}
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Bắt đầu so sánh
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Options Selection */}
          {step === 'options' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Chọn tiêu chí so sánh</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chúng tôi đề xuất các tiêu chí sau. Bạn có thể chọn hoặc bỏ qua để chúng tôi tự quyết định.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => toggleOption(option)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedOptions.includes(option)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 ${selectedOptions.includes(option) ? 'text-purple-500' : 'text-gray-400'}`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {query && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tiêu chí của bạn:</strong> "{query}"
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleFinalCompare}
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      So sánh ({selectedOptions.length > 0 ? `${selectedOptions.length} tiêu chí` : 'Tự động'})
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleSkipOptions} disabled={loading}>
                  Bỏ qua
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                  Quay lại
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Comparison Result */}
          {step === 'result' && result && (
            <div className="space-y-6">
              {/* Recommendation */}
              <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Sparkles className="h-5 w-5" />
                    Đề xuất của Chúng Tôi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-32 flex-shrink-0">
                      <Image
                        src={result.recommendation.product.image || '/placeholder-book.jpg'}
                        alt={result.recommendation.product.title}
                        fill
                        className="object-cover rounded-lg shadow-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{result.recommendation.product.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{result.recommendation.product.author}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {formatPrice(result.recommendation.product.price)}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <StarIcon className="h-3 w-3" />
                          {result.recommendation.product.rating}/5
                        </Badge>
                        {result.recommendation.isUrgent && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Nên mua ngay
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Lý do nên chọn:</h4>
                    <ul className="space-y-2">
                      {result.recommendation.reasons.map((reason, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/70 rounded-lg p-3">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      Thời điểm mua:
                    </h4>
                    <p className="text-sm">{result.recommendation.whenToBuy}</p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Lưu ý:</strong> {result.recommendation.urgencyReason}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Comparison Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết so sánh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Tóm tắt:</h4>
                    <p className="text-sm text-gray-700">{result.comparison.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(result.comparison.strengths).map(([index, strengths]) => {
                      const product = selectedProducts[parseInt(index)];
                      return (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {product.title}
                          </h4>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-green-700">Ưu điểm:</p>
                            <ul className="text-xs space-y-1">
                              {strengths.map((strength, i) => (
                                <li key={i} className="text-gray-600">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          {result.comparison.weaknesses[index] && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-medium text-red-700">Nhược điểm:</p>
                              <ul className="text-xs space-y-1">
                                {result.comparison.weaknesses[index].map((weakness, i) => (
                                  <li key={i} className="text-gray-600">• {weakness}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* General Advice */}
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lời khuyên chung:</strong> {result.generalAdvice}
                </AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Navigate to recommended product
                    window.location.href = `/books/${selectedProducts[result.recommendation.bookIndex]?.slug || result.recommendation.product.id}`;
                  }}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Xem sản phẩm được đề xuất
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  So sánh lại
                </Button>
                <Button variant="ghost" onClick={() => {
                  onClearSelection();
                  onClose();
                }}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
