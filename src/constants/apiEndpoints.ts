export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8080/router',
  
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
    ME: '/user/me',
    GET_BY_ID: '/user/getUser',
    UPDATE: '/user/update',
  },
  
  // Category endpoints
  CATEGORY: {
    ALL: '/category/allCategories',
    GET_BY_ID: '/category/getCategory',
  },
  
  // Book endpoints
  BOOK: {
    ALL: '/book/all',
    GET_BY_ID: '/book/getBook',
    SEMATIC_SEARCH: '/book/search',
  },
  
  // Comment endpoints
  COMMENT: {
    ALL: '/comment/all',
    CREATE: '/comment/create',
    GET_BY_BOOK: '/comment/book',
    UPDATE: '/comment/update',
    DELETE: '/comment/delete',
  },
};
