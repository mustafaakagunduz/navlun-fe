// src/services/reviewService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type Review = {
    id: string;
    senderId: string;
    carrierId: string;
    carrierName?: string;
    loadId: string;
    rating: number; // 1-5 arası
    comment?: string;
    createdAt: string;
    updatedAt?: string;
};

export type ReviewRequest = {
    senderId: string;
    carrierId: string;
    loadId: string;
    rating: number;
    comment?: string;
};

export type ReviewStatistics = {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        [key: number]: number; // rating => count
    };
};

const reviewService = {
    // Yeni değerlendirme oluşturur
    createReview: async (reviewData: ReviewRequest): Promise<Review> => {
        try {
            return await apiService.post<Review, ReviewRequest>('/reviews', reviewData);
        } catch (error) {
            console.error('Create review error:', error);
            throw error;
        }
    },

    // Sender'a yapılmış tüm değerlendirmeleri getirir
    getReviewsBySenderId: async (senderId: string): Promise<Review[]> => {
        try {
            return await apiService.get<Review[]>(`/reviews/sender/${senderId}`);
        } catch (error) {
            console.error(`Get reviews by sender ID (${senderId}) error:`, error);
            throw error;
        }
    },

    // Carrier'ın yaptığı tüm değerlendirmeleri getirir
    getReviewsByCarrierId: async (carrierId: string): Promise<Review[]> => {
        try {
            return await apiService.get<Review[]>(`/reviews/carrier/${carrierId}`);
        } catch (error) {
            console.error(`Get reviews by carrier ID (${carrierId}) error:`, error);
            throw error;
        }
    },

    // Belirli bir yük için değerlendirmeyi getirir
    getReviewByLoadId: async (loadId: string): Promise<Review | null> => {
        try {
            return await apiService.get<Review>(`/reviews/load/${loadId}`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Get review by load ID (${loadId}) error:`, error);
            throw error;
        }
    },

    // Sender için değerlendirme istatistiklerini getirir
    getSenderReviewStatistics: async (senderId: string): Promise<ReviewStatistics> => {
        try {
            return await apiService.get<ReviewStatistics>(`/reviews/sender/${senderId}/statistics`);
        } catch (error) {
            console.error(`Get sender review statistics (${senderId}) error:`, error);
            throw error;
        }
    },

    // Değerlendirmeyi günceller
    updateReview: async (reviewId: string, reviewData: Partial<ReviewRequest>): Promise<Review> => {
        try {
            return await apiService.put<Review, Partial<ReviewRequest>>(`/reviews/${reviewId}`, reviewData);
        } catch (error) {
            console.error(`Update review (${reviewId}) error:`, error);
            throw error;
        }
    },

    // Değerlendirmeyi siler
    deleteReview: async (reviewId: string): Promise<void> => {
        try {
            await apiService.delete(`/reviews/${reviewId}`);
        } catch (error) {
            console.error(`Delete review (${reviewId}) error:`, error);
            throw error;
        }
    },
};

export default reviewService;
