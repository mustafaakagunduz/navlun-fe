"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Package, Settings, CheckCircle, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    // Giriş yapmamış veya admin olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

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

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="flex h-[calc(100vh-4rem)]">


                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold mb-4">{t("adminPage.title")}</h1>
                        <p className="text-gray-600 mb-8">{t("adminPage.description")}</p>

                        {/* Quick Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-green-100">
                                            <Users className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("adminPage.userManagement")}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-blue-100">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("adminPage.loadManagement")}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <Settings className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("adminPage.systemSettings")}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistics */}
                        <h2 className="text-2xl font-bold mb-4">{t("adminPage.statistics")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("adminPage.totalUsers")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">1,250</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("adminPage.activeSenders")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">785</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("adminPage.activeCarriers")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">465</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("adminPage.totalLoads")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">2,430</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("adminPage.pendingLoads")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">248</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("adminPage.completedLoads")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">1,982</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}