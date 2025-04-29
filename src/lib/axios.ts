import axios from 'axios';

// API base URL'ini ortam değişkenlerinden alıyoruz
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL,
    timeout: 15000, // 15 saniye timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - sadece sunucu tarafı istekler için
axiosInstance.interceptors.request.use(
    (config) => {
        // Burada sunucu tarafında yapılacak istekler için özel işlemler yapabilirsiniz
        // Örneğin, backend'e kimlik doğrulama için farklı bir token ekleyebilirsiniz

        // Not: Bu interceptor route.ts içinden yapılan istekler için çalışır,
        // client tarafından yapılan istekler için değil
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Hata durumlarını burada merkezi olarak işleyebilirsiniz
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;