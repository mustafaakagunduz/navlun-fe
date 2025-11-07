"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    ArrowLeft,
    CheckCircle,
    Package,
    MapPin,
    Calendar,
    TruckIcon,
    Search,
    Award,
    Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import deliveryService, { DeliveryTrackingData } from "@/services/deliveryService";
import { formatDateTime, formatDate } from '@/utils/dateUtils';

export default function CarrierCompletedDeliveriesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [deliveries, setDeliveries] = useState<DeliveryTrackingData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

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
                const trackings = await deliveryService.getCarrierTrackings();
                // Sadece teslim edilmiş olanları filtrele
                const completed = trackings.filter(t => t.currentStep === 'DELIVERED' || t.currentStep === 'COMPLETED');
                setDeliveries(completed);
            } catch (error: any) {
                console.error('Error loading completed deliveries:', error);
                toast({
                    title: "Hata",
                    description: "Tamamlanmış teslimatlar yüklenirken bir hata oluştu",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthenticated, user]);

    const filteredDeliveries = deliveries.filter(delivery =>
        delivery.loadTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.pickupLocation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        delivery.deliveryLocation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    const totalDeliveries = deliveries.length;
    const completionRate = totalDeliveries > 0 ? Math.round((deliveries.filter(d => d.currentStep === 'COMPLETED').length / totalDeliveries) * 100) : 0;

    return (
        <ProtectedRoute allowedRoles={['CARRIER']}>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Geri
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Tamamlanan Teslimatlar
                            </h1>
                            <p className="text-gray-600 mt-1">Başarıyla tamamladığınız tüm teslimatlar</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Teslimat</p>
                                        <p className="text-3xl font-bold text-green-600">{totalDeliveries}</p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tamamlanma Oranı</p>
                                        <p className="text-3xl font-bold text-emerald-600">{completionRate}%</p>
                                    </div>
                                    <Award className="h-12 w-12 text-emerald-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-yellow-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                                        <p className="text-3xl font-bold text-yellow-600">4.8</p>
                                        <div className="flex items-center mt-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                            ))}
                                        </div>
                                    </div>
                                    <Star className="h-12 w-12 text-yellow-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <Card className="shadow-lg mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder="Teslimat ara (yük, nereden, nereye)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deliveries List */}
                    {filteredDeliveries.length === 0 ? (
                        <Card className="shadow-lg">
                            <CardContent className="p-12 text-center">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">
                                    {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz tamamlanmış teslimat bulunmuyor'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredDeliveries.map((delivery) => (
                                <Card key={delivery.id} className="shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">{delivery.loadTitle}</h3>
                                                        <Badge className="bg-green-100 text-green-700 border-green-300">
                                                            Tamamlandı
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Nereden</p>
                                                            <p className="text-sm font-medium text-gray-900">{delivery.pickupLocation}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Nereye</p>
                                                            <p className="text-sm font-medium text-gray-900">{delivery.deliveryLocation}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Calendar className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Alım Tarihi</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {delivery.pickupDate ? formatDate(delivery.pickupDate) : 'Belirtilmemiş'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Calendar className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Teslim Tarihi</p>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {delivery.deliveryDate ? formatDate(delivery.deliveryDate) : 'Belirtilmemiş'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push(`/dashboard/carrier/delivery-tracking`)}
                                                    className="w-full md:w-auto"
                                                >
                                                    Detayları Gör
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
