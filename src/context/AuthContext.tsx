// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

// User type definition
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER';
    emailVerified?: boolean;
};

// Auth state type
type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    needsVerification: boolean;
    verificationUserId: string | null;
    verificationEmail: string | null;
    verificationPassword: string | null; // Verification sonrası otomatik login için
};

// Context content type
type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<User | null>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
    completeEmailVerification: () => void;
    cancelEmailVerification: () => void;
};

// Default values
const defaultState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    needsVerification: false,
    verificationUserId: null,
    verificationEmail: null,
    verificationPassword: null,
};

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(defaultState);
    const router = useRouter();

    // Role'e göre dashboard URL'ini döndür
    const getDashboardUrl = (role: string): string => {
        switch (role) {
            case 'ADMIN':
                return '/dashboard/admin';
            case 'SENDER':
                return '/dashboard/sender';
            case 'CARRIER':
                return '/dashboard/carrier';
            case 'BROKER':
                return '/dashboard/broker';
            default:
                return '/dashboard';
        }
    };

    // Verify token and get user information
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

                // Get user profile info
                const user = await authService.getCurrentUser();

                setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                });
            } catch (error) {
                console.error('Auth verification failed:', error);

                // Try to refresh the token
                const refreshed = await refreshToken();

                // If refresh failed, clear local storage and update state
                if (!refreshed) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    setState({
                        ...defaultState,
                        isLoading: false,
                    });
                }
            }
        };

        verifyToken();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await authService.login(email, password);

            // Başarılı giriş - Tokenleri local storage'a kaydet
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            // Güncel kullanıcı bilgisini al
            const user = await authService.getCurrentUser();

            setState({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
                needsVerification: false,
                verificationUserId: null,
                verificationEmail: null,
                verificationPassword: null,
            });

            // Role göre yönlendirme
            const dashboardUrl = getDashboardUrl(user.role);
            router.push(dashboardUrl);

        } catch (error: any) {
            console.error('Login error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Giriş başarısız oldu. Lütfen e-posta ve şifrenizi kontrol edin.',
            }));
        }
    };

    // Signup function
    const signup = async (userData: any): Promise<User | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const user = await authService.signup(userData);

            // Email doğrulama gerekli - verification state'ini ayarla ve şifreyi sakla
            setState(prev => ({
                ...prev,
                isLoading: false,
                needsVerification: true,
                verificationUserId: user.id,
                verificationEmail: userData.email,
                verificationPassword: userData.password, // Otomatik login için şifreyi sakla
                error: null,
            }));

            return user;
        } catch (error: any) {
            console.error('Signup error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Kayıt işlemi sırasında bir hata oluştu.',
            }));
            return null;
        }
    };

    // Logout function
    const logout = async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and reset state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            setState({
                ...defaultState,
                isLoading: false,
            });

            // Redirect to home
            router.push('/');
        }
    };

    // Refresh token function
    const refreshToken = async (): Promise<boolean> => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const response = await authService.refreshToken(refreshToken);

            // Save new tokens
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            return false;
        }
    };

    // Clear error function
    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    // Email verification completed successfully
    const completeEmailVerification = async () => {
        // Email doğrulama başarılı - otomatik login yap
        if (state.verificationEmail && state.verificationPassword) {
            try {
                setState(prev => ({ ...prev, isLoading: true }));

                // Otomatik login yap
                const response = await authService.login(state.verificationEmail, state.verificationPassword);

                // Başarılı giriş - Tokenleri local storage'a kaydet
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);

                // Güncel kullanıcı bilgisini al
                const user = await authService.getCurrentUser();

                setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                });

                // Role göre yönlendirme
                const dashboardUrl = getDashboardUrl(user.role);
                router.push(dashboardUrl);

            } catch (error) {
                console.error('Auto-login after verification failed:', error);

                // Login başarısız olursa sadece verification'ı temizle
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                    error: 'Email doğrulandı ancak otomatik giriş başarısız. Lütfen manuel giriş yapın.',
                }));

                // Manuel giriş için login sayfasına yönlendir
                router.push('/auth/login');
            }
        } else {
            // Email ve password bilgisi yoksa sadece verification state'ini temizle
            setState(prev => ({
                ...prev,
                needsVerification: false,
                verificationUserId: null,
                verificationEmail: null,
                verificationPassword: null,
            }));

            // Manuel giriş için login sayfasına yönlendir
            router.push('/auth/login');
        }
    };

    // Cancel email verification
    const cancelEmailVerification = () => {
        setState(prev => ({
            ...prev,
            needsVerification: false,
            verificationUserId: null,
            verificationEmail: null,
            verificationPassword: null,
        }));
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
                completeEmailVerification,
                cancelEmailVerification,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}