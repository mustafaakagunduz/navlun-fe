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
    phone?: string;
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
    verificationPassword: string | null;
};

// Context content type
type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<User | null>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
    completeEmailVerification: () => Promise<void>;
    cancelEmailVerification: () => void;
};

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(defaultState);
    const router = useRouter();

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

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    setState({ ...defaultState, isLoading: false });
                    return;
                }

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
                const refreshed = await refreshToken();
                if (!refreshed) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setState({ ...defaultState, isLoading: false });
                }
            }
        };

        verifyToken();
    }, []);

    const login = async (email: string, password: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await authService.login(email, password);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

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

            const dashboardUrl = getDashboardUrl(user.role);
            router.push(dashboardUrl);

        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Giriş başarısız oldu.',
            }));
        }
    };

    const signup = async (userData: any): Promise<User | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const user = await authService.signup(userData);

            setState(prev => ({
                ...prev,
                isLoading: false,
                needsVerification: true,
                verificationUserId: user.id,
                verificationEmail: userData.email,
                verificationPassword: userData.password,
                error: null,
            }));

            return user;
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Kayıt sırasında hata oluştu.',
            }));
            return null;
        }
    };

    const logout = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) await authService.logout(refreshToken);
        } finally {
            localStorage.clear();
            setState({ ...defaultState, isLoading: false });
            router.push('/');
        }
    };

    const refreshToken = async (): Promise<boolean> => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const response = await authService.refreshToken(refreshToken);
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            return true;
        } catch {
            return false;
        }
    };

    const clearError = () => setState(prev => ({ ...prev, error: null }));

    const completeEmailVerification = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            // Token'lar zaten localStorage'da varsa direkt kullanıcı bilgilerini al
            const token = localStorage.getItem('accessToken');
            if (token) {
                console.log('Using existing tokens from localStorage');
                const user = await authService.getCurrentUser();

                setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                    error: null,
                });

                const dashboardUrl = getDashboardUrl(user.role);
                console.log('Redirecting to:', dashboardUrl);
                router.push(dashboardUrl);
                return;
            }

            // Token yoksa eski yöntemle login yap (fallback)
            if (state.verificationEmail && state.verificationPassword) {
                console.log('No tokens found, doing manual login');
                const loginRes = await authService.login(state.verificationEmail, state.verificationPassword);
                localStorage.setItem('accessToken', loginRes.accessToken);
                localStorage.setItem('refreshToken', loginRes.refreshToken);

                const user = await authService.getCurrentUser();

                setState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                    error: null,
                });

                const dashboardUrl = getDashboardUrl(user.role);
                router.push(dashboardUrl);
            } else {
                throw new Error("Login credentials missing");
            }
        } catch (error) {
            console.error('Auto-login error:', error);
            setState({
                ...state,
                isLoading: false,
                needsVerification: false,
                verificationUserId: null,
                verificationEmail: null,
                verificationPassword: null,
                error: "Doğrulama başarılı ancak otomatik giriş yapılamadı. Lütfen giriş yapın.",
            });
        }
    };

    const cancelEmailVerification = () => {
        setState(prev => ({
            ...prev,
            needsVerification: false,
            verificationUserId: null,
            verificationEmail: null,
            verificationPassword: null,
        }));
        router.push('/login');
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
