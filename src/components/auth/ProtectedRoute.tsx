// src/components/ProtectedRoute.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";

type ProtectedRouteProps = {
    children: ReactNode;
    allowedRoles?: ('ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER')[]; // Role tiplerini union type olarak güncelledik
};

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        // Yükleme durumunda bekle
        if (isLoading) return;

        // Kimlik doğrulama kontrolü
        if (!isAuthenticated) {
            router.push('/');
            return;
        }

        // Rol kontrolü
        if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role as any)) {
            // Yetkisiz erişim, dashboard'a yönlendir
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

    // Her role göre erişim kısıtlaması için basit helper fonksiyon
    const isAllowed = (user: any, allowedRoles: ('ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER')[]): boolean => {
        if (!user) return false;
        if (allowedRoles.length === 0) return true; // Hiç izin belirtilmemişse herkes erişebilir
        return allowedRoles.includes(user.role as any);
    };

    // Yükleme durumunda veya kimlik doğrulama başarısız olduğunda boş sayfa göster
    if (isLoading || !isAuthenticated) {
        return <div className="flex items-center justify-center h-screen">{t("dashboard.protectedRoute.loading")}</div>;
    }

    // Rol kontrolü başarısız olduğunda boş sayfa göster
    if (allowedRoles.length > 0 && user && !isAllowed(user, allowedRoles)) {
        return <div className="flex items-center justify-center h-screen">{t("dashboard.protectedRoute.accessDenied")}</div>;
    }

    // İçeriği göster
    return <>{children}</>;
}