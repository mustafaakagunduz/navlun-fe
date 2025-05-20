"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Package,
    HandshakeIcon,
    DollarSign,
    BarChart3,
    Users,
    PlusCircle,
    Leaf,
    Building, Truck
} from "lucide-react";
import Sidebar from "@/app/dashboard/Sidebar";
import { useLanguage } from "@/context/LanguageContext";

export default function BrokerDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    // Giriş yapmamış veya broker olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
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
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">{t("brokerPage.title")}</h1>
                                <p className="text-gray-600 mt-2">{t("brokerPage.description")}</p>
                            </div>
                            <Button className="bg-amber-600 hover:bg-amber-700">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                {t("brokerPage.createNewDeal")}
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
                                            <h3 className="font-bold text-lg">{t("brokerPage.availableLoads")}</h3>
                                            <span className="text-gray-500">35</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-amber-100">
                                            <HandshakeIcon className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("brokerPage.activeDeals")}</h3>
                                            <span className="text-gray-500">12</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-green-100">
                                            <Building className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("brokerPage.pendingDeals")}</h3>
                                            <span className="text-gray-500">7</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-purple-100">
                                            <DollarSign className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{t("brokerPage.totalCommission")}</h3>
                                            <span className="text-gray-500">₺12.500</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistics */}
                        <h2 className="text-2xl font-bold mb-4">{t("brokerPage.statistics")}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("brokerPage.totalDeals")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">45</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("brokerPage.ecoFriendlyDeals")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <span className="text-3xl font-bold">23</span>
                                        <Leaf className="h-5 w-5 text-green-600 ml-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("brokerPage.totalCommission")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">₺32.500</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("brokerPage.pendingCommission")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">₺6.750</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("brokerPage.topCarriers")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                        <Truck className="h-4 w-4 text-amber-600" />
                                                    </div>
                                                    <span className="font-medium">Taşımacı {i}</span>
                                                </div>
                                                <span className="text-gray-600">{11 - i} anlaşma</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold">{t("brokerPage.topSenders")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                        <Package className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium">Gönderici {i}</span>
                                                </div>
                                                <span className="text-gray-600">{10 - i} yük</span>
                                            </div>
                                        ))}
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