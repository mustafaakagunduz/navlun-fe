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
    Leaf
} from 'lucide-react';
import { DeliveryTrackingData, DeliveryStep } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';

interface DeliveryStatusCardProps {
    delivery: DeliveryTrackingData;
    onUpdateStatus: () => void;
    onUploadDocument: (type: 'pickup' | 'delivery' | 'cancellation') => void;
}

export default function DeliveryStatusCard({
                                               delivery,
                                               onUpdateStatus,
                                               onUploadDocument
                                           }: DeliveryStatusCardProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeColor = (status: DeliveryStep) => {
        switch (status) {
            case DeliveryStep.ON_THE_WAY:
                return 'bg-blue-100 text-blue-800';
            case DeliveryStep.PICKED_UP:
                return 'bg-orange-100 text-orange-800';
            case DeliveryStep.DELIVERED:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const progress = deliveryService.getStatusProgress(delivery.currentStatus);

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
                <div className="flex gap-2 pt-4 border-t">
                    <Button
                        onClick={onUpdateStatus}
                        className="flex-1"
                        disabled={delivery.currentStatus === DeliveryStep.DELIVERED}
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        Durumu Güncelle
                    </Button>
                    <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}