'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { bookService } from '@/services/bookService';
import { Book } from '@/types/book';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConversationalSearchProps {
  onSearchComplete: (books: Book[], query: string) => void;
  onClear?: () => void;
}

export function ConversationalSearch({ onSearchComplete, onClear }: ConversationalSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || loading) return;

    const userQuery = inputValue.trim();
    setInputValue('');
    setLoading(true);

    // Add user message to conversation
    const newUserTurn: ConversationTurn = {
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [...conversationHistory, newUserTurn];
    setConversationHistory(updatedHistory);
    setShowConversation(true);

    try {
      // Call search API with conversation history
      const response = await bookService.searchBooks(userQuery, 12, updatedHistory);

      // Check if AI needs clarification
      if (response.needsClarification && response.question) {
        // Add AI's question to conversation
        const aiTurn: ConversationTurn = {
          role: 'assistant',
          content: response.question,
          timestamp: new Date().toISOString()
        };
        setConversationHistory([...updatedHistory, aiTurn]);
        setLoading(false);
        return;
      }

      // AI confirmed search - show results
      if (response.data && Array.isArray(response.data)) {
        // Add confirmation message
        const confirmationTurn: ConversationTurn = {
          role: 'assistant',
          content: `Tìm thấy ${response.data.length} kết quả cho "${response.searchQuery || userQuery}"`,
          timestamp: new Date().toISOString()
        };
        setConversationHistory([...updatedHistory, confirmationTurn]);
        
        // Pass results to parent
        onSearchComplete(response.data, response.searchQuery || userQuery);
        
        // Clear conversation after successful search
        setTimeout(() => {
          setShowConversation(false);
          setConversationHistory([]);
        }, 1500);
      }

    } catch (error: any) {
      console.error('Search error:', error);
      
      // Add error message to conversation
      const errorTurn: ConversationTurn = {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date().toISOString()
      };
      setConversationHistory([...updatedHistory, errorTurn]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setConversationHistory([]);
    setShowConversation(false);
    setInputValue('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Conversation Display */}
      {showConversation && conversationHistory.length > 0 && (
        <Card className="relative pt-8">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div 
            ref={scrollRef}
            className="max-h-64 overflow-y-auto p-4 space-y-3"
          >
            {conversationHistory.map((turn, index) => (
              <div
                key={index}
                className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    turn.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{turn.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={
                conversationHistory.length > 0
                  ? "Tiếp tục trò chuyện..."
                  : "Bạn muốn tìm sách gì? (VD: sách trinh thám hay, sách cho người mới...)"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="pl-10 pr-4 h-12 text-base"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading || !inputValue.trim()}
            size="lg"
            className="h-12 px-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Gửi
              </>
            )}
          </Button>
        </div>

        {/* Conversation indicator */}
        {conversationHistory.length > 0 && (
          <div className="absolute -bottom-8 left-0">
            <Badge variant="secondary" className="text-xs flex items-center">
              {conversationHistory.length} tin nhắn
            </Badge>
          </div>
        )}
      </form>

      {/* Helper text */}
      {conversationHistory.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Hãy nói chuyện tự nhiên, chúng tôi sẽ hỏi thêm nếu cần để tìm sách phù hợp cho bạn
        </p>
      )}
    </div>
  );
}
