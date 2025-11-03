// src/app/dashboard/carrier/delivery-tracking/DeliveryTrackingContent.tsx - YENİ DOSYA
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Package, MapPin, Calendar, Weight, Upload, Navigation, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchActiveDeliveries, setSelectedDelivery, setShowStatusModal, setShowDocumentModal, setSelectedDocumentType } from '@/store/slices/deliverySlice';
import { useToast } from '@/hooks/use-toast';
import DeliveryStatusCard from './DeliveryStatusCard';
import StatusUpdateModal from './StatusUpdateModal';
import DocumentUploadModal from './DocumentUploadModal';
import { DeliveryStep } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';
import loadService from '@/services/loadService';
import { useRouter } from 'next/navigation';

export default function DeliveryTrackingContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();
    const {
        activeDeliveries,
        activeDeliveriesLoading,
        activeDeliveriesError,
        selectedDelivery,
        showStatusModal,
        showDocumentModal
    } = useAppSelector(state => state.delivery);

    const [filterStatus, setFilterStatus] = useState<DeliveryStep | 'ALL'>(DeliveryStep.ASSIGNED);

    const handleGoToChat = async (loadId: string) => {
        try {
            // Load detaylarını getir
            const loadData = await loadService.getLoadById(loadId);

            if (!loadData.sender?.userId) {
                toast({
                    title: "Hata",
                    description: "Yük sahibine ulaşılamadı.",
                    variant: "destructive",
                });
                return;
            }

            router.push(`/dashboard/messages/load/${loadId}?otherUserId=${loadData.sender.userId}`);
        } catch (error) {
            toast({
                title: "Hata",
                description: "Yük bilgileri alınamadı.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        dispatch(fetchActiveDeliveries());
    }, [dispatch]);

    useEffect(() => {
        if (activeDeliveriesError) {
            toast({
                title: "Hata",
                description: activeDeliveriesError,
                variant: "destructive",
            });
        }
    }, [activeDeliveriesError, toast]);

    const filteredDeliveries = activeDeliveries.filter(delivery => {
        return delivery.currentStatus === filterStatus;
    });

    const getStatusCounts = () => {
        return {
            assigned: activeDeliveries.filter(d => d.currentStatus === DeliveryStep.ASSIGNED).length,
            pickedUp: activeDeliveries.filter(d => d.currentStatus === DeliveryStep.PICKED_UP).length,
            onTheWay: activeDeliveries.filter(d => d.currentStatus === DeliveryStep.ON_THE_WAY).length,
            delivered: activeDeliveries.filter(d => d.currentStatus === DeliveryStep.DELIVERED).length,
        };
    };

    const counts = getStatusCounts();

    if (activeDeliveriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Teslimatlar yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Teslimat Takibi</h1>
                    <p className="text-muted-foreground">
                        Aktif teslimatlarınızı takip edin ve güncelleyin.
                    </p>
                </div>
                <Button
                    onClick={() => dispatch(fetchActiveDeliveries())}
                    variant="outline"
                >
                    Yenile
                </Button>
            </div>

            <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as DeliveryStep | 'ALL')}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value={DeliveryStep.ASSIGNED}>
                        Kabul Edilen Yükler ({counts.assigned})
                    </TabsTrigger>
                    <TabsTrigger value={DeliveryStep.PICKED_UP}>
                        Yüklenenler ({counts.pickedUp})
                    </TabsTrigger>
                    <TabsTrigger value={DeliveryStep.ON_THE_WAY}>
                        Yolda Olanlar ({counts.onTheWay})
                    </TabsTrigger>
                    <TabsTrigger value={DeliveryStep.DELIVERED}>
                        Teslim Edilen Yükler ({counts.delivered})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filterStatus} className="mt-6">
                    {filteredDeliveries.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Bu durumda teslimat bulunmuyor</h3>
                                <p className="text-muted-foreground text-center">
                                    Yeni teslimatlar atandığında burada görünecektir.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredDeliveries.map((delivery) => (
                                <DeliveryStatusCard
                                    key={delivery.loadId}
                                    delivery={delivery}
                                    onUpdateStatus={() => {
                                        dispatch(setSelectedDelivery(delivery));
                                        dispatch(setShowStatusModal(true));
                                    }}
                                    onUploadDocument={(type) => {
                                        dispatch(setSelectedDelivery(delivery));
                                        dispatch(setSelectedDocumentType(type));
                                        dispatch(setShowDocumentModal(true));
                                    }}
                                    onGoToChat={() => handleGoToChat(delivery.actualLoadId)}
                                    onRefresh={() => dispatch(fetchActiveDeliveries())}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <StatusUpdateModal />
            <DocumentUploadModal />
        </div>
    );
}