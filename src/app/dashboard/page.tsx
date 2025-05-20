"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Sidebar from "@/app/dashboard/Sidebar";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    // Giriş yapmamış kullanıcıları login sayfasına yönlendir
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Yükleme durumunda gösterilecek içerik
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">{t("dashboard.page.loading")}</p>
                </div>
            </div>
        );
    }

    // Role göre dashboard rengini belirle
    const getDashboardColor = (role: string) => {
        switch(role) {
            case 'ADMIN':
                return 'text-green-600';
            case 'SENDER':
                return 'text-blue-600';
            case 'CARRIER':
                return 'text-purple-600';
            case 'BROKER':
                return 'text-amber-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">{t("dashboard.page.title")}</h1>

                        <div className="flex items-center justify-center h-[70vh]">
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

                                        <p className="mt-6 text-gray-600">
                                            {t("dashboard.page.greeting")}, <span className="font-bold">{user?.firstName} {user?.lastName}</span>!
                                            <br />
                                            {user?.email}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}