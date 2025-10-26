// src/app/dashboard/sender/delivery-status/DeliveryStatusViewer.tsx - YENİ DOSYA
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Loader2,
    Package,
    MapPin,
    Calendar,
    Truck,
    Clock,
    FileText,
    Phone,
    Leaf,
    Eye,
    Download
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchSenderTrackings } from '@/store/slices/deliverySlice';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DeliveryStep, DeliveryTrackingData } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';
import senderService from '@/services/senderService';

export default function DeliveryStatusViewer() {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { user } = useAuth();
    const {
        senderTrackings,
        senderTrackingsLoading,
        senderTrackingsError
    } = useAppSelector(state => state.delivery);

    const [filterStatus, setFilterStatus] = useState<DeliveryStep | 'ALL'>('ALL');
    const [selectedTracking, setSelectedTracking] = useState<DeliveryTrackingData | null>(null);

    useEffect(() => {
        const loadSenderTrackings = async () => {
            if (user?.id) {
                try {
                    // Sender profile'ı al ve onun üzerinden trackings'i çek
                    const senderProfile = await senderService.getSenderProfileByUserId(user.id);
                    dispatch(fetchSenderTrackings(senderProfile.id));
                } catch (error) {
                    toast({
                        title: "Hata",
                        description: "Teslimat takipleri yüklenirken hata oluştu",
                        variant: "destructive",
                    });
                }
            }
        };

        loadSenderTrackings();
    }, [user?.id, dispatch, toast]);

    useEffect(() => {
        if (senderTrackingsError) {
            toast({
                title: "Hata",
                description: senderTrackingsError,
                variant: "destructive",
            });
        }
    }, [senderTrackingsError, toast]);

    const filteredTrackings = senderTrackings.filter(tracking => {
        if (filterStatus === 'ALL') return true;
        return tracking.currentStatus === filterStatus;
    });

    const getStatusCounts = () => {
        return {
            all: senderTrackings.length,
            onTheWay: senderTrackings.filter(t => t.currentStatus === DeliveryStep.ON_THE_WAY).length,
            pickedUp: senderTrackings.filter(t => t.currentStatus === DeliveryStep.PICKED_UP).length,
            delivered: senderTrackings.filter(t => t.currentStatus === DeliveryStep.DELIVERED).length,
        };
    };

    const counts = getStatusCounts();

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

    const openDocumentViewer = (documentUrl: string) => {
        // Dosyayı yeni sekmede aç
        window.open(documentUrl, '_blank');
    };

    if (senderTrackingsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Teslimat takipleri yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Teslimat Takibi</h1>
                    <p className="text-muted-foreground">
                        Yüklerinizin teslimat durumunu takip edin.
                    </p>
                </div>
                <Button
                    onClick={() => user?.id && dispatch(fetchSenderTrackings(user.id))}
                    variant="outline"
                >
                    Yenile
                </Button>
            </div>

            <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as DeliveryStep | 'ALL')}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="ALL">
                        Tümü ({counts.all})
                    </TabsTrigger>
                    <TabsTrigger value={DeliveryStep.ON_THE_WAY}>
                        Yüke Gidiliyor ({counts.onTheWay})
                    </TabsTrigger>
                    <TabsTrigger value={DeliveryStep.PICKED_UP}>
                        Alındı ({counts.pickedUp})
                    </TabsTrigger>
                    <TabsTrigger value={DeliveryStep.DELIVERED}>
                        Teslim Edildi ({counts.delivered})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filterStatus} className="mt-6">
                    {filteredTrackings.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {filterStatus === 'ALL' ? 'Henüz teslimat bulunmuyor' : 'Bu durumda teslimat bulunmuyor'}
                                </h3>
                                <p className="text-muted-foreground text-center">
                                    Yükleriniz atandığında teslimat takibi burada görünecektir.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Yük
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Taşıyıcı
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Araç
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Durum
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    İlerleme
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Son Güncelleme
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    İşlemler
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTrackings.map((tracking) => {
                                                const progress = deliveryService.getStatusProgress(tracking.currentStatus);
                                                return (
                                                    <tr
                                                        key={tracking.loadId}
                                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                        onClick={() => setSelectedTracking(tracking)}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{tracking.loadTitle}</div>
                                                                    {tracking.currentLocation && (
                                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {tracking.currentLocation}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div>
                                                                    <div className="text-gray-900">{tracking.carrier.name}</div>
                                                                    {tracking.carrier.phone && (
                                                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                                            <Phone className="h-3 w-3" />
                                                                            {tracking.carrier.phone}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {tracking.carrier.isEcoFriendly && (
                                                                    <div title="Çevreci Taşıyıcı">
                                                                        <Leaf className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-gray-700">
                                                                <Truck className="h-4 w-4 text-gray-400" />
                                                                <div>
                                                                    <div className="font-medium">{tracking.vehicle.plateNumber}</div>
                                                                    <div className="text-xs text-gray-500">{tracking.vehicle.type}</div>
                                                                </div>
                                                                {tracking.vehicle.ecoCertified && (
                                                                    <div title="Çevreci Araç">
                                                                        <Leaf className="h-3 w-3 text-green-600" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={getStatusBadgeColor(tracking.currentStatus)}>
                                                                {deliveryService.getStatusDisplayName(tracking.currentStatus)}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={progress} className="h-2 w-24" />
                                                                <span className="text-sm text-gray-600">{progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-gray-700">
                                                                <Clock className="h-4 w-4 text-gray-400" />
                                                                <span className="text-sm">{formatDate(tracking.lastUpdate)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTracking(tracking);
                                                                }}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Detay Modal */}
            {selectedTracking && (
                <TrackingDetailModal
                    tracking={selectedTracking}
                    onClose={() => setSelectedTracking(null)}
                    onViewDocument={openDocumentViewer}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
}

// Tracking Card Component
interface TrackingCardProps {
    tracking: DeliveryTrackingData;
    onViewDetails: (tracking: DeliveryTrackingData) => void;
    onViewDocument: (url: string) => void;
    formatDate: (date: string) => string;
    getStatusBadgeColor: (status: DeliveryStep) => string;
}

function TrackingCard({
                          tracking,
                          onViewDetails,
                          onViewDocument,
                          formatDate,
                          getStatusBadgeColor
                      }: TrackingCardProps) {
    const progress = deliveryService.getStatusProgress(tracking.currentStatus);

    return (
        <Card className="border-l-4 border-l-green-500">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {tracking.loadTitle}
                            {tracking.vehicle.ecoCertified && (
                                <div title="Çevreci Araç">
                                    <Leaf className="h-4 w-4 text-green-600" />
                                </div>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Truck className="h-4 w-4" />
                                {tracking.vehicle.plateNumber} - {tracking.vehicle.type}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(tracking.lastUpdate)}
                            </span>
                        </div>
                    </div>
                    <Badge className={getStatusBadgeColor(tracking.currentStatus)}>
                        {deliveryService.getStatusDisplayName(tracking.currentStatus)}
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

                {/* Carrier Info */}
                <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{tracking.carrier.name}</p>
                            {tracking.carrier.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {tracking.carrier.phone}
                                </p>
                            )}
                        </div>
                        {tracking.carrier.isEcoFriendly && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                Çevreci Taşıyıcı
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Current Location */}
                {tracking.currentLocation && (
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Mevcut Konum: {tracking.currentLocation}</span>
                    </div>
                )}

                {/* Status Note */}
                {tracking.statusNote && (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">{tracking.statusNote}</p>
                    </div>
                )}

                {/* Documents Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-sm font-medium">Alım Belgeleri</p>
                        <Badge variant="outline">
                            {tracking.pickupDocuments.length}
                        </Badge>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">Teslimat Belgeleri</p>
                        <Badge variant="outline">
                            {tracking.deliveryDocuments.length}
                        </Badge>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t">
                    <Button
                        onClick={() => onViewDetails(tracking)}
                        className="w-full"
                        variant="outline"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Detayları Görüntüle
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Detail Modal Component
interface TrackingDetailModalProps {
    tracking: DeliveryTrackingData;
    onClose: () => void;
    onViewDocument: (url: string) => void;
    formatDate: (date: string) => string;
}

function TrackingDetailModal({ tracking, onClose, onViewDocument, formatDate }: TrackingDetailModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{tracking.loadTitle} - Detaylar</h2>
                        <Button variant="ghost" size="lg" onClick={onClose} className="text-2xl hover:bg-gray-100">
                            ✕
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Status History */}
                        <div>
                            <h3 className="font-semibold mb-3">Durum Geçmişi</h3>
                            <div className="space-y-2">
                                {tracking.statusHistory && tracking.statusHistory.length > 0 ? (
                                    tracking.statusHistory.map((history, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded">
                                            <Badge variant="outline">
                                                {deliveryService.getStatusDisplayName(history.status)}
                                            </Badge>
                                            <span className="text-sm">{formatDate(history.timestamp)}</span>
                                            {history.location && (
                                                <span className="text-sm text-muted-foreground">
                                                    - {history.location}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Henüz durum geçmişi bulunmuyor</p>
                                )}
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-3">Alım Belgeleri</h3>
                                {tracking.pickupDocuments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Henüz belge yüklenmedi</p>
                                ) : (
                                    <div className="space-y-2">
                                        {tracking.pickupDocuments.map((doc, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewDocument(doc)}
                                                className="w-full justify-start"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Belge {index + 1}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Teslimat Belgeleri</h3>
                                {tracking.deliveryDocuments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Henüz belge yüklenmedi</p>
                                ) : (
                                    <div className="space-y-2">
                                        {tracking.deliveryDocuments.map((doc, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewDocument(doc)}
                                                className="w-full justify-start"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Belge {index + 1}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}