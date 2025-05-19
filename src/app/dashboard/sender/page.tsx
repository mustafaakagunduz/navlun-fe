"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, FileText, TruckIcon, ClockIcon, BarChart3, PlusCircle, Leaf } from "lucide-react";
import Sidebar from "@/app/dashboard/Sidebar";
import { useLanguage } from "@/context/LanguageContext";

export default function SenderDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    // Giriş yapmamış veya sender olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'SENDER')) {
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
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">{t("senderPage.title")}</h1>
                                <p className="text-gray-600 mt-2">{t("senderPage.description")}</p>
                            </div>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                {t("senderPage.createNewLoad")}
                            </Button>
                        </div>

                        {/* Quick Action Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-blue-100">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("senderPage.myLoads")}</h3>
                                            <span className="text-gray-500">28</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-amber-100">
                                            <FileText className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("senderPage.pendingOffers")}</h3>
                                            <span className="text-gray-500">12</span>
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
                                            <h3 className="font-bold text-lg">{t("senderPage.activeShipments")}</h3>
                                            <span className="text-gray-500">5</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <ClockIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("senderPage.loadHistory")}</h3>
                                            <span className="text-gray-500">87</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistics */}
                        <h2 className="text-2xl font-bold mb-4">{t("senderPage.statistics")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("senderPage.totalLoads")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">120</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("senderPage.completedLoads")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">87</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("senderPage.pendingLoads")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">17</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("senderPage.avgCarbonSaved")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <span className="text-3xl font-bold">28%</span>
                                        <Leaf className="h-5 w-5 text-green-600 ml-2" />
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