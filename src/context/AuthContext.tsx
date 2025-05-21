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
    emailVerified?: boolean; // E-posta doğrulama durumu eklendi
};

// Auth state type
type AuthState = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    needsVerification: boolean; // E-posta doğrulama ihtiyacı
    verificationUserId: string | null; // Doğrulama için kullanıcı ID'si
    verificationEmail: string | null; // Doğrulama için e-posta adresi
};

// Context content type
type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<User | null>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
    completeEmailVerification: () => void; // Doğrulama tamamlandığında çağrılacak
    cancelEmailVerification: () => void; // Doğrulama iptal edildiğinde çağrılacak
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

            // Check if user's email is verified
            const user = await authService.getCurrentUser();

            if (!user.emailVerified) {
                // E-posta doğrulanmamış, hata göster
                setState({
                    ...state,
                    isLoading: false,
                    isAuthenticated: false,
                    error: 'auth.errors.accountNotVerified',
                    needsVerification: true,
                    verificationUserId: user.id,
                    verificationEmail: email,
                });

                // Tokenleri temizle
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken