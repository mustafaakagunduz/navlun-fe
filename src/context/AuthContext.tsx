// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import verificationService from '@/services/verificationService';

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
};

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(defaultState);
    const router = useRouter();

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
        setState({ ...state, isLoading: true, error: null });

        try {
            const response = await authService.login(email, password);

            // Başarılı giriş - Tokenleri local storage'a kaydet
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            // Güncel kullanıcı bilgisini al
            const user = await authService.getCurrentUser();

            // E-posta doğrulanmış mı kontrolü
            if (!user.emailVerified) {
                // Email doğrulanmamış, hata göster
                setState({
                    ...state,
                    isLoading: false,
                    isAuthenticated: false,
                    error: 'E-posta adresiniz doğrulanmamış. Lütfen doğrulama kodu ile hesabınızı onaylayın.',
                    needsVerification: true,
                    verificationUserId: user.id,
                    verificationEmail: email,
                });

                // Tokenleri temizle
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return;
            }

            // E-posta doğrulanmışsa, kullanıcıyı oturum açmış olarak ayarla
            setState({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
                needsVerification: false,
                verificationUserId: null,
                verificationEmail: null,
            });

            // Role göre yönlendirme
            if (user.role === 'ADMIN') {
                router.push('/dashboard/admin');
            } else if (user.role === 'SENDER') {
                router.push('/dashboard/sender');
            } else if (user.role === 'CARRIER') {
                router.push('/dashboard/carrier');
            } else if (user.role === 'BROKER') {
                router.push('/dashboard/broker');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setState({
                ...state,
                isLoading: false,
                error: error.response?.data?.message || 'Giriş başarısız oldu. Lütfen e-posta ve şifrenizi kontrol edin.',
            });
        }
    };

    // Signup function
    const signup = async (userData: any): Promise<User | null> => {
        setState({ ...state, isLoading: true, error: null });

        try {
            const user = await authService.signup(userData);

            // Set verification need
            setState({
                ...state,
                isLoading: false,
                needsVerification: true,
                verificationUserId: user.id,
                verificationEmail: userData.email,
                error: null,
            });

            return user;
        } catch (error: any) {
            console.error('Signup error:', error);
            setState({
                ...state,
                isLoading: false,
                error: error.response?.data?.message || 'Kayıt işlemi sırasında bir hata oluştu.',
            });
            return null;
        }
    };

    // Logout function
    const logout = async () => {
        setState({ ...state, isLoading: true });

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
        setState({ ...state, error: null });
    };

    // Email verification completed successfully
    const completeEmailVerification = () => {
        setState({
            ...state,
            needsVerification: false,
            verificationUserId: null,
            verificationEmail: null,
        });
    };

    // Cancel email verification
    const cancelEmailVerification = () => {
        setState({
            ...state,
            needsVerification: false,
            verificationUserId: null,
            verificationEmail: null,
        });
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