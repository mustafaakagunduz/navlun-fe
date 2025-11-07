'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Loader2,
    Package,
    MapPin,
    Calendar,
    Weight,
    CheckCircle2,
    Search,
    Filter,
    Star,
    DollarSign,
    TruckIcon,
    Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchCompletedDeliveries } from '@/store/slices/loadsSlice';
import { LoadStatus } from '@/services/loadService';
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

export default function CompletedDeliveriesContent() {
    const dispatch = useAppDispatch();
    const {
        completedDeliveries,
        completedDeliveriesLoading
    } = useAppSelector(state => state.loads);

    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        dispatch(fetchCompletedDeliveries());
    }, [dispatch]);

    const formatDateLocal = (dateString: string) => {
        return formatDate(dateString);
    };

    const getStatusBadge = (status: LoadStatus) => {
        switch (status) {
            case LoadStatus.COMPLETED:
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Tamamlandı
                    </Badge>
                );
            case LoadStatus.DELIVERED:
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Teslim Edildi
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {status}
                    </Badge>
                );
        }
    };

    const filteredDeliveries = completedDeliveries?.filter(load =>
        load.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.goodsType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.loadingAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        load.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (completedDeliveriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                    <p className="text-gray-600">Tamamlanan teslimatlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tamamlanan Teslimatlar</h1>
                    <p className="text-gray-600 mt-1">
                        Başarıyla tamamladığınız yükleri görüntüleyin
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {filteredDeliveries.length} teslimat
                    </Badge>
                </div>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Yük başlığı, mal türü veya adres ile arayın..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deliveries List */}
            {filteredDeliveries.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz tamamlanmış teslimat bulunmuyor'}
                        </h3>
                        <p className="text-muted-foreground text-center">
                            {searchTerm
                                ? 'Farklı arama terimleri ile tekrar deneyin.'
                                : 'Teslim ettiğiniz yükler burada görünecektir.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredDeliveries.map((load) => (
                        <Card key={load.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2">{load.title}</CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Package className="h-4 w-4" />
                                            <span>{load.goodsType}</span>
                                            <span className="mx-2">•</span>
                                            <Weight className="h-4 w-4" />
                                            <span>{load.netWeight} kg</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(load.status)}
                                        {load.ecoTransportRequested && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                Çevreci
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Route */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="space-y-1">
                                            <div>
                                                <p className="text-xs text-gray-500">Yükleme Noktası</p>
                                                <p className="text-sm font-medium text-gray-900">{load.loadingAddress}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <div className="h-8 border-l-2 border-dashed ml-2"></div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Teslimat Noktası</p>
                                                <p className="text-sm font-medium text-gray-900">{load.deliveryAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates and Info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Yükleme
                                        </p>
                                        <p className="text-sm font-medium">{formatDateLocal(load.loadingDate)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Teslimat
                                        </p>
                                        <p className="text-sm font-medium">{formatDateLocal(load.deliveryDate)}</p>
                                    </div>
                                    {load.estimatedPrice && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                Fiyat
                                            </p>
                                            <p className="text-sm font-medium text-green-600">
                                                ₺{load.estimatedPrice.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Tamamlanma
                                        </p>
                                        <p className="text-sm font-medium">
                                            {load.updatedAt ? formatDateLocal(load.updatedAt) : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                {load.description && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Açıklama: </span>
                                            {load.description}
                                        </p>
                                    </div>
                                )}

                                {/* Sender Info */}
                                {load.sender && (
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <TruckIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Gönderici</p>
                                                <p className="text-sm font-medium">{load.sender.companyName}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Carbon Footprint */}
                                {load.estimatedCarbonFootprint && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                                        <Package className="h-4 w-4 text-green-600" />
                                        <span>Karbon Ayak İzi: {load.estimatedCarbonFootprint.toFixed(2)} ton CO₂</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Statistics Card */}
            {filteredDeliveries.length > 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{filteredDeliveries.length}</p>
                                <p className="text-sm text-gray-600">Toplam Teslimat</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">
                                    {filteredDeliveries.reduce((sum, load) => sum + load.netWeight, 0).toLocaleString()} kg
                                </p>
                                <p className="text-sm text-gray-600">Toplam Ağırlık</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {filteredDeliveries.filter(load => load.ecoTransportRequested).length}
                                </p>
                                <p className="text-sm text-gray-600">Çevre Dostu</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">
                                    {filteredDeliveries.reduce((sum, load) => sum + (load.estimatedCarbonFootprint || 0), 0).toFixed(1)} ton
                                </p>
                                <p className="text-sm text-gray-600">Toplam CO₂</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
