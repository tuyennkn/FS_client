'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/userService';
import { toast } from '@/utils/toast';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/features/auth/authSlice';

const GENRES = [
  'Kinh tế', 'Văn học', 'Tiểu thuyết', 'Kỹ năng sống', 
  'Thiếu nhi', 'Công nghệ', 'Lịch sử', 'Tâm lý học'
];

const GOALS = [
  { id: 'entertainment', label: 'Giải trí & Thư giãn' },
  { id: 'learning', label: 'Học tập & Nghiên cứu' },
  { id: 'self-improvement', label: 'Phát triển bản thân' },
  { id: 'gift', label: 'Mua làm quà tặng' }
];

export const PersonaSurveyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if user is logged in and has no persona
    if (isAuthenticated && user && !user.persona) {
      // Add a small delay to not annoy user immediately
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async () => {
    if (selectedGenres.length === 0 && !selectedGoal) {
      toast.error('Vui lòng chọn ít nhất một sở thích hoặc bỏ qua.');
      return;
    }

    setLoading(true);
    try {
      const goalLabel = GOALS.find(g => g.id === selectedGoal)?.label || '';
      const personaString = `Người dùng quan tâm đến các thể loại: ${selectedGenres.join(', ')}. Mục tiêu đọc sách: ${goalLabel}.`;
      
      const updatedUser = await userService.updatePersona(personaString);
      
      // Update redux state
      if (user) {
        dispatch(setUser({ ...user, persona: personaString }));
      }
      
      toast.success('Cảm ơn bạn đã chia sẻ sở thích!');
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating persona:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const defaultPersona = "chưa có thông tin nào từ người dùng";
      await userService.updatePersona(defaultPersona);
      
      if (user) {
        dispatch(setUser({ ...user, persona: defaultPersona }));
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error skipping survey:', error);
      setIsOpen(false); // Close anyway
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chào mừng bạn đến với BookStore! 👋</DialogTitle>
          <DialogDescription>
            Hãy cho chúng tôi biết sở thích của bạn để nhận được những gợi ý sách phù hợp nhất.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Genres */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Bạn thích đọc thể loại nào?</h4>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`genre-${genre}`} 
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <Label htmlFor={`genre-${genre}`} className="text-sm font-normal cursor-pointer">
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Mục tiêu đọc sách của bạn là gì?</h4>
            <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal}>
              {GOALS.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={goal.id} id={`goal-${goal.id}`} />
                  <Label htmlFor={`goal-${goal.id}`} className="text-sm font-normal cursor-pointer">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} disabled={loading}>
            Bỏ qua
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Hoàn tất'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
