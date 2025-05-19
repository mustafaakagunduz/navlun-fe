"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, TruckIcon, Calendar, Settings, BarChart3, CheckCircle, MapPin } from "lucide-react";
import Sidebar from "@/app/dashboard/Sidebar";
import { useLanguage } from "@/context/LanguageContext";

export default function CarrierDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    // Giriş yapmamış veya carrier olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'CARRIER')) {
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
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold mb-4">{t("carrierPage.title")}</h1>
                        <p className="text-gray-600 mb-8">{t("carrierPage.description")}</p>

                        {/* Quick Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-blue-100">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("carrierPage.availableLoads")}</h3>
                                            <span className="text-gray-500">42</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-green-100">
                                            <TruckIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("carrierPage.myDeliveries")}</h3>
                                            <span className="text-gray-500">8</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-amber-100">
                                            <Calendar className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("carrierPage.schedule")}</h3>
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
                                            <h3 className="font-bold text-lg">{t("carrierPage.vehicleManagement")}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistics */}
                        <h2 className="text-2xl font-bold mb-4">{t("carrierPage.statistics")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("carrierPage.activeDeliveries")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">8</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("carrierPage.completedDeliveries")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">142</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("carrierPage.totalDistance")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">24,850 km</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("carrierPage.totalEarnings")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">₺187,320</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}