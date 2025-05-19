// src/components/ProtectedRoute.tsx
'use client';

import { useAuth} from "@/context/AuthContext";
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useLanguage } from "@/context/LanguageContext";

type ProtectedRouteProps = {
    children: ReactNode;
    allowedRoles?: string[];
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
        if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
            // Yetkisiz erişim, dashboard'a yönlendir
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

    // Yükleme durumunda veya kimlik doğrulama başarısız olduğunda boş sayfa göster
    if (isLoading || !isAuthenticated) {
        return <div className="flex items-center justify-center h-screen">{t("dashboard.protectedRoute.loading")}</div>;
    }

    // Rol kontrolü başarısız olduğunda boş sayfa göster
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return <div className="flex items-center justify-center h-screen">{t("dashboard.protectedRoute.accessDenied")}</div>;
    }

    // İçeriği göster
    return <>{children}</>;
}