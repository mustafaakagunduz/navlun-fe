// src/app/dashboard/page.tsx
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            // Rolüne göre yönlendirme
            if (user.role === 'ADMIN') {
                router.push('/dashboard/admin');
            } else if (user.role === 'SENDER') {
                router.push('/dashboard/sender');
            } else if (user.role === 'CARRIER') {
                router.push('/dashboard/carrier');
            }
        } else if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [user, isAuthenticated, isLoading, router]);

    // Yükleme durumunda gösterilecek içerik
    if (isLoading || (isAuthenticated && user)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    return null;
}