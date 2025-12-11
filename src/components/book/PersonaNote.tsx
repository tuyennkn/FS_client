'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Sparkles, ThumbsUp } from 'lucide-react';
import { bookService } from '@/services/bookService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAppSelector } from '@/hooks/redux';

interface PersonaNoteProps {
    bookSlug: string;
}

export default function PersonaNote({ bookSlug }: PersonaNoteProps) {
    const { user } = useAppSelector((state) => state.auth);
    const [note, setNote] = useState<{ level: 'warning' | 'explore' | 'highly-recommend', reason: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch if user is logged in
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchPersonaNote = async () => {
            try {
                setLoading(true);
                const data = await bookService.getBookPersonaNote(bookSlug);
                setNote(data);
            } catch (error) {
                console.error('Error fetching persona note:', error);
                // Don't show error to user, just hide the component
                setNote(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonaNote();
    }, [bookSlug, user]);

    // Don't show anything if user is not logged in
    if (!user) return null;

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    if (!note) return null;

    const noteConfig = {
        warning: {
            variant: 'destructive' as const,
            icon: AlertTriangle,
            title: 'Nội dung nhạy cảm',
            bgColor: 'bg-red-50 border-red-200',
            iconColor: 'text-red-600',
            titleColor: 'text-red-900',
            textColor: 'text-red-700',
        },
        explore: {
            variant: 'default' as const,
            icon: Sparkles,
            title: 'Khám phá mới',
            bgColor: 'bg-blue-50 border-blue-200',
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-900',
            textColor: 'text-blue-700',
        },
        'highly-recommend': {
            variant: 'default' as const,
            icon: ThumbsUp,
            title: 'Rất phù hợp với bạn',
            bgColor: 'bg-green-50 border-green-200',
            iconColor: 'text-green-600',
            titleColor: 'text-green-900',
            textColor: 'text-green-700',
        },
    };

    const config = noteConfig[note.level];
    const Icon = config.icon;

    return (
        <Alert className={`${config.bgColor} border-2 shadow-md`}>
            <div className="flex gap-3">
                <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <div className={`${config.titleColor} font-bold text-lg mb-2`}>
                        {config.title}
                    </div>
                    <AlertDescription className={`${config.textColor}`}>
                        {note.reason}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}
