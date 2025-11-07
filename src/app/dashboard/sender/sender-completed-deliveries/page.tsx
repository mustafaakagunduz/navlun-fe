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
    CheckCircle,
    Package,
    Calendar,
    MapPin,
    Weight,
    ArrowLeft,
    Search,
    TruckIcon,
    FileText,
    Download
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import loadService, { Load } from "@/services/loadService";
import LoadDetailsDialog from "@/app/dashboard/sender/loads/LoadDetailsDialog";
import { formatDate as formatDateUtil, formatDateTime } from '@/utils/dateUtils';

export default function CompletedDeliveriesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [completedDeliveries, setCompletedDeliveries] = useState<Load[]>([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState<Load[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    // Giriş yapmamış veya sender olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'SENDER')) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch completed deliveries
    useEffect(() => {
        const fetchCompletedDeliveries = async () => {
            if (!user?.id) return;

            setIsDataLoading(true);
            setError(null);

            try {
                const deliveries = await loadService.getCurrentUserCompletedDeliveries();
                setCompletedDeliveries(deliveries);
                setFilteredDeliveries(deliveries);
            } catch (err: any) {
                console.error('Error fetching completed deliveries:', err);
                setError('Tamamlanmış teslimatlar yüklenirken hata oluştu');
                setCompletedDeliveries([]);
                setFilteredDeliveries([]);
            } finally {
                setIsDataLoading(false);
            }
        };

        if (user?.id) {
            fetchCompletedDeliveries();
        }
    }, [user?.id]);

    // Filter deliveries based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredDeliveries(completedDeliveries);
            return;
        }

        const filtered = completedDeliveries.filter(delivery =>
            delivery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.goodsType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.loadingAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredDeliveries(filtered);
    }, [searchTerm, completedDeliveries]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'Teslim Edildi';
            case 'COMPLETED': return 'Tamamlandı';
            default: return status;
        }
    };

    // formatDate artık dateUtils'den geliyor
    const formatDate = (dateString: string) => {
        return formatDateUtil(dateString);
    };

    const handleLoadClick = (load: Load) => {
        setSelectedLoad(load);
        setShowDetailsDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDetailsDialog(false);
        setSelectedLoad(null);
    };

    // Yükleme durumunda gösterilecek içerik
    if (authLoading || isDataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard/sender')}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Geri Dön
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                    Tamamlanmış Teslimatlar
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">
                                    Başarıyla tamamlanan tüm teslimatlarınız
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white rounded-lg px-6 py-4 shadow-md border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Toplam Teslimat</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {completedDeliveries.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Teslimat ara (başlık, mal türü, adres...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-6 text-lg border-gray-200 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="p-6">
                                <p className="text-red-600">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Deliveries List */}
                    {filteredDeliveries.length === 0 ? (
                        <Card className="border-gray-200 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600 mb-2">
                                    {searchTerm ? 'Arama kriterlerine uygun teslimat bulunamadı' : 'Henüz tamamlanmış teslimat bulunmuyor'}
                                </p>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Farklı bir arama terimi deneyin' : 'Teslimatlarınız tamamlandığında burada görünecektir'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredDeliveries.map((delivery) => (
                                <Card
                                    key={delivery.id}
                                    className="border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                                    onClick={() => handleLoadClick(delivery)}
                                >
                                    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                    <CardTitle className="text-xl font-bold text-gray-900">
                                                        {delivery.title}
                                                    </CardTitle>
                                                </div>
                                                <p className="text-gray-600">{delivery.goodsType}</p>
                                            </div>
                                            <Badge className={`${getStatusColor(delivery.status)} px-4 py-2 text-sm font-semibold`}>
                                                {getStatusText(delivery.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Route Information */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Yükleme</p>
                                                        <p className="text-gray-900 font-medium">{delivery.loadingAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Teslimat</p>
                                                        <p className="text-gray-900 font-medium">{delivery.deliveryAddress}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Information */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Yükleme Tarihi</p>
                                                        <p className="text-gray-900 font-medium">{formatDate(delivery.loadingDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="h-5 w-5 text-green-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Teslimat Tarihi</p>
                                                        <p className="text-gray-900 font-medium">{formatDate(delivery.deliveryDate)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Weight and Transport Type */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Weight className="h-5 w-5 text-purple-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Net Ağırlık</p>
                                                        <p className="text-gray-900 font-medium">{delivery.netWeight} kg</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <TruckIcon className="h-5 w-5 text-orange-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Taşıma Türü</p>
                                                        <p className="text-gray-900 font-medium">
                                                            {delivery.transportType === 'SEA' ? 'Deniz' : 'Kara'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {delivery.description && (
                                            <div className="mt-6 pt-6 border-t border-gray-100">
                                                <div className="flex items-start gap-3">
                                                    <FileText className="h-5 w-5 text-gray-600 mt-1" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500 mb-1">Açıklama</p>
                                                        <p className="text-gray-700">{delivery.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer with Action Button */}
                                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                <span>Oluşturulma: {formatDate(delivery.createdAt)}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="border-green-600 text-green-600 hover:bg-green-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLoadClick(delivery);
                                                }}
                                            >
                                                Detayları Görüntüle
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Summary Stats at Bottom */}
                    {filteredDeliveries.length > 0 && (
                        <Card className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 text-white border-none">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {filteredDeliveries.length}
                                        </p>
                                        <p className="text-green-100">Toplam Teslimat</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {(filteredDeliveries.reduce((sum, d) => sum + d.netWeight, 0) / 1000).toFixed(1)} ton
                                        </p>
                                        <p className="text-green-100">Toplam Ağırlık</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {filteredDeliveries.filter(d => d.transportType === 'SEA').length}
                                        </p>
                                        <p className="text-green-100">Deniz Taşımacılığı</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {filteredDeliveries.filter(d => d.transportType === 'LAND').length}
                                        </p>
                                        <p className="text-green-100">Kara Taşımacılığı</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Load Details Dialog */}
                    <LoadDetailsDialog
                        load={selectedLoad}
                        isOpen={showDetailsDialog}
                        onClose={handleCloseDialog}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
