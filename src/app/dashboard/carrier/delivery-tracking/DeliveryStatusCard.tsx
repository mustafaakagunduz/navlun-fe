// src/app/dashboard/carrier/delivery-tracking/DeliveryStatusCard.tsx - YENİ DOSYA
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    MapPin,
    Calendar,
    Weight,
    Upload,
    Navigation,
    FileText,
    Truck,
    Package,
    Clock,
    Leaf,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { DeliveryTrackingData, DeliveryStep } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { formatDateTime } from '@/utils/dateUtils';

interface DeliveryStatusCardProps {
    delivery: DeliveryTrackingData;
    onUpdateStatus: () => void;
    onUploadDocument: (type: 'pickup' | 'delivery' | 'cancellation') => void;
    onGoToChat: () => void;
    onRefresh: () => void;
}

export default function DeliveryStatusCard({
                                               delivery,
                                               onUpdateStatus,
                                               onUploadDocument,
                                               onGoToChat,
                                               onRefresh
                                           }: DeliveryStatusCardProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // formatDate artık dateUtils'den geliyor
    const formatDate = (dateString: string) => {
        return formatDateTime(dateString);
    };

    const getStatusBadgeColor = (status: DeliveryStep) => {
        const color = deliveryService.getStatusColor(status);
        switch (color) {
            case 'blue':
                return 'bg-blue-100 text-blue-800';
            case 'orange':
                return 'bg-orange-100 text-orange-800';
            case 'purple':
                return 'bg-purple-100 text-purple-800';
            case 'green':
                return 'bg-green-100 text-green-800';
            case 'yellow':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const progress = deliveryService.getStatusProgress(delivery.currentStatus);

    // Dinamik buton mantığı
    const getActionButton = () => {
        // ASSIGNED veya ON_THE_WAY → Yola Çık
        if (delivery.currentStatus === DeliveryStep.ASSIGNED || delivery.currentStatus === DeliveryStep.ON_THE_WAY) {
            return {
                label: 'Yola Çık',
                action: handleStartJourney,
                disabled: loading
            };
        }

        // PICKED_UP ve teslimat belgesi var → Boşaltma Tamamla
        if (delivery.currentStatus === DeliveryStep.PICKED_UP && delivery.deliveryDocuments.length > 0) {
            return {
                label: 'Boşaltma Tamamla',
                action: handleCompleteUnloading,
                disabled: loading
            };
        }

        // DELIVERED → Ödeme butonlarını göster (aşağıda ayrı render edilecek)
        if (delivery.currentStatus === DeliveryStep.DELIVERED) {
            return null;
        }

        // Diğer durumlar → Manuel güncelleme
        return {
            label: 'Durumu Güncelle',
            action: onUpdateStatus,
            disabled: false
        };
    };

    const handleStartJourney = async () => {
        setLoading(true);
        try {
            await deliveryService.startJourney(delivery.loadId);
            toast({
                title: "Başarılı",
                description: "Yola çıkış kaydedildi",
            });
            onRefresh();
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error?.response?.data?.message || "Yola çıkış kaydedilemedi",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteUnloading = async () => {
        setLoading(true);
        try {
            await deliveryService.completeUnloading(delivery.loadId);
            toast({
                title: "Başarılı",
                description: "Boşaltma tamamlandı",
            });
            onRefresh();
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error?.response?.data?.message || "Boşaltma tamamlanamadı",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatus = async (paymentReceived: boolean) => {
        setLoading(true);
        try {
            await deliveryService.markPaymentStatus(delivery.loadId, paymentReceived);
            toast({
                title: "Başarılı",
                description: paymentReceived ? "Ödeme alındı olarak işaretlendi" : "Ödeme beklemede olarak işaretlendi",
            });
            onRefresh();
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error?.response?.data?.message || "Ödeme durumu güncellenemedi",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const actionButton = getActionButton();

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {delivery.loadTitle}
                            {delivery.vehicle.ecoCertified && (
                                <div title="Çevreci Araç">
                                    <Leaf className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                            {delivery.cancellationDocuments && delivery.cancellationDocuments.length > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    İptal Talebi
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                {delivery.vehicle.plateNumber} - {delivery.vehicle.type}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(delivery.lastUpdate)}
                            </span>
                        </div>
                    </div>
                    <Badge className={getStatusBadgeColor(delivery.currentStatus)}>
                        {deliveryService.getStatusDisplayName(delivery.currentStatus)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Teslimat İlerlemesi</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Current Location */}
                {delivery.currentLocation && (
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Mevcut Konum: {delivery.currentLocation}</span>
                    </div>
                )}

                {/* Status Note */}
                {delivery.statusNote && (
                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{delivery.statusNote}</p>
                    </div>
                )}

                {/* Documents */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Alım</span>
                            <Badge variant="outline">
                                {delivery.pickupDocuments.length}
                            </Badge>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => onUploadDocument('pickup')}
                            disabled={delivery.currentStatus === DeliveryStep.DELIVERED}
                        >
                            <Upload className="h-4 w-4 mr-1" />
                            Ekle
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Teslimat</span>
                            <Badge variant="outline">
                                {delivery.deliveryDocuments.length}
                            </Badge>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => onUploadDocument('delivery')}
                            disabled={delivery.currentStatus !== DeliveryStep.PICKED_UP}
                        >
                            <Upload className="h-4 w-4 mr-1" />
                            Ekle
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-600">İptal</span>
                            <Badge variant="outline" className="border-red-200">
                                {delivery.cancellationDocuments?.length || 0}
                            </Badge>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => onUploadDocument('cancellation')}
                            disabled={delivery.currentStatus === DeliveryStep.DELIVERED}
                        >
                            <Upload className="h-4 w-4 mr-1" />
                            İptal Et
                        </Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-2">
                    {/* Ödeme Butonları - Sadece DELIVERED durumunda göster */}
                    {delivery.currentStatus === DeliveryStep.DELIVERED && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handlePaymentStatus(true)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Navigation className="h-4 w-4 mr-2" />
                                )}
                                Ücret Alındı
                            </Button>
                            <Button
                                onClick={() => handlePaymentStatus(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Navigation className="h-4 w-4 mr-2" />
                                )}
                                Ücret Alınmadı
                            </Button>
                        </div>
                    )}

                    {/* Normal Aksiyon Butonları */}
                    {delivery.currentStatus !== DeliveryStep.COMPLETED &&
                     delivery.currentStatus !== DeliveryStep.PAYMENT_RECEIVED &&
                     delivery.currentStatus !== DeliveryStep.PAYMENT_PENDING && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onGoToChat}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mesajlaş
                            </Button>
                            {actionButton && (
                                <Button
                                    onClick={actionButton.action}
                                    className="flex-1"
                                    disabled={actionButton.disabled}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Navigation className="h-4 w-4 mr-2" />
                                    )}
                                    {actionButton.label}
                                </Button>
                            )}
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Tamamlanan teslimatlar için mesaj */}
                    {(delivery.currentStatus === DeliveryStep.COMPLETED ||
                      delivery.currentStatus === DeliveryStep.PAYMENT_RECEIVED) && (
                        <div className="text-center py-2 text-green-600 font-medium">
                            ✅ Teslimat tamamlandı
                        </div>
                    )}

                    {/* Ödeme bekleyen teslimatlar için mesaj */}
                    {delivery.currentStatus === DeliveryStep.PAYMENT_PENDING && (
                        <div className="text-center py-2 text-yellow-600 font-medium">
                            ⏳ Ödeme beklemede
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}