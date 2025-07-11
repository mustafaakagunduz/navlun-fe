// src/services/verificationService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type VerifyEmailRequest = {
    userId: string;
    code: string;
};

export type ResendCodeRequest = {
    userId: string;
    email: string;
};

export type VerificationResponse = {
    success: boolean;
    message: string;
    userId?: string;
    role?: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER';
    email?: string;
    accessToken?: string;
    refreshToken?: string;
};

const verificationService = {
    /**
     * E-posta doğrulama kodunu doğrular
     * @param userId Kullanıcı ID
     * @param code Doğrulama kodu
     */
    verifyEmail: async (userId: string, code: string): Promise<VerificationResponse> => {
        try {
            const response = await apiService.post<VerificationResponse>('/auth/verify-email', { userId, code });
            return response;
        } catch (error: any) {
            console.error('Email verification error:', error);
            // API'den gelen hata mesajını kullan veya varsayılan bir hata mesajı döndür
            return {
                success: false,
                message: error.response?.data?.message || 'Doğrulama kodunu kontrol edin.',
            };
        }
    },

    /**
     * Yeni bir doğrulama kodu gönderir
     * @param userId Kullanıcı ID
     * @param email Kullanıcı e-posta adresi
     */
    resendVerificationCode: async (userId: string, email: string): Promise<VerificationResponse> => {
        try {
            const response = await apiService.post<VerificationResponse>('/auth/resend-verification-code', { userId, email });
            return response;
        } catch (error: any) {
            console.error('Resend verification code error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Yeni kod gönderilirken bir hata oluştu.',
            };
        }
    }
};

export default verificationService;