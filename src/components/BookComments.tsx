'use client'

import React, { useState, useEffect } from 'react'
import { Star, Edit2, Trash2, Send, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import commentService, { Comment, CreateCommentData } from '@/services/commentService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAppSelector } from '@/hooks/redux'
import { type User } from '@/types/user'

interface BookCommentsProps {
  bookId: string
}

export default function BookComments({ bookId }: BookCommentsProps) {
  const auth = useAppSelector((state) => state.auth)
  const user: User | null = auth.user

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    loadComments()
  }, [bookId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await commentService.getBookComments(bookId)
      setComments(data.filter(c => !c.isDisabled))
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Không thể tải bình luận')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để bình luận')
      return
    }

    if (!commentText.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận')
      return
    }

    try {
      const data: CreateCommentData = {
        book_id: bookId,
        rating,
        comment: commentText
      }

      await commentService.createComment(data)
      toast.success('Đã thêm bình luận!')
      setCommentText('')
      setRating(5)
      loadComments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể thêm bình luận')
    }
  }

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditRating(comment.rating)
    setEditText(comment.comment)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRating(5)
    setEditText('')
  }

  const handleUpdate = async (id: string) => {
    try {
      await commentService.updateComment(id, {
        rating: editRating,
        comment: editText
      })
      toast.success('Đã cập nhật bình luận!')
      handleCancelEdit()
      loadComments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật bình luận')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

    try {
      await commentService.deleteComment(id)
      toast.success('Đã xóa bình luận!')
      loadComments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa bình luận')
    }
  }

  const canEdit = (comment: Comment) => {
    if (!user) return false
    const isOwner = comment.user_id._id === user.id
    const createdAt = new Date(comment.createdAt)
    const now = new Date()
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
    return isOwner && diffMinutes <= 15
  }

  const canDelete = (comment: Comment) => {
    if (!user) return false
    return comment.user_id._id === user.id
  }

  const renderStars = (value: number, onChange?: (val: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Đánh giá & Bình luận ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Form thêm comment */}
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Đánh giá của bạn
                </label>
                {renderStars(rating, setRating)}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bình luận
                </label>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Gửi bình luận
              </Button>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center mb-8">
              <p className="text-gray-600">
                Vui lòng đăng nhập để bình luận và đánh giá
              </p>
            </div>
          )}

          {/* Danh sách comments */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500">Đang tải bình luận...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            ) : (
              comments.map((comment) => {
                console.log('Rendering comment:', comment)
                return (
                <div
                  key={comment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={comment.user_id.avatar} />
                      <AvatarFallback>
                        {comment.user_id.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {comment.user_id.fullname || comment.user_id.username}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        </div>

                        {editingId !== comment.id && (
                          <div className="flex items-center space-x-2">
                            {canEdit(comment) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(comment)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete(comment) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(comment.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {editingId === comment.id ? (
                        <div className="space-y-4">
                          {renderStars(editRating, setEditRating)}
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(comment.id)}
                            >
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {renderStars(comment.rating)}
                          <p className="mt-2 text-gray-700">{comment.comment}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
