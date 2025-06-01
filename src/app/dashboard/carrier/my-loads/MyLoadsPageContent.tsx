'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Package, MapPin, Calendar, Weight, Shield, Leaf, TruckIcon, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchAcceptedLoads, fetchRejectedOffers } from '@/store/slices/offersSlice'
import {updateLoadCount} from "@/store/slices/notificationsSlice";
import { Button } from '@/components/ui/button';


export default function MyLoadsPageContent() {

    const dispatch = useAppDispatch()
    const {
        acceptedLoads,
        acceptedLoadsLoading,
        rejectedOffers,
        rejectedOffersLoading
    } = useAppSelector(state => state.offers)


    const { toast } = useToast();

    useEffect(() => {
        Promise.all([
            dispatch(fetchAcceptedLoads()),
            dispatch(fetchRejectedOffers())
        ]).then(() => {

            const totalLoads = acceptedLoads.length + rejectedOffers.length;
            dispatch(updateLoadCount(totalLoads));
        });
    }, [dispatch]);


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    const loading = acceptedLoadsLoading || rejectedOffersLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Yükler yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Benim Yüklerim</h1>
                <p className="text-muted-foreground">
                    Tekliflerinizin durumu ve yük bilgileri.
                </p>
            </div>

            <Tabs defaultValue="accepted" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="accepted" className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4" />
                        Kabul Edilenler ({acceptedLoads.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Reddedilenler ({rejectedOffers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="accepted">
                    {acceptedLoads.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Henüz kabul edilmiş yük bulunmuyor</h3>
                                <p className="text-muted-foreground text-center">
                                    Teklifleriniz kabul edildiğinde burada görünecektir.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {acceptedLoads.map((loadWithOffers) => (
                                <Card key={loadWithOffers.load.id} className="border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{loadWithOffers.load.title}</span>
                                            <Badge className="bg-green-100 text-green-800">
                                                Kabul Edildi
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Weight className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Ağırlık: {loadWithOffers.load.netWeight} kg</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                    {loadWithOffers.load.loadingAddress} → {loadWithOffers.load.deliveryAddress}
                </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                    Yükleme: {formatDate(loadWithOffers.load.loadingDate)}
                </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Tür: {loadWithOffers.load.goodsType}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                    Teslimat: {formatDate(loadWithOffers.load.deliveryDate)}
                </span>
                                                </div>
                                                {loadWithOffers.load.insuranceRequested && (
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm text-green-600">Sigortalı</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Açıklama */}
                                        {loadWithOffers.load.description && (
                                            <div className="mb-4">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Açıklama:</strong> {loadWithOffers.load.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Kabul edilmiş teklif bilgisi */}
                                        {loadWithOffers.hasAcceptedOffer && (
                                            <div className="bg-green-50 p-3 rounded-md mb-4 border border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-800">Teklif Kabul Edildi</p>
                                                        <p className="text-sm text-green-600">Teslimat süreci başladı</p>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        Atandı
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    // Yük detaylarını göster
                                                    toast({
                                                        title: "Bilgi",
                                                        description: "Yük detayları özelliği yakında eklenecek",
                                                    });
                                                }}
                                            >
                                                <Package className="h-4 w-4 mr-2" />
                                                Detaylar (burada görüntülenecek şeyi direkt karta yazabilirim)
                                            </Button>


                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rejected">
                    {rejectedOffers.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Son 7 günde reddedilen teklif yok</h3>
                                <p className="text-muted-foreground text-center">
                                    Reddedilen teklifleriniz burada görünecektir.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {rejectedOffers.map((loadWithOffers) => (
                                <Card key={loadWithOffers.load.id} className="border-l-4 border-l-red-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{loadWithOffers.load.title}</span>
                                            <Badge variant="destructive">
                                                Reddedildi
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Yük detayları */}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}