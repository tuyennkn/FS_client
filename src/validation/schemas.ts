import * as yup from 'yup';

// Auth validation schemas
export const loginSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  fullname: yup.string().required('Full name is required'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  phone: yup.string().matches(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits'),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender'),
  birthday: yup.date(),
  address: yup.string(),
});

// Comment validation schemas (for client comment creation)
export const commentSchema = yup.object({
  book_id: yup.string().required('Book is required'),
  rating: yup.number().required('Rating is required').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  content: yup.string().required('Content is required').min(5, 'Content must be at least 5 characters'),
});

// User profile update validation schema (for client profile editing)
export const userProfileUpdateSchema = yup.object({
  fullname: yup.string().required('Full name is required'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  phone: yup.string().matches(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits'),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender'),
  birthday: yup.date(),
  address: yup.string(),
});

// Password change validation schema
export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});
