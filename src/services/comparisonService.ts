import { apiService } from './apiService';

export interface CompareRequest {
  productIds: string[];
  query?: string;
  selectedOptions?: string[];
}

export interface CompareOptionsResponse {
  needsMoreInfo: true;
  suggestedOptions: string[];
}

export interface CompareResultResponse {
  needsMoreInfo: false;
  recommendation: {
    bookIndex: number;
    title: string;
    reasons: string[];
    whenToBuy: string;
    isUrgent: boolean;
    urgencyReason: string;
    product: {
      id: string;
      title: string;
      author: string;
      price: number;
      image: string;
      rating: number;
    };
  };
  comparison: {
    summary: string;
    strengths: Record<string, string[]>;
    weaknesses: Record<string, string[]>;
  };
  generalAdvice: string;
}

export type CompareResponse = CompareOptionsResponse | CompareResultResponse;

const comparisonService = {
  compareProducts: async (data: CompareRequest): Promise<CompareResponse> => {
    const response = await apiService.post<{ success: boolean; data: CompareResponse }>('/book/compare', data);
    return response.data;
  }
};

export default comparisonService;
