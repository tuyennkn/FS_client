export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/router',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: '/auth/me',
  },
  
  // User endpoints
  USER: {
    ME: '/auth/me',
    GET_BY_ID: (id: string) => `/user/${id}`,
    UPDATE: (id: string) => `/user/${id}`,
  },
  
  // Category endpoints
  CATEGORY: {
    ALL: '/category/allCategories',
    GET_BY_ID: '/category/getCategory'
  },
  
  // Book endpoints
  BOOK: {
    ALL: '/book/all',
    FEATURED: '/book/featured',
    GET_BY_ID: '/book/getBook',
    GET_BY_SLUG: '/book/getBook',
    SEMATIC_SEARCH: '/book/search',
    SEARCH_FILTERS: '/book/search-filters',
  },
  
  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
  
  // Order endpoints
  ORDER: {
    CREATE: '/order/create',
    CREATE_DIRECT: '/order/create-direct',
    MY_ORDERS: '/order/my-orders',
    GET_BY_ID: '/order',
  },
  
  // Comment endpoints
  COMMENT: {
    ALL: '/comment/all',
    CREATE: '/comment/create',
    UPDATE: (id: string) => `/comment/update/${id}`,
    DELETE: (id: string) => `/comment/delete/${id}`,
    GET_BY_ID: (id: string) => `/comment/${id}`,
    GET_BY_BOOK: (bookId: string) => `/comment/book/${bookId}`,
  },
};
