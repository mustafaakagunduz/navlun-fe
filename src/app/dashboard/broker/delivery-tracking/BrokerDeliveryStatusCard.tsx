// src/app/dashboard/broker/delivery-tracking/BrokerDeliveryStatusCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    MapPin,
    Clock,
    Ship,
    Package,
    Leaf,
    MessageSquare,
    FileText,
    DollarSign,
    User
} from 'lucide-react';
import { DeliveryTrackingData, DeliveryStep } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import loadService from '@/services/loadService';

interface BrokerDeliveryStatusCardProps {
    delivery: DeliveryTrackingData;
    onRefresh: () => void;
}

export default function BrokerDeliveryStatusCard({
    delivery,
    onRefresh
}: BrokerDeliveryStatusCardProps) {
    const router = useRouter();
    const { toast } = useToast();

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    const progress = deliveryService.getStatusProgress(delivery.status);

    const handleGoToChat = async () => {
        try {
            const loadData = await loadService.getLoadById(delivery.loadId);
            if (!loadData.sender?.userId) {
                toast({
                    title: "Hata",
                    description: "Yük sahibine ulaşılamadı.",
                    variant: "destructive",
                });
                return;
            }
            router.push(`/dashboard/messages/load/${delivery.loadId}?otherUserId=${loadData.sender.userId}`);
        } catch (error) {
            toast({
                title: "Hata",
                description: "Yük bilgileri alınamadı.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="border-l-4 border-l-green-500">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {delivery.loadTitle || 'Yük Başlığı'}
                            {delivery.brokerInfo?.ecoFriendly && (
                                <div title="Çevreci Taşıma">
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
                            {delivery.shipInfo && (
                                <span className="flex items-center gap-1">
                                    <Ship className="h-4 w-4" />
                                    {delivery.shipInfo.name} - {delivery.shipInfo.imoNumber}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(delivery.lastLocationUpdate || delivery.updatedAt)}
                            </span>
                        </div>
                    </div>
                    <Badge className={getStatusBadgeColor(delivery.status)}>
                        {deliveryService.getStatusDisplayName(delivery.status)}
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

                {/* Yük Bilgileri */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Açıklama:</span>
                        <p className="font-medium">{delivery.loadDescription || '-'}</p>
                    </div>
                    {delivery.senderInfo && (
                        <div>
                            <span className="text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Gönderen:
                            </span>
                            <p className="font-medium">{delivery.senderInfo.companyName || delivery.senderInfo.contactPerson || '-'}</p>
                        </div>
                    )}
                </div>

                {/* Current Location */}
                {delivery.currentLocation && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <div>
                            <span className="text-gray-600">Mevcut Konum:</span>
                            <p className="font-medium text-gray-900">{delivery.currentLocation}</p>
                            {delivery.lastLocationUpdate && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Son güncelleme: {formatDate(delivery.lastLocationUpdate)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Status Note */}
                {delivery.statusNote && (
                    <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{delivery.statusNote}</p>
                    </div>
                )}

                {/* Komisyon Bilgisi */}
                {delivery.brokerInfo?.commissionAmount && (
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-900">Komisyon:</span>
                            <span className="text-lg font-bold text-green-700 flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {new Intl.NumberFormat('tr-TR', {
                                    style: 'currency',
                                    currency: 'TRY'
                                }).format(delivery.brokerInfo.commissionAmount)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Taşıyıcı Bilgileri */}
                {delivery.carrierInfo && (
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Taşıyıcı Bilgileri</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Firma:</span>
                                <p className="font-medium">{delivery.carrierInfo.name || '-'}</p>
                            </div>
                            {delivery.carrierInfo.phone && (
                                <div>
                                    <span className="text-gray-600">Telefon:</span>
                                    <p className="font-medium">{delivery.carrierInfo.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents (Read-only) */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Alım Belgeleri</span>
                            <Badge variant="outline">
                                {delivery.pickupDocuments?.length || 0}
                            </Badge>
                        </div>
                        {delivery.pickupDocuments && delivery.pickupDocuments.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(delivery.pickupDocuments[0], '_blank')}
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                Görüntüle
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Teslimat Belgeleri</span>
                            <Badge variant="outline">
                                {delivery.deliveryDocuments?.length || 0}
                            </Badge>
                        </div>
                        {delivery.deliveryDocuments && delivery.deliveryDocuments.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(delivery.deliveryDocuments[0], '_blank')}
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                Görüntüle
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-600">İptal Belgeleri</span>
                            <Badge variant="outline" className="border-red-200">
                                {delivery.cancellationDocuments?.length || 0}
                            </Badge>
                        </div>
                        {delivery.cancellationDocuments && delivery.cancellationDocuments.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => window.open(delivery.cancellationDocuments[0], '_blank')}
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                Görüntüle
                            </Button>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGoToChat}
                            className="flex-1"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Mesajlaş
                        </Button>
                        <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Tamamlanan teslimatlar için mesaj */}
                    {(delivery.status === DeliveryStep.COMPLETED ||
                      delivery.status === DeliveryStep.PAYMENT_RECEIVED) && (
                        <div className="text-center py-2 mt-2 text-green-600 font-medium">
                            ✅ Teslimat tamamlandı
                        </div>
                    )}

                    {/* Ödeme bekleyen teslimatlar için mesaj */}
                    {delivery.status === DeliveryStep.PAYMENT_PENDING && (
                        <div className="text-center py-2 mt-2 text-yellow-600 font-medium">
                            ⏳ Ödeme beklemede
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
