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
    User,
    Loader2,
    Download,
    Eye,
    Weight,
    Calendar,
    Truck
} from 'lucide-react';
import { DeliveryTrackingData, DeliveryStep } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import loadService from '@/services/loadService';
import { useState } from 'react';

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
    const [loading, setLoading] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState<'pickup' | 'delivery' | 'cancellation' | null>(null);
    const [showDocuments, setShowDocuments] = useState(false);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return '-';
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '-';
        }
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

    const handleGoToChat = async () => {
        try {
            // loadId'yi kullan - actualLoadId null gelebiliyor
            const loadIdToUse = delivery.actualLoadId || delivery.loadId;

            if (!loadIdToUse) {
                toast({
                    title: "Hata",
                    description: "Yük ID'si bulunamadı.",
                    variant: "destructive",
                });
                return;
            }

            const loadData = await loadService.getLoadById(loadIdToUse);

            if (!loadData.sender?.userId) {
                toast({
                    title: "Hata",
                    description: "Yük sahibine ulaşılamadı.",
                    variant: "destructive",
                });
                return;
            }

            // Broker, sender ile mesajlaşmalı
            router.push(`/dashboard/messages/load/${loadIdToUse}?otherUserId=${loadData.sender.userId}`);
        } catch (error: any) {
            console.error('Get load by ID error:', error);
            toast({
                title: "Hata",
                description: error?.response?.data?.message || "Yük bilgileri alınamadı.",
                variant: "destructive",
            });
        }
    };

    const handleViewDocuments = (type: 'pickup' | 'delivery' | 'cancellation') => {
        setSelectedDocumentType(type);
        setShowDocuments(true);
    };

    const getDocuments = (type: 'pickup' | 'delivery' | 'cancellation') => {
        switch (type) {
            case 'pickup':
                return delivery.pickupDocuments || [];
            case 'delivery':
                return delivery.deliveryDocuments || [];
            case 'cancellation':
                return delivery.cancellationDocuments || [];
            default:
                return [];
        }
    };

    return (
        <>
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
                                    {formatDateTime(delivery.lastLocationUpdate || delivery.updatedAt || delivery.lastUpdate)}
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

                {/* Route Bilgisi */}
                {(delivery.loadingAddress || delivery.deliveryAddress) && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                            {delivery.loadingAddress && (
                                <div>
                                    <p className="text-xs text-gray-500">Yükleme Noktası</p>
                                    <p className="text-sm font-medium text-gray-900">{delivery.loadingAddress}</p>
                                </div>
                            )}
                            {delivery.loadingAddress && delivery.deliveryAddress && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="h-8 border-l-2 border-dashed ml-2"></div>
                                </div>
                            )}
                            {delivery.deliveryAddress && (
                                <div>
                                    <p className="text-xs text-gray-500">Teslimat Noktası</p>
                                    <p className="text-sm font-medium text-gray-900">{delivery.deliveryAddress}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Yük Detayları */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {delivery.goodsType && (
                        <div>
                            <span className="text-gray-600 flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                Mal Türü
                            </span>
                            <p className="font-medium">{delivery.goodsType}</p>
                        </div>
                    )}
                    {delivery.netWeight && (
                        <div>
                            <span className="text-gray-600 flex items-center gap-1">
                                <Weight className="h-3 w-3" />
                                Ağırlık
                            </span>
                            <p className="font-medium">{delivery.netWeight} kg</p>
                        </div>
                    )}
                    {delivery.loadingDate && (
                        <div>
                            <span className="text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Yükleme
                            </span>
                            <p className="font-medium">{formatDate(delivery.loadingDate)}</p>
                        </div>
                    )}
                    {delivery.deliveryDate && (
                        <div>
                            <span className="text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Teslimat
                            </span>
                            <p className="font-medium">{formatDate(delivery.deliveryDate)}</p>
                        </div>
                    )}
                </div>

                {/* Yük Açıklaması ve Gönderen */}
                <div className="space-y-3">
                    {delivery.loadDescription && (
                        <div>
                            <span className="text-muted-foreground text-sm">Açıklama:</span>
                            <p className="font-medium text-sm">{delivery.loadDescription}</p>
                        </div>
                    )}

                    {delivery.senderInfo && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Gönderen</p>
                                <p className="text-sm font-medium">{delivery.senderInfo.companyName || delivery.senderInfo.contactPerson || '-'}</p>
                            </div>
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

                {/* Taşıyıcı ve Araç Bilgileri */}
                {(delivery.carrier || delivery.carrierInfo || delivery.vehicle) && (
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Taşıyıcı Bilgileri
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {(delivery.carrier || delivery.carrierInfo) && (
                                <div>
                                    <span className="text-gray-600">Firma:</span>
                                    <p className="font-medium">{delivery.carrier?.name || delivery.carrierInfo?.name || '-'}</p>
                                </div>
                            )}
                            {(delivery.carrier?.phone || delivery.carrierInfo?.phone) && (
                                <div>
                                    <span className="text-gray-600">Telefon:</span>
                                    <p className="font-medium">{delivery.carrier?.phone || delivery.carrierInfo?.phone}</p>
                                </div>
                            )}
                            {delivery.vehicle && (
                                <>
                                    <div>
                                        <span className="text-gray-600">Araç Plakası:</span>
                                        <p className="font-medium">{delivery.vehicle.plateNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Araç Tipi:</span>
                                        <p className="font-medium">{delivery.vehicle.type}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents (Read-only) */}
                <div id="documents-section" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Alım Belgeleri</span>
                            <Badge variant="outline">
                                {delivery.pickupDocuments?.length || 0}
                            </Badge>
                        </div>
                        {delivery.pickupDocuments && delivery.pickupDocuments.length > 0 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleViewDocuments('pickup')}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle ({delivery.pickupDocuments.length})
                            </Button>
                        ) : (
                            <div className="text-xs text-muted-foreground text-center py-2">
                                Belge yok
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Teslimat Belgeleri</span>
                            <Badge variant="outline">
                                {delivery.deliveryDocuments?.length || 0}
                            </Badge>
                        </div>
                        {delivery.deliveryDocuments && delivery.deliveryDocuments.length > 0 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleViewDocuments('delivery')}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle ({delivery.deliveryDocuments.length})
                            </Button>
                        ) : (
                            <div className="text-xs text-muted-foreground text-center py-2">
                                Belge yok
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-600">İptal Belgeleri</span>
                            <Badge variant="outline" className="border-red-200">
                                {delivery.cancellationDocuments?.length || 0}
                            </Badge>
                        </div>
                        {delivery.cancellationDocuments && delivery.cancellationDocuments.length > 0 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleViewDocuments('cancellation')}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Görüntüle ({delivery.cancellationDocuments.length})
                            </Button>
                        ) : (
                            <div className="text-xs text-muted-foreground text-center py-2">
                                Belge yok
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGoToChat}
                            className="flex-1 w-full sm:w-auto"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Mesajlaş</span>
                            <span className="sm:hidden">Mesaj Gönder</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const element = document.getElementById('documents-section');
                                element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto"
                        >
                            <FileText className="h-4 w-4 mr-2 sm:mr-0" />
                            <span className="sm:hidden">Belgeleri Görüntüle</span>
                        </Button>
                    </div>

                    {/* Tamamlanan teslimatlar için mesaj */}
                    {(delivery.currentStatus === DeliveryStep.COMPLETED ||
                      delivery.currentStatus === DeliveryStep.PAYMENT_RECEIVED) && (
                        <div className="text-center py-2 mt-2 text-green-600 font-medium">
                            ✅ Teslimat tamamlandı
                        </div>
                    )}

                    {/* Ödeme bekleyen teslimatlar için mesaj */}
                    {delivery.currentStatus === DeliveryStep.PAYMENT_PENDING && (
                        <div className="text-center py-2 mt-2 text-yellow-600 font-medium">
                            ⏳ Ödeme beklemede
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Document Viewer Modal */}
        {showDocuments && selectedDocumentType && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>
                                {selectedDocumentType === 'pickup' && 'Alım Belgeleri'}
                                {selectedDocumentType === 'delivery' && 'Teslimat Belgeleri'}
                                {selectedDocumentType === 'cancellation' && 'İptal Belgeleri'}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowDocuments(false);
                                    setSelectedDocumentType(null);
                                }}
                            >
                                ✕
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getDocuments(selectedDocumentType).map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            Belge {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(doc, '_blank')}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Görüntüle
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = doc;
                                                link.download = `belge-${index + 1}`;
                                                link.click();
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            İndir
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </>
    );
}
