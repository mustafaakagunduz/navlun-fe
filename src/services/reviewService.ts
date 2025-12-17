// src/services/reviewService.ts
import apiService from '@/services/apiService';
import axiosInstance from '@/lib/axios';

// User Type Enum - Backend ile senkronize
export enum UserType {
    SENDER = 'SENDER',
    CARRIER = 'CARRIER',
    BROKER = 'BROKER'
}

// Tip tanımlamaları
export type Review = {
    id: string;
    reviewerId: string;
    reviewerName?: string;
    reviewerType: UserType;
    reviewedUserId: string;
    reviewedUserName?: string;
    reviewedUserType: UserType;
    loadId: string;
    rating: number; // 1-5 arası
    comment?: string;
    createdAt: string;
    updatedAt?: string;
};

export type ReviewRequest = {
    reviewedUserId: string;
    reviewedUserType: UserType;
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

    // Kullanıcıya yapılmış tüm değerlendirmeleri getirir (bu kullanıcı hakkındaki değerlendirmeler)
    getReviewsForUser: async (userId: string): Promise<Review[]> => {
        try {
            const response = await axiosInstance.get<Review[]>(`/reviews/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Get reviews for user (${userId}) error:`, error);
            throw error;
        }
    },

    // Kullanıcının yaptığı tüm değerlendirmeleri getirir
    getReviewsByUser: async (userId: string): Promise<Review[]> => {
        try {
            const response = await axiosInstance.get<Review[]>(`/reviews/by-user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Get reviews by user (${userId}) error:`, error);
            throw error;
        }
    },

    // Belirli bir yük için tüm değerlendirmeleri getirir
    getReviewsForLoad: async (loadId: string): Promise<Review[]> => {
        try {
            const response = await axiosInstance.get<Review[]>(`/reviews/load/${loadId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return [];
            }
            console.error(`Get reviews for load (${loadId}) error:`, error);
            throw error;
        }
    },

    // Kullanıcı için değerlendirme istatistiklerini getirir
    getUserStatistics: async (userId: string): Promise<ReviewStatistics> => {
        try {
            const response = await axiosInstance.get<ReviewStatistics>(`/reviews/user/${userId}/statistics`);
            return response.data;
        } catch (error) {
            console.error(`Get user review statistics (${userId}) error:`, error);
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

    // DEPRECATED - Backward compatibility için bırakıldı
    getReviewsBySenderId: async (senderId: string): Promise<Review[]> => {
        console.warn('getReviewsBySenderId is deprecated, use getReviewsForUser instead');
        return reviewService.getReviewsForUser(senderId);
    },

    getSenderReviewStatistics: async (senderId: string): Promise<ReviewStatistics> => {
        console.warn('getSenderReviewStatistics is deprecated, use getUserStatistics instead');
        return reviewService.getUserStatistics(senderId);
    },

    getReviewsByCarrierId: async (carrierId: string): Promise<Review[]> => {
        console.warn('getReviewsByCarrierId is deprecated, use getReviewsForUser instead');
        return reviewService.getReviewsForUser(carrierId);
    },
};

export default reviewService;
