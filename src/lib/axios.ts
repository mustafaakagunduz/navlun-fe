// src/lib/axios.ts
import axios from 'axios';

// API temel URL'ini ortam değişkeninden al, yoksa varsayılan olarak local'i kullan
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
    baseURL,
    timeout: 15000, // 15 saniye timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// İstek interceptor'u
axiosInstance.interceptors.request.use(
    (config) => {
        // Token kontrolü - localStorage'dan token al (client-side)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Yanıt interceptor'u
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 hatası ve token yenileme denememiş ise
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            originalRequest._retry = true;

            try {
                // RefreshToken ile yeni AccessToken alma
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Refresh token yoksa kullanıcıyı çıkış yaptır
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${baseURL}/auth/refresh-token`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data.accessToken) {
                    localStorage.setItem('accessToken', response.data.accessToken);
                    // Refresh token yenileniyorsa onu da güncelle
                    if (response.data.refreshToken) {
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                    }

                    // Orijinal isteği yeni token ile tekrar dene
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // Token yenileme başarısız ise çıkış yap
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

        // Diğer tüm hata durumları
        return Promise.reject(error);
    }
);

export default axiosInstance;