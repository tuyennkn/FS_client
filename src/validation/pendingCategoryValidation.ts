// PendingCategory validation functions for client
export const validateCreatePendingCategory = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.book_id || typeof data.book_id !== 'string') {
    errors.push('Book ID is required and must be a string');
  }

  if (!data.genre || typeof data.genre !== 'string' || data.genre.trim().length === 0) {
    errors.push('Genre is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Type checking helpers
export const isPendingCategoryStatus = (status: string): status is 'pending' | 'approved' | 'rejected' => {
  return ['pending', 'approved', 'rejected'].includes(status);
};

export const sanitizePendingCategoryData = (data: any) => {
  return {
    book_id: typeof data.book_id === 'string' ? data.book_id.trim() : '',
    genre: typeof data.genre === 'string' ? data.genre.trim() : '',
  };
};

// Client-specific validation for display components
export const validatePendingCategoryDisplayData = (data: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('Pending category ID is required');
  }

  if (!data.ai_recommended_name || typeof data.ai_recommended_name !== 'string') {
    errors.push('AI recommended name is required');
  }

  if (!data.book_data || typeof data.book_data !== 'object') {
    errors.push('Book data is required');
  } else {
    if (!data.book_data.title || typeof data.book_data.title !== 'string') {
      errors.push('Book title is required');
    }
    if (!data.book_data.author || typeof data.book_data.author !== 'string') {
      errors.push('Book author is required');
    }
    if (!data.book_data.genre || typeof data.book_data.genre !== 'string') {
      errors.push('Book genre is required');
    }
  }

  if (!data.status || !['pending', 'approved', 'rejected'].includes(data.status)) {
    errors.push('Valid status is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};