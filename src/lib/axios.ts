// src/lib/axios.ts
import axios from 'axios';
import { setCookie, clearAllAuthCookies } from './cookieUtils';

const getBaseURL = () => {
    // Production check - domain ile kontrol ekle
    if (process.env.NEXT_PUBLIC_APP_ENV === 'production' ||
        typeof window !== 'undefined' &&
        (window.location.hostname === 'transyuk.com' ||
            window.location.hostname === 'www.transyuk.com' ||
            window.location.hostname === 'navlun-fe.vercel.app')) {
        // Frontend proxy route kullan (Mixed Content Policy için)
        return '/api/v1';
    }

    // Development için
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
};

const baseURL = getBaseURL();

// Timeout değerini environment'dan al (dosya yükleme için daha uzun)
const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000');

const axiosInstance = axios.create({
    baseURL,
    timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Development'da console log
if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    console.log('🔗 API Base URL:', baseURL);
    console.log('⏱️ API Timeout:', timeout);
}

// İstek interceptor'u
axiosInstance.interceptors.request.use(
    (config) => {
        // Development'da istekleri logla
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        // Token kontrolü - localStorage'dan token al (client-side)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
            console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Yanıt interceptor'u
axiosInstance.interceptors.response.use(
    (response) => {
        // Development'da başarılı yanıtları logla
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
            console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Development'da hataları logla
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
            console.error(`❌ API Error: ${error.response?.status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
        }

        // 401 hatası ve token yenileme denememiş ise
        if (error.response?.status === 401 && !originalRequest._retry &&
            typeof window !== 'undefined' &&
            localStorage.getItem('accessToken') && // Token varsa (oturum açılmışsa)
            !originalRequest.url.includes('/auth/login')) {

            originalRequest._retry = true;

            try {
                // RefreshToken ile yeni AccessToken alma
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Refresh token yoksa kullanıcıyı çıkış yaptır
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/';
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${baseURL}/auth/refresh-token`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data.accessToken) {
                    // Token'ları hem localStorage hem cookie'ye kaydet
                    localStorage.setItem('accessToken', response.data.accessToken);
                    setCookie('accessToken', response.data.accessToken, 7);

                    if (response.data.refreshToken) {
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                        setCookie('refreshToken', response.data.refreshToken, 7);
                    }

                    // Orijinal isteği yeni token ile tekrar dene
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // Token yenileme başarısız ise çıkış yap - tüm storage ve cookie'leri temizle
                localStorage.clear();
                sessionStorage.clear();
                clearAllAuthCookies();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;