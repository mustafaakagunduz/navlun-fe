// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import apiService from '@/services/apiService';

// User type definition - role içerisine BROKER eklendi
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER'; // BROKER rolü eklendi
};

// Auth state type
type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
};

// Context content type
type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
};

// Default values
const defaultState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
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

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);

            // Get user profile info
            const user = await authService.getCurrentUser();

            setState({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            });

            // Dashboard sayfasına yönlendirme
            router.push('/dashboard');
        } catch (error: any) {
            setState({
                ...state,
                isLoading: false,
                isAuthenticated: false,
                error: error.response?.data?.message || 'Kullanıcı Adı veya Şifre hatalı', // Default error message in Turkish
            });

            // We don't redirect to login page on error since we're already on the login page
        }
    };

    // Signup function - signup fonksiyonuna broker rolü otomatik olarak dahil olacak
    const signup = async (userData: any) => {
        setState({ ...state, isLoading: true, error: null });

        try {
            await authService.signup(userData);

            // Redirect to login page with success message
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
                error: error.response?.data?.message || 'Signup failed',
            });
        }
    };

    // Logout function
    const logout = async () => {
        setState({ ...state, isLoading: true });

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                // Cancel refresh token on server
                await authService.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clean tokens from local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
            });

            // Redirect to login page
            router.push('/');
        }
    };

    // Token refresh function
    const refreshToken = async (): Promise<boolean> => {
        try {
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (!refreshTokenValue) return false;

            const response = await authService.refreshToken(refreshTokenValue);

            localStorage.setItem('accessToken', response.accessToken);
            // Update refresh token if a new one was returned
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
            }

            // Get updated user info after successful refresh
            const user = await authService.getCurrentUser();

            setState({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            });

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    // Clear error function
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