'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { setCookie, removeCookie, clearAllAuthCookies } from '@/lib/cookieUtils';

// User type definition
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER' | 'PENDING';
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
    setUser: (user: User) => void;
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
        case 'PENDING':
            return '/auth/select-role';
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

            // Token'ları hem localStorage hem cookie'ye kaydet
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            setCookie('accessToken', response.accessToken, 7);
            setCookie('refreshToken', response.refreshToken, 7);

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

            // Dashboard'a yönlendir ve hard refresh yap
            const dashboardUrl = getDashboardRoute(user.role);
            window.location.href = dashboardUrl; // Hard refresh için

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Giriş başarısız oldu.';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));

            // Toast mesajı göster
            toast({
                title: "Giriş Başarısız",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    const signup = async (userData: any): Promise<User | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const user = await authService.signup(userData);

            // GEÇICI: Email doğrulama pasif - direkt login yap
            // Kayıttan sonra otomatik login
            try {
                const loginResponse = await authService.login(userData.email, userData.password);

                // Token'ları hem localStorage hem cookie'ye kaydet
                localStorage.setItem('accessToken', loginResponse.accessToken);
                localStorage.setItem('refreshToken', loginResponse.refreshToken);
                setCookie('accessToken', loginResponse.accessToken, 7);
                setCookie('refreshToken', loginResponse.refreshToken, 7);

                const currentUser = await authService.getCurrentUser();

                setState({
                    user: currentUser,
                    isLoading: false,
                    isAuthenticated: true,
                    error: null,
                    needsVerification: false,
                    verificationUserId: null,
                    verificationEmail: null,
                    verificationPassword: null,
                });

                toast({
                    title: "Kayıt Başarılı",
                    description: "Hesabınız başarıyla oluşturuldu ve giriş yaptınız.",
                    variant: "default"
                });

                // Dashboard'a yönlendir ve hard refresh yap
                const dashboardUrl = getDashboardRoute(currentUser.role);
                window.location.href = dashboardUrl; // Hard refresh için

                return user;
            } catch (loginError) {
                // Login başarısız olduysa, eski akışa geri dön
                console.error('Auto-login failed:', loginError);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    needsVerification: false,
                    error: 'Kayıt başarılı ancak otomatik giriş yapılamadı. Lütfen manuel olarak giriş yapın.',
                }));

                toast({
                    title: "Kayıt Başarılı",
                    description: "Hesabınız oluşturuldu. Lütfen giriş yapın.",
                    variant: "default"
                });

                return user;
            }
        } catch (error: any) {
            // Backend'den dönen tam hata detaylarını göster
            console.error('❌ AuthContext signup error FULL DETAILS:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.response?.data?.message,
                fullData: error.response?.data,
                errorType: typeof error.response?.data?.message
            });

            const errorMessage = error.response?.data?.message || 'Kayıt sırasında hata oluştu.';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));

            // Toast mesajı göster - detaylı hata analizi ile
            const errorLowerCase = errorMessage.toLowerCase();

            if (errorLowerCase.includes('e-posta') || errorLowerCase.includes('email') ||
                errorLowerCase.includes('zaten') || errorLowerCase.includes('already exists') ||
                errorLowerCase.includes('duplicate') || errorLowerCase.includes('conflict')) {
                toast({
                    title: "E-posta Zaten Kullanılıyor",
                    description: "Bu e-posta adresi ile daha önce kayıt olunmuş. Lütfen farklı bir e-posta deneyin veya giriş yapın.",
                    variant: "destructive"
                });
            } else if (errorLowerCase.includes('telefon') || errorLowerCase.includes('phone')) {
                toast({
                    title: "Telefon Numarası Zaten Kullanılıyor",
                    description: "Bu telefon numarası ile daha önce kayıt olunmuş. Lütfen farklı bir numara deneyin.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Kayıt Başarısız",
                    description: errorMessage,
                    variant: "destructive"
                });
            }

            return null;
        }
    };

    const logout = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (refreshTokenValue) await authService.logout(refreshTokenValue);
        } finally {
            // Tüm storage ve cookie'leri temizle
            localStorage.clear();
            sessionStorage.clear();
            clearAllAuthCookies();

            setState({ ...defaultState, isLoading: false });

            // Hard refresh ile ana sayfaya git
            window.location.href = '/';
        }
    };

    const refreshToken = async (): Promise<boolean> => {
        const refreshTokenValue = localStorage.getItem('refreshToken');
        if (!refreshTokenValue) return false;

        try {
            const response = await authService.refreshToken(refreshTokenValue);
            // Token'ları hem localStorage hem cookie'ye kaydet
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            setCookie('accessToken', response.accessToken, 7);
            setCookie('refreshToken', response.refreshToken, 7);
            return true;
        } catch {
            return false;
        }
    };

    const clearError = () => setState(prev => ({ ...prev, error: null }));

    const setUser = (user: User) => {
        setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
        }));
    };

    // completeEmailVerification fonksiyonunu güncelle
    const completeEmailVerification = async (accessToken?: string, refreshToken?: string, userEmail?: string) => {
        try {
            if (accessToken && refreshToken && userEmail) {
                // Token'lar sağlandıysa direkt login yap
                console.log('Completing email verification with auto-login');

                // Token'ları hem localStorage hem cookie'ye kaydet
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('userEmail', userEmail);
                setCookie('accessToken', accessToken, 7);
                setCookie('refreshToken', refreshToken, 7);

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

                toast({
                    title: "Kayıt Başarılı",
                    description: "Hesabınız başarıyla oluşturuldu ve giriş yaptınız.",
                    variant: "default"
                });

                // Ana sayfaya hard refresh ile yönlendir
                window.location.href = '/';
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
                setUser,
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