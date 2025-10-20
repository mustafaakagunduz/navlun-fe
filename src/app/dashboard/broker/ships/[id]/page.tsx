"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    Ship,
    ArrowLeft,
    Edit,
    MapPin,
    Calendar,
    Leaf,
    Weight,
    Globe,
    Anchor,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    Building2,
    Shield
} from "lucide-react";
import shipService, { Ship as ShipType } from '@/services/shipService';

export default function ShipDetail() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const shipId = params?.id as string;

    const [ship, setShip] = useState<ShipType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadShip = async () => {
            if (!shipId) return;

            try {
                setLoading(true);
                const data = await shipService.getShipById(shipId);
                setShip(data);
            } catch (err: any) {
                console.error('Ship load error:', err);
                setError(err.message || 'Gemi bilgileri yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        loadShip();
    }, [shipId]);

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['BROKER']}>
                <div className="container mx-auto p-4">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Yükleniyor...</span>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !ship) {
        return (
            <ProtectedRoute allowedRoles={['BROKER']}>
                <div className="container mx-auto p-4">
                    <Card className="border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <span>{error || 'Gemi bulunamadı'}</span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/dashboard/broker/ship-portfolio')}
                                className="mt-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Geri Dön
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push('/dashboard/broker/ship-portfolio')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Ship className="h-8 w-8" />
                                {ship.name}
                            </h1>
                            <p className="text-gray-600">IMO: {ship.imoNumber || 'Belirtilmemiş'}</p>
                        </div>
                    </div>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push(`/dashboard/broker/ships/${shipId}/edit`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                    </Button>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 flex-wrap">
                    {ship.available ? (
                        <Badge className="bg-green-50 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Müsait
                        </Badge>
                    ) : (
                        <Badge className="bg-red-50 text-red-700">
                            <XCircle className="h-3 w-3 mr-1" />
                            Meşgul
                        </Badge>
                    )}
                    {ship.ecoFriendly && (
                        <Badge className="bg-green-50 text-green-700">
                            <Leaf className="h-3 w-3 mr-1" />
                            Çevre Dostu
                        </Badge>
                    )}
                    {ship.availableForBooking && (
                        <Badge className="bg-blue-50 text-blue-700">
                            Rezervasyon İçin Müsait
                        </Badge>
                    )}
                </div>

                {/* Main Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Temel Bilgiler */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ship className="h-5 w-5" />
                                Temel Bilgiler
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Gemi Tipi</p>
                                    <p className="font-medium">{ship.shipType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">İnşa Yılı</p>
                                    <p className="font-medium">{ship.buildYear}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Bayrak</p>
                                    <p className="font-medium flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        {ship.flag}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Klas Kuruluşu</p>
                                    <p className="font-medium">{ship.classificationSociety || '-'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-gray-600 mb-1">Mevcut Liman</p>
                                <p className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    {ship.currentPort}
                                </p>
                            </div>

                            {ship.registrationPort && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Sicil Limanı</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Anchor className="h-4 w-4 text-gray-600" />
                                        {ship.registrationPort}
                                    </p>
                                </div>
                            )}

                            {ship.nextAvailableDate && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Müsaitlik Tarihi</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-orange-600" />
                                        {new Date(ship.nextAvailableDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Kapasite ve Boyutlar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Weight className="h-5 w-5" />
                                Kapasite ve Boyutlar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">DWT</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {ship.deadweightTonnage?.toLocaleString()} ton
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">GT</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {ship.grossTonnage?.toLocaleString()} ton
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Uzunluk</p>
                                    <p className="font-medium">{ship.lengthOverall ? `${ship.lengthOverall} m` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Genişlik</p>
                                    <p className="font-medium">{ship.beam ? `${ship.beam} m` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Draft</p>
                                    <p className="font-medium">{ship.draught ? `${ship.draught} m` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Max Hız</p>
                                    <p className="font-medium flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" />
                                        {ship.maxSpeed ? `${ship.maxSpeed} knot` : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sertifikalar ve Doğrulamalar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Sertifikalar ve Doğrulamalar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Çevreci Sertifika</p>
                                {ship.ecoFriendlyValid ? (
                                    <Badge className="bg-green-50 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Geçerli
                                    </Badge>
                                ) : (
                                    <Badge className="bg-gray-50 text-gray-700">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Geçersiz
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-2">Sigorta</p>
                                {ship.insuranceValid ? (
                                    <Badge className="bg-green-50 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Geçerli
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-50 text-red-700">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Geçersiz
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-gray-600 mb-2">Klasifikasyon</p>
                                {ship.classificationValid ? (
                                    <Badge className="bg-green-50 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Geçerli
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-50 text-red-700">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Geçersiz
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Broker Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Broker Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Broker</p>
                                <p className="font-medium">{ship.brokerName || 'Belirtilmemiş'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Kayıt Tarihi</p>
                                <p className="font-medium">
                                    {new Date(ship.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
