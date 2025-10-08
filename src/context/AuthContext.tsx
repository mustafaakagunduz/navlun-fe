'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

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
    completeEmailVerification: (accessToken?: string, refreshToken?: string, userEmail?: string) => Promise<void>;
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

// Helper function - component dışında
const getDashboardRoute = (role: string): string => {
    switch (role) {
        case 'SENDER':
            return '/dashboard/sender';
        case 'CARRIER':
            return '/dashboard/carrier';
        case 'BROKER':
            return '/dashboard/broker';
        case 'ADMIN':
            return '/dashboard/admin';
        default:
            return '/dashboard';
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(defaultState);
    const router = useRouter();
    const { toast } = useToast();

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

            // Check if 2FA is required
            if (response.requires2FA) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    needsVerification: true,
                    verificationUserId: response.userId,
                    verificationEmail: email,
                    verificationPassword: password,
                    error: null,
                }));
                return;
            }

            // If no 2FA required (old flow), proceed with login
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

            const dashboardUrl = getDashboardRoute(user.role);
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
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (refreshTokenValue) await authService.logout(refreshTokenValue);
        } finally {
            localStorage.clear();
            setState({ ...defaultState, isLoading: false });
            router.push('/');
        }
    };

    const refreshToken = async (): Promise<boolean> => {
        const refreshTokenValue = localStorage.getItem('refreshToken');
        if (!refreshTokenValue) return false;

        try {
            const response = await authService.refreshToken(refreshTokenValue);
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            return true;
        } catch {
            return false;
        }
    };

    const clearError = () => setState(prev => ({ ...prev, error: null }));

    // completeEmailVerification fonksiyonunu güncelle
    const completeEmailVerification = async (accessToken?: string, refreshToken?: string, userEmail?: string) => {
        try {
            if (accessToken && refreshToken && userEmail) {
                // Token'lar sağlandıysa direkt login yap
                console.log('Completing email verification with auto-login');

                // Token'ları kaydet
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userEmail', userEmail);

                // Kullanıcı bilgilerini çek
                const userData = await authService.getCurrentUser();

                // State'i güncelle
                setState({
                    user: userData,
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                });

                // Ana sayfaya yönlendir
                router.push('/');

                toast({
                    title: "Kayıt Başarılı",
                    description: "Hesabınız başarıyla oluşturuldu ve giriş yaptınız.",
                    variant: "default"
                });
            } else {
                // Normal verification completion (eski yöntem)
                setState(prev => ({
                    ...prev,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                }));

                toast({
                    title: "E-posta Doğrulandı",
                    description: "E-posta adresiniz doğrulandı. Lütfen giriş yapın.",
                    variant: "default"
                });

                router.push('/login');
            }
        } catch (error) {
            console.error('Email verification completion error:', error);
            setState(prev => ({ ...prev, error: "E-posta doğrulama tamamlanamadı." }));
            toast({
                title: "Hata",
                description: "E-posta doğrulama işlemi tamamlanamadı.",
                variant: "destructive"
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