// src/services/authService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER';
    emailVerified?: boolean;
};

export type LoginResponse = {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
};

export type SignupData = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER';
};

export type VerifyEmailRequest = {
    userId: string;
    code: string;
};

export type ResendVerificationCodeRequest = {
    userId: string;
    email: string;
};

export type VerificationResponse = {
    success: boolean;
    message: string;
};

const authService = {
    /**
     * Kullanıcı girişi yapar
     * @param email Kullanıcı e-posta adresi
     * @param password Kullanıcı şifresi
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            return await apiService.post<LoginResponse>('/auth/login', { email, password });
        } catch (error: any) {
            console.error('Login error:', error);

            // Eğer API'den gelen bir hata mesajı varsa kullan, yoksa genel hata mesajı kullan
            if (error.response?.data?.message) {
                throw error; // Original error with message from API
            } else {
                // Create a more appropriate error with a clear message
                const enhancedError = new Error('Kullanıcı Adı veya Şifre hatalı');
                (enhancedError as any).response = {
                    data: {
                        message: 'Kullanıcı Adı veya Şifre hatalı'
                    }
                };
                throw enhancedError;
            }
        }
    },

    /**
     * Yeni kullanıcı kaydı yapar
     * @param userData Yeni kullanıcı bilgileri
     */
    signup: async (userData: SignupData): Promise<User> => {
        try {
            const response = await apiService.post<User>('/auth/signup', userData);

            // E-posta doğrulama kodunu iste
            await apiService.post('/auth/request-verification-code', {
                userId: response.id,
                email: userData.email
            });

            return response;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    /**
     * Çıkış yapar ve mevcut token'ı geçersiz kılar
     * @param refreshToken Geçersiz kılınacak refresh token
     */
    logout: async (refreshToken: string): Promise<void> => {
        try {
            await apiService.post('/auth/logout', { refreshToken });
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    /**
     * Access token yeniler
     * @param refreshToken Mevcut refresh token
     */
    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        try {
            return await apiService.post<LoginResponse>('/auth/refresh-token', { refreshToken });
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    },

    /**
     * Mevcut oturum açmış kullanıcının bilgilerini getirir
     */
    getCurrentUser: async (): Promise<User> => {
        try {
            return await apiService.get<User>('/auth/me');
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },

    /**
     * E-posta doğrulama kodu ister
     * @param userId Kullanıcı ID
     * @param email E-posta adresi
     */
    requestVerificationCode: async (userId: string, email: string): Promise<VerificationResponse> => {
        try {
            const response = await apiService.post<VerificationResponse>('/auth/request-verification-code', { userId, email });
            return response;
        } catch (error: any) {
            console.error('Request verification code error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Doğrulama kodu isteme işlemi başarısız oldu.',
            };
        }
    },

    /**
     * E-posta doğrulama kodunu doğrular
     * @param userId Kullanıcı ID
     * @param code Doğrulama kodu
     */
    verifyEmail: async (userId: string, code: string): Promise<VerificationResponse> => {
        try {
            const response = await apiService.post<VerificationResponse>('/auth/verify-email', { userId, code });
            return {
                success: true,
                message: response.message || 'E-posta adresi başarıyla doğrulandı',
            };
        } catch (error: any) {
            console.error('Email verification error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Doğrulama işlemi başarısız oldu.',
            };
        }
    },

    /**
     * E-posta doğrulama kodunu yeniden gönderir
     * @param userId Kullanıcı ID
     * @param email E-posta adresi
     */
    resendVerificationCode: async (userId: string, email: string): Promise<VerificationResponse> => {
        try {
            const response = await apiService.post<VerificationResponse>('/auth/resend-verification-code', { userId, email });
            return {
                success: true,
                message: response.message || 'Yeni doğrulama kodu e-posta adresinize gönderildi',
            };
        } catch (error: any) {
            console.error('Resend verification code error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Yeni kod gönderilirken bir hata oluştu.',
            };
        }
    },

    /**
     * Şifre sıfırlama isteği gönderir
     * @param email Şifresi sıfırlanacak kullanıcının e-posta adresi
     */
    requestPasswordReset: async (email: string): Promise<void> => {
        try {
            await apiService.post('/auth/request-password-reset', { email });
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    },

    /**
     * Şifreyi sıfırlar
     * @param token Şifre sıfırlama token'ı
     * @param newPassword Yeni şifre
     */
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        try {
            await apiService.post('/auth/reset-password', { token, newPassword });
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }
};

export default authService;