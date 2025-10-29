import { apiService } from './apiService'

export interface Comment {
  id: string
  book_id: string | {
    _id: string
    title: string
    author: string
  }
  user_id: {
    _id: string
    username: string
    fullname?: string
    avatar?: string
  }
  rating: number
  comment: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCommentData {
  book_id: string
  rating: number
  comment: string
}

export interface UpdateCommentData {
  rating?: number
  comment?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const commentService = {
  // Lấy tất cả comments của một sách
  getBookComments: async (bookId: string): Promise<Comment[]> => {
    const response = await apiService.get<ApiResponse<Comment[]>>(`/comment/book/${bookId}`)
    return response.data
  },

  // Tạo comment mới (yêu cầu auth)
  createComment: async (data: CreateCommentData): Promise<Comment> => {
    const response = await apiService.post<ApiResponse<Comment>>('/comment/create', data)
    return response.data
  },

  // Cập nhật comment (yêu cầu auth, trong 15 phút)
  updateComment: async (id: string, data: UpdateCommentData): Promise<Comment> => {
    const response = await apiService.put<ApiResponse<Comment>>(`/comment/update/${id}`, data)
    return response.data
  },

  // Xóa comment (yêu cầu auth)
  deleteComment: async (id: string): Promise<void> => {
    await apiService.delete<ApiResponse<void>>(`/comment/delete/${id}`)
  },

  // Get all comments (admin)
  getAllComments: async (): Promise<Comment[]> => {
    const response = await apiService.get<ApiResponse<Comment[]>>('/comment/all')
    return response.data
  }
}

export default commentService
