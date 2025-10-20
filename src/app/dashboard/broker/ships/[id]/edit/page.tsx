"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    Ship,
    ArrowLeft,
    Save,
    AlertCircle
} from "lucide-react";
import shipService, { Ship as ShipType, ShipUpdateRequest } from '@/services/shipService';

export default function EditShip() {
    const router = useRouter();
    const params = useParams();
    const shipId = params?.id as string;

    const [ship, setShip] = useState<ShipType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        shipType: '',
        currentPort: '',
        registrationPort: '',
        nextAvailableDate: '',
        available: true,
        ecoFriendly: false
    });

    useEffect(() => {
        const loadShip = async () => {
            if (!shipId) return;

            try {
                setLoading(true);
                const data = await shipService.getShipById(shipId);
                setShip(data);
                setFormData({
                    name: data.name,
                    shipType: data.shipType,
                    currentPort: data.currentPort,
                    registrationPort: data.registrationPort || '',
                    nextAvailableDate: data.nextAvailableDate || '',
                    available: data.available,
                    ecoFriendly: data.ecoFriendly
                });
            } catch (err: any) {
                console.error('Ship load error:', err);
                setError(err.message || 'Gemi bilgileri yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        loadShip();
    }, [shipId]);

    const handleChange = (field: keyof typeof formData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const updateData: ShipUpdateRequest = {
                name: formData.name,
                shipType: formData.shipType,
                currentPort: formData.currentPort,
                registrationPort: formData.registrationPort || undefined,
                nextAvailableDate: formData.nextAvailableDate || undefined,
                available: formData.available,
                ecoFriendly: formData.ecoFriendly
            };

            await shipService.updateShip(shipId, updateData);

            // Başarılı güncelleme sonrası detay sayfasına yönlendir
            router.push(`/dashboard/broker/ships/${shipId}`);
        } catch (err: any) {
            console.error('Ship update error:', err);
            setError(err.message || 'Gemi güncellenirken bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

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

    if (error && !ship) {
        return (
            <ProtectedRoute allowedRoles={['BROKER']}>
                <div className="container mx-auto p-4">
                    <Card className="border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <span>{error}</span>
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
            <div className="container mx-auto p-4 space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/dashboard/broker/ships/${shipId}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Ship className="h-8 w-8" />
                            Gemi Düzenle
                        </h1>
                        <p className="text-gray-600">IMO: {ship?.imoNumber || 'Belirtilmemiş'}</p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <Card className="border-red-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gemi Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Temel Bilgiler */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Gemi Adı</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="MV ISTANBUL"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="shipType">Gemi Tipi</Label>
                                <Input
                                    id="shipType"
                                    value={formData.shipType}
                                    onChange={(e) => handleChange('shipType', e.target.value)}
                                    placeholder="Bulk Carrier"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="currentPort">Mevcut Liman</Label>
                                <Input
                                    id="currentPort"
                                    value={formData.currentPort}
                                    onChange={(e) => handleChange('currentPort', e.target.value)}
                                    placeholder="İstanbul Port"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="registrationPort">Sicil Limanı</Label>
                                <Input
                                    id="registrationPort"
                                    value={formData.registrationPort}
                                    onChange={(e) => handleChange('registrationPort', e.target.value)}
                                    placeholder="İstanbul"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="nextAvailableDate">Müsaitlik Tarihi</Label>
                                <Input
                                    id="nextAvailableDate"
                                    type="date"
                                    value={formData.nextAvailableDate}
                                    onChange={(e) => handleChange('nextAvailableDate', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Switches */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="available" className="text-base">Müsait</Label>
                                    <p className="text-sm text-gray-600">Gemi yeni yükler için müsait mi?</p>
                                </div>
                                <Switch
                                    id="available"
                                    checked={formData.available}
                                    onCheckedChange={(checked) => handleChange('available', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="ecoFriendly" className="text-base">Çevre Dostu</Label>
                                    <p className="text-sm text-gray-600">Gemi çevreci sertifikaya sahip mi?</p>
                                </div>
                                <Switch
                                    id="ecoFriendly"
                                    checked={formData.ecoFriendly}
                                    onCheckedChange={(checked) => handleChange('ecoFriendly', checked)}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/dashboard/broker/ships/${shipId}`)}
                                disabled={saving}
                                className="flex-1"
                            >
                                İptal
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Kaydet
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
