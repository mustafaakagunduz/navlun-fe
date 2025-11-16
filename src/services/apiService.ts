// src/services/apiService.ts
import axiosInstance from '@/lib/axios';

// Genel CRUD işlemleri için tip tanımlamaları
type ApiResponse<T> = {
    data: T;
    message?: string;
    status: number;
};

const apiService = {
    /**
     * GET isteği yapar
     * @param endpoint API endpoint'i
     * @param params URL parametreleri (opsiyonel)
     */
    get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
        try {
            const response = await axiosInstance.get<ApiResponse<T>>(endpoint, { params });
            return response.data.data;
        } catch (error) {
            console.error(`GET ${endpoint} isteği başarısız:`, error);
            throw error;
        }
    },

    /**
     * POST isteği yapar
     * @param endpoint API endpoint'i
     * @param data Gönderilecek veri
     */
    post: async <T, D = any>(endpoint: string, data?: D): Promise<T> => {
        try {
            const response = await axiosInstance.post<ApiResponse<T>>(endpoint, data);
            return response.data.data;
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`POST ${endpoint} isteği başarısız:`, error);
            }
            throw error;
        }
    },

    /**
     * PUT isteği yapar
     * @param endpoint API endpoint'i
     * @param data Güncellenecek veri
     */
    put: async <T, D = any>(endpoint: string, data?: D): Promise<T> => {
        try {
            const response = await axiosInstance.put<ApiResponse<T>>(endpoint, data);
            return response.data.data;
        } catch (error) {
            console.error(`PUT ${endpoint} isteği başarısız:`, error);
            throw error;
        }
    },

    /**
     * PATCH isteği yapar
     * @param endpoint API endpoint'i
     * @param data Kısmi güncelleme verisi
     */
    patch: async <T, D = any>(endpoint: string, data?: D): Promise<T> => {
        try {
            const response = await axiosInstance.patch<ApiResponse<T>>(endpoint, data);
            return response.data.data;
        } catch (error) {
            console.error(`PATCH ${endpoint} isteği başarısız:`, error);
            throw error;
        }
    },

    /**
     * DELETE isteği yapar
     * @param endpoint API endpoint'i
     */
    delete: async <T>(endpoint: string): Promise<T> => {
        try {
            const response = await axiosInstance.delete<ApiResponse<T>>(endpoint);
            return response.data.data;
        } catch (error) {
            console.error(`DELETE ${endpoint} isteği başarısız:`, error);
            throw error;
        }
    },

    /**
     * Dosya yükleme isteği yapar
     * @param endpoint API endpoint'i
     * @param formData Dosya ve diğer form verileri
     */
    uploadFile: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        try {
            const response = await axiosInstance.post<ApiResponse<T>>(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 120000, // 2 dakika - dosya yükleme için özel timeout
            });
            return response.data.data;
        } catch (error) {
            console.error(`File upload to ${endpoint} failed:`, error);
            throw error;
        }
    },
};

export default apiService;