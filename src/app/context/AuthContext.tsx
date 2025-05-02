// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/apiService';
import { useRouter } from 'next/navigation';

// Kullanıcı tipi tanımı
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
};

// Auth durumu tipi
type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
};

// Context içeriği tipi
type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
};

// Varsayılan değerler
const defaultState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
};

// Auth Context oluşturma
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider bileşeni
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(defaultState);
    const router = useRouter();

    // Token doğrulama ve kullanıcı bilgisini alma
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setState({
                        ...defaultState,
                        isLoading: false,
                    });
                    return;
                }

                // Kullanıcı profil bilgisini al
                const user = await apiService.get<User>('/auth/me');

                setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                });
            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                setState({
                    ...defaultState,
                    isLoading: false,
                });
            }
        };

        verifyToken();
    }, []);

    // Giriş işlemi
    const login = async (email: string, password: string) => {
        setState({ ...state, isLoading: true, error: null });

        try {
            const response = await apiService.post<{
                userId: string;
                email: string;
                accessToken: string;
                refreshToken: string;
            }>('/auth/login', { email, password });

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            // Kullanıcı profil bilgisini al
            const user = await apiService.get<User>('/auth/me');

            setState({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            });

            // Ana sayfaya yönlendir
            router.push('/dashboard');
        } catch (error: any) {
            setState({
                ...state,
                isLoading: false,
                isAuthenticated: false,
                error: error.response?.data?.message || 'Giriş başarısız oldu',
            });
        }
    };

    // Kayıt işlemi
    const signup = async (userData: any) => {
        setState({ ...state, isLoading: true, error: null });

        try {
            await apiService.post('/auth/signup', userData);

            // Kayıt başarılı, giriş sayfasına yönlendir
            router.push('/auth/login?registered=true');

            setState({
                ...state,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            setState({
                ...state,
                isLoading: false,
                error: error.response?.data?.message || 'Kayıt işlemi başarısız oldu',
            });
        }
    };

    // Çıkış işlemi
    const logout = async () => {
        setState({ ...state, isLoading: true });

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                // Refresh token'ı sunucuda iptal et
                await apiService.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Her durumda local storage'dan tokenleri temizle
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
            });

            // Giriş sayfasına yönlendir
            router.push('/auth/login');
        }
    };

    // Token yenileme
    const refreshToken = async (): Promise<boolean> => {
        try {
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (!refreshTokenValue) return false;

            const response = await apiService.post<{
                userId: string;
                email: string;
                accessToken: string;
                refreshToken: string;
            }>('/auth/refresh-token', { refreshToken: refreshTokenValue });

            localStorage.setItem('accessToken', response.accessToken);
            // Eğer yeni bir refresh token döndüyse onu da güncelle
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
            }

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            // Token yenileme başarısız, çıkış yap
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
            });

            router.push('/auth/login');
            return false;
        }
    };

    // Hata temizleme
    const clearError = () => {
        setState({ ...state, error: null });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                signup,
                logout,
                refreshToken,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Auth hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}