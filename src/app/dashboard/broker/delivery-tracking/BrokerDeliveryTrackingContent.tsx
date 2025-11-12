// src/app/dashboard/broker/delivery-tracking/BrokerDeliveryTrackingContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BrokerDeliveryStatusCard from './BrokerDeliveryStatusCard';
import { DeliveryStep, DeliveryTrackingData } from '@/services/deliveryService';
import deliveryService from '@/services/deliveryService';

export default function BrokerDeliveryTrackingContent() {
    const { toast } = useToast();
    const [activeDeliveries, setActiveDeliveries] = useState<DeliveryTrackingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<DeliveryStep | 'ALL'>(DeliveryStep.ASSIGNED);

    const loadActiveDeliveries = async () => {
        try {
            setLoading(true);
            const data = await deliveryService.getCurrentBrokerActiveDeliveries();
            setActiveDeliveries(data);
        } catch (error: any) {
            console.error('Error loading deliveries:', error);
            toast({
                title: 'Hata',
                description: error.response?.data?.message || 'Teslimatlar yüklenirken hata oluştu',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActiveDeliveries();
    }, []);

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

    if (loading) {
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
                        Kabul edilen tekliflerinizin teslimat durumlarını takip edin.
                    </p>
                </div>
                <Button
                    onClick={loadActiveDeliveries}
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
                                <BrokerDeliveryStatusCard
                                    key={delivery.loadId}
                                    delivery={delivery}
                                    onRefresh={loadActiveDeliveries}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
