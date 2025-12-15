// src/app/dashboard/carrier/delivery-tracking/ReviewModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Star, Send, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import reviewService, { ReviewRequest } from '@/services/reviewService';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    loadId: string;
    senderId: string;
    senderName: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewModal({
    isOpen,
    onClose,
    loadId,
    senderId,
    senderName,
    onReviewSubmitted
}: ReviewModalProps) {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Modal kapandığında formu sıfırla
            setRating(0);
            setHoveredRating(0);
            setComment('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: 'Uyarı',
                description: 'Lütfen bir puan seçin.',
                variant: 'destructive',
            });
            return;
        }

        if (!comment.trim()) {
            toast({
                title: 'Uyarı',
                description: 'Lütfen bir yorum yazın.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Review request oluştur
            const reviewData: ReviewRequest = {
                senderId,
                carrierId: '', // Backend'de current user'dan alınacak
                loadId,
                rating,
                comment: comment.trim()
            };

            await reviewService.createReview(reviewData);

            toast({
                title: 'Başarılı',
                description: 'Değerlendirmeniz başarıyla gönderildi. Teşekkür ederiz!',
            });

            onReviewSubmitted?.();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error.response?.data?.message || 'Değerlendirme gönderilirken bir hata oluştu.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return (
            <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= (hoveredRating || rating);
                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`h-10 w-10 ${
                                    isActive
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'fill-gray-200 text-gray-200'
                                } transition-colors`}
                            />
                        </button>
                    );
                })}
            </div>
        );
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1:
                return 'Çok Kötü';
            case 2:
                return 'Kötü';
            case 3:
                return 'Orta';
            case 4:
                return 'İyi';
            case 5:
                return 'Mükemmel';
            default:
                return 'Puan verin';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Star className="h-6 w-6 text-yellow-500" />
                        Göndericiye Değerlendirme
                    </DialogTitle>
                    <DialogDescription>
                        Teslimat tamamlandı! Deneyiminizi paylaşın.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sender Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Gönderici</div>
                                <div className="font-semibold text-gray-900">{senderName}</div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="space-y-3">
                        <Label className="text-center block text-base font-semibold">
                            Bu gönderici ile çalışma deneyiminizi değerlendirin
                        </Label>
                        {renderStars()}
                        <div className="text-center">
                            <span className={`text-sm font-medium ${
                                (hoveredRating || rating) > 0 ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                                {getRatingText(hoveredRating || rating)}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment" className="text-base font-semibold">
                            Yorumunuz <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="comment"
                            placeholder="Gönderici ile çalışma deneyiminizi detaylı olarak paylaşın. Bu değerlendirme diğer taşıyıcılar için önemlidir..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="resize-none"
                            maxLength={500}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Minimum 10 karakter</span>
                            <span>{comment.length}/500</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Bilgi:</strong> Değerlendirmeniz göndericinin profil puanını etkiler ve diğer taşıyıcılar için yol gösterici olur.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Değerlendirmeyi Gönder
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
