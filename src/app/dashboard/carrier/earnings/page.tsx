"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    ArrowLeft,
    TrendingUp,
    DollarSign,
    Calendar,
    TruckIcon,
    Award,
    BarChart3,
    Download,
    Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import carrierService from "@/services/carrierService";

export default function CarrierEarningsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'CARRIER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated || user?.role !== 'CARRIER') return;

            try {
                setLoading(true);
                const stats = await carrierService.getCurrentUserStatistics();
                setStatistics(stats);
            } catch (error: any) {
                console.error('Error loading earnings:', error);
                toast({
                    title: "Hata",
                    description: "Kazanç verileri yüklenirken bir hata oluştu",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, user]);

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    <p className="text-purple-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Geri
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Kazanç Raporu
                            </h1>
                            <p className="text-gray-600 mt-1">Detaylı gelir analizi ve performans göstergeleri</p>
                        </div>
                        <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                            <Download className="h-4 w-4" />
                            Rapor İndir
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Kazanç</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {carrierService.formatCurrency(statistics?.totalEarnings || 0)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Bu Ay</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {carrierService.formatCurrency(statistics?.monthlyEarnings || 0)}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                            <span className="text-xs text-green-600">+{statistics?.monthlyGrowth || 0}%</span>
                                        </div>
                                    </div>
                                    <Calendar className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ortalama/Teslimat</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {carrierService.formatCurrency((statistics?.totalEarnings || 0) / Math.max((statistics?.completedDeliveries || 1), 1))}
                                        </p>
                                    </div>
                                    <TruckIcon className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-yellow-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">En Karlı Rota</p>
                                        <p className="text-lg font-bold text-yellow-600">
                                            {statistics?.topRoutes?.[0]?.route || 'Veri yok'}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {carrierService.formatCurrency(statistics?.topRoutes?.[0]?.earnings || 0)}
                                        </p>
                                    </div>
                                    <Award className="h-12 w-12 text-yellow-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Breakdown */}
                    <Card className="shadow-lg mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                Aylık Kazanç Dağılımı
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { month: 'Kasım 2025', amount: statistics?.monthlyEarnings || 0, deliveries: 12, color: 'purple' },
                                    { month: 'Ekim 2025', amount: (statistics?.monthlyEarnings || 0) * 0.9, deliveries: 11, color: 'blue' },
                                    { month: 'Eylül 2025', amount: (statistics?.monthlyEarnings || 0) * 0.85, deliveries: 10, color: 'green' },
                                    { month: 'Ağustos 2025', amount: (statistics?.monthlyEarnings || 0) * 0.8, deliveries: 9, color: 'yellow' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900">{item.month}</span>
                                                <span className="font-bold text-purple-600">{carrierService.formatCurrency(item.amount)}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>{item.deliveries} teslimat</span>
                                                <span>Ort: {carrierService.formatCurrency(item.amount / item.deliveries)}/teslimat</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Routes by Earnings */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                En Karlı Rotalar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(statistics?.topRoutes || []).map((route: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg border border-yellow-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{route.route}</p>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span>{route.count} sefer</span>
                                                    <span>{route.distanceKm} km</span>
                                                    <span>${route.pricePerKm.toFixed(2)}/km</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-purple-600">{carrierService.formatCurrency(route.earnings)}</p>
                                            <Badge variant="outline" className="mt-1 bg-green-100 text-green-700 border-green-300">
                                                Top {index + 1}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
