"use client"

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        if (user?.role) {
            const roleBasedRoute = getDashboardRoute(user.role);
            if (roleBasedRoute !== '/dashboard') {
                router.replace(roleBasedRoute);
            }
        }
    }, [user, router]);

    // Sadece loading kontrolü - middleware protected route kontrolü yapıyor
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // User yoksa middleware yönlendirecek
    if (!user) {
        return null;
    }

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">{t("dashboard.page.title")}</h1>

                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="w-full max-w-lg shadow-lg border-2">
                        <CardContent className="p-12">
                            <div className="text-center">
                                {user?.role === 'ADMIN' && (
                                    <h2 className="text-3xl font-bold text-green-600">{t("dashboard.page.adminDashboard")}</h2>
                                )}

                                {user?.role === 'SENDER' && (
                                    <h2 className="text-3xl font-bold text-blue-600">{t("dashboard.page.senderDashboard")}</h2>
                                )}

                                {user?.role === 'CARRIER' && (
                                    <h2 className="text-3xl font-bold text-purple-600">{t("dashboard.page.carrierDashboard")}</h2>
                                )}

                                {user?.role === 'BROKER' && (
                                    <h2 className="text-3xl font-bold text-amber-600">{t("dashboard.page.brokerDashboard")}</h2>
                                )}

                                {user?.role === 'PENDING' && (
                                    <div className="text-center">
                                        <h2 className="text-3xl font-bold text-orange-600">Hesap Türü Seçilmedi</h2>
                                        <p className="mt-4 text-gray-600">Hesap türünü seçmek için yönlendiriliyorsunuz...</p>
                                    </div>
                                )}

                                {user?.role !== 'PENDING' && (
                                    <p className="mt-6 text-gray-600">
                                        {t("dashboard.page.greeting")}, <span className="font-bold">{user?.firstName} {user?.lastName}</span>!
                                        <br />
                                        {user?.email}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}