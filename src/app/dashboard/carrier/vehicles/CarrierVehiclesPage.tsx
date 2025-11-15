// src/app/dashboard/carrier/vehicles/CarrierVehiclesPage.tsx
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    Truck,
    Save,
    AlertCircle,
    CheckCircle2,
    Plus,
    Edit3,
    Trash2,
    Leaf,
    Package
} from "lucide-react";
import carrierService from '@/services/carrierService';

// Local User type with phone property
type UserWithPhone = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'ADMIN' | 'SENDER' | 'CARRIER' | 'BROKER';
    emailVerified?: boolean;
};

interface Vehicle {
    id: string;
    plateNumber: string;
    type: string;
    ecoCertified: boolean;
    insuranceStatus: boolean;
    inspectionDate: string;
    driverName: string;
    carryingCapacity: number;
    active: boolean;
}

interface VehicleRequest {
    plateNumber: string;
    type: string;
    ecoCertified: boolean;
    insuranceStatus: boolean;
    inspectionDate: string;
    driverName: string;
    carryingCapacity: number;
    carrierId: string;
    active: boolean;
}

interface VehicleUpdateRequest {
    plateNumber?: string;
    type?: string;
    ecoCertified?: boolean;
    insuranceStatus?: boolean;
    inspectionDate?: string;
    driverName?: string;
    carryingCapacity?: number;
    active?: boolean;
}

export default function CarrierVehiclesPage() {
    const { user } = useAuth();
    const userWithPhone = user as UserWithPhone;

    const [isAddVehicleDialogOpen, setIsAddVehicleDialogOpen] = useState(false);
    const [isEditVehicleDialogOpen, setIsEditVehicleDialogOpen] = useState(false);

    // Vehicle form state
    const [vehicleFormData, setVehicleFormData] = useState<{
        plateNumber: string;
        type: string;
        ecoCertified: boolean;
        insuranceStatus: boolean;
        inspectionDate: string;
        driverName: string;
        carryingCapacity: number;
        active: boolean;
    }>({
        plateNumber: '',
        type: '',
        ecoCertified: false,
        insuranceStatus: false,
        inspectionDate: '',
        driverName: '',
        carryingCapacity: 0,
        active: true
    });

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

    // Vehicle management state
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

    // Vehicle types
    const vehicleTypes = carrierService.getVehicleTypes();

    // Utility function
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date received:', dateString);
                return '';
            }
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Date formatting error:', error, 'for date:', dateString);
            return '';
        }
    };

    // Load existing profile and vehicles
    useEffect(() => {
        const loadData = async () => {
            if (!userWithPhone?.id) return;

            try {
                setIsLoading(true);

                // Load carrier profile
                try {
                    const profile = await carrierService.getCarrierProfileByUserId(userWithPhone.id);
                    setCurrentProfileId(profile.id);

                    // Load vehicles
                    try {
                        const userVehicles = await carrierService.getVehiclesByCarrier(profile.id);
                        setVehicles(userVehicles);
                    } catch (vehicleError) {
                        console.log('No vehicles found:', vehicleError);
                    }

                } catch (profileError) {
                    console.log('No existing profile found');
                    setError('Önce profil oluşturmanız gerekmektedir.');
                }

            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [userWithPhone]);

    // Handle vehicle form changes
    const handleVehicleInputChange = (field: string, value: any) => {
        setVehicleFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // Add new vehicle
    const handleAddVehicle = async () => {
        if (!currentProfileId) {
            setError('Önce profili kaydetmelisiniz');
            return;
        }

        try {
            setError('');

            // Validate required fields
            if (!vehicleFormData.plateNumber || !vehicleFormData.type || !vehicleFormData.driverName) {
                setError('Plaka, araç tipi ve sürücü adı zorunludur');
                return;
            }

            const vehiclePayload: VehicleRequest = {
                plateNumber: vehicleFormData.plateNumber,
                type: vehicleFormData.type,
                ecoCertified: vehicleFormData.ecoCertified,
                insuranceStatus: vehicleFormData.insuranceStatus,
                inspectionDate: vehicleFormData.inspectionDate,
                driverName: vehicleFormData.driverName,
                carryingCapacity: vehicleFormData.carryingCapacity,
                carrierId: currentProfileId,
                active: vehicleFormData.active
            };

            const newVehicle = await carrierService.createVehicle(vehiclePayload);
            setVehicles(prev => [...prev, newVehicle]);

            // Reset form
            setVehicleFormData({
                plateNumber: '',
                type: '',
                ecoCertified: false,
                insuranceStatus: false,
                inspectionDate: '',
                driverName: '',
                carryingCapacity: 0,
                active: true
            });

            setIsAddVehicleDialogOpen(false);
            setSuccess('Araç başarıyla eklendi!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (error: any) {
            console.error('Add vehicle error:', error);
            setError(error.response?.data?.message || 'Araç eklenemedi');
        }
    };

    // Update vehicle
    const handleUpdateVehicle = async (vehicleId: string) => {
        try {
            setError('');

            const updatePayload: VehicleUpdateRequest = {
                type: vehicleFormData.type,
                ecoCertified: vehicleFormData.ecoCertified,
                insuranceStatus: vehicleFormData.insuranceStatus,
                inspectionDate: vehicleFormData.inspectionDate,
                driverName: vehicleFormData.driverName,
                carryingCapacity: vehicleFormData.carryingCapacity,
                active: vehicleFormData.active
            };

            const updatedVehicle = await carrierService.updateVehicle(vehicleId, updatePayload);
            setVehicles(prev => prev.map(v => v.id === vehicleId ? updatedVehicle : v));

            setEditingVehicleId(null);
            setIsEditVehicleDialogOpen(false);
            setSuccess('Araç başarıyla güncellendi!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (error: any) {
            console.error('Update vehicle error:', error);
            setError(error.response?.data?.message || 'Araç güncellenemedi');
        }
    };

    // Delete vehicle
    const handleDeleteVehicle = async (vehicleId: string) => {
        if (!window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await carrierService.deleteVehicle(vehicleId);
            setVehicles(prev => prev.filter(v => v.id !== vehicleId));
            setSuccess('Araç başarıyla silindi!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            console.error('Delete vehicle error:', error);
            setError(error.response?.data?.message || 'Araç silinemedi');
        }
    };

    // Start editing vehicle
    const startEditingVehicle = (vehicle: Vehicle) => {
        setVehicleFormData({
            plateNumber: vehicle.plateNumber,
            type: vehicle.type,
            ecoCertified: vehicle.ecoCertified,
            insuranceStatus: vehicle.insuranceStatus,
            inspectionDate: formatDate(vehicle.inspectionDate),
            driverName: vehicle.driverName,
            carryingCapacity: vehicle.carryingCapacity,
            active: vehicle.active
        });
        setEditingVehicleId(vehicle.id);
        setIsEditVehicleDialogOpen(true);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingVehicleId(null);
        setIsAddVehicleDialogOpen(false);
        setIsEditVehicleDialogOpen(false);
        setVehicleFormData({
            plateNumber: '',
            type: '',
            ecoCertified: false,
            insuranceStatus: false,
            inspectionDate: '',
            driverName: '',
            carryingCapacity: 0,
            active: true
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Araçlar yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 flex items-center justify-center">
                                <Truck className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Araçlarım
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Araç filonuzu yönetin
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Vehicle List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Araç Listem ({vehicles.length})
                        </CardTitle>
                        <Button
                            onClick={() => {
                                setIsAddVehicleDialogOpen(true);
                                setEditingVehicleId(null);
                                setVehicleFormData({
                                    plateNumber: '',
                                    type: '',
                                    ecoCertified: false,
                                    insuranceStatus: false,
                                    inspectionDate: '',
                                    driverName: '',
                                    carryingCapacity: 0,
                                    active: true
                                });
                            }}
                            variant="default"
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Araç Ekle
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Vehicle List */}
                    {vehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded border">
                                                <Truck className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {vehicle.plateNumber}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {vehicle.type} • {vehicle.carryingCapacity} ton
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {vehicle.ecoCertified && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    <Leaf className="h-3 w-3 mr-1" />
                                                    Çevre Dostu
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditingVehicle(vehicle)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Sürücü:</span>
                                            <p className="font-medium">{vehicle.driverName}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Muayene:</span>
                                            <p className="font-medium">
                                                {vehicle.inspectionDate ?
                                                    new Date(vehicle.inspectionDate).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    })
                                                    : 'Belirtilmemiş'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Sigorta:</span>
                                            <p className={`font-medium ${vehicle.insuranceStatus ? 'text-green-600' : 'text-red-600'}`}>
                                                {vehicle.insuranceStatus ? '✅ Var' : '❌ Yok'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Durum:</span>
                                            <p className={`font-medium ${vehicle.active ? 'text-green-600' : 'text-gray-500'}`}>
                                                {vehicle.active ? 'Aktif' : 'Pasif'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">Henüz araç eklenmemiş</p>
                            <p className="text-sm">İlk aracınızı eklemek için yukarıdaki butona tıklayın</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Vehicle Dialog */}
            <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Yeni Araç Ekle
                        </DialogTitle>
                        <DialogDescription>
                            Yeni araç bilgilerini girerek filo listenize ekleyin
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => { e.preventDefault(); handleAddVehicle(); }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="plateNumber">Plaka Numarası *</Label>
                                <Input
                                    id="plateNumber"
                                    value={vehicleFormData.plateNumber}
                                    onChange={(e) => handleVehicleInputChange('plateNumber', e.target.value)}
                                    placeholder="34 ABC 123"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleType">Araç Tipi *</Label>
                                <Select
                                    value={vehicleFormData.type}
                                    onValueChange={(value) => handleVehicleInputChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Araç tipini seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="driverName">Sürücü Adı *</Label>
                                <Input
                                    id="driverName"
                                    value={vehicleFormData.driverName}
                                    onChange={(e) => handleVehicleInputChange('driverName', e.target.value)}
                                    placeholder="Sürücü adını girin"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="carryingCapacity">Taşıma Kapasitesi (ton)</Label>
                                <Input
                                    id="carryingCapacity"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={vehicleFormData.carryingCapacity}
                                    onChange={(e) => handleVehicleInputChange('carryingCapacity', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="inspectionDate">Muayene Tarihi</Label>
                                <Input
                                    id="inspectionDate"
                                    type="date"
                                    value={vehicleFormData.inspectionDate}
                                    onChange={(e) => handleVehicleInputChange('inspectionDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Switches */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <Label htmlFor="ecoCertified" className="font-medium">
                                        Çevre Dostu Araç
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Bu araç çevre dostu sertifikasına sahip mi?
                                    </p>
                                </div>
                                <Switch
                                    id="ecoCertified"
                                    checked={vehicleFormData.ecoCertified}
                                    onCheckedChange={(checked) => handleVehicleInputChange('ecoCertified', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <Label htmlFor="insuranceStatus" className="font-medium">
                                        Sigorta Durumu
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Aracın sigortası mevcut mu?
                                    </p>
                                </div>
                                <Switch
                                    id="insuranceStatus"
                                    checked={vehicleFormData.insuranceStatus}
                                    onCheckedChange={(checked) => handleVehicleInputChange('insuranceStatus', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <Label htmlFor="active" className="font-medium">
                                        Araç Durumu
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Bu araç aktif olarak kullanılıyor mu?
                                    </p>
                                </div>
                                <Switch
                                    id="active"
                                    checked={vehicleFormData.active}
                                    onCheckedChange={(checked) => handleVehicleInputChange('active', checked)}
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                type="submit"
                                className="flex items-center gap-2 flex-1"
                            >
                                <Save className="h-4 w-4" />
                                Araç Ekle
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEditing}
                                className="flex-1"
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Vehicle Dialog */}
            <Dialog open={isEditVehicleDialogOpen} onOpenChange={setIsEditVehicleDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5" />
                            Araç Düzenle
                        </DialogTitle>
                        <DialogDescription>
                            Mevcut araç bilgilerini güncelleyin
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={(e) => { e.preventDefault(); editingVehicleId && handleUpdateVehicle(editingVehicleId); }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="plateNumber">Plaka Numarası</Label>
                                <Input
                                    id="plateNumber"
                                    value={vehicleFormData.plateNumber}
                                    disabled
                                    className="bg-gray-100"
                                />
                                <p className="text-xs text-gray-500">Plaka numarası değiştirilemez</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicleType">Araç Tipi *</Label>
                                <Select
                                    value={vehicleFormData.type}
                                    onValueChange={(value) => handleVehicleInputChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Araç tipini seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="driverName">Sürücü Adı *</Label>
                                <Input
                                    id="driverName"
                                    value={vehicleFormData.driverName}
                                    onChange={(e) => handleVehicleInputChange('driverName', e.target.value)}
                                    placeholder="Sürücü adını girin"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="carryingCapacity">Taşıma Kapasitesi (ton)</Label>
                                <Input
                                    id="carryingCapacity"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={vehicleFormData.carryingCapacity}
                                    onChange={(e) => handleVehicleInputChange('carryingCapacity', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="inspectionDate">Muayene Tarihi</Label>
                                <Input
                                    id="inspectionDate"
                                    type="date"
                                    value={vehicleFormData.inspectionDate}
                                    onChange={(e) => handleVehicleInputChange('inspectionDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Switches */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <Label htmlFor="ecoCertified" className="font-medium">
                                        Çevre Dostu Araç
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Bu araç çevre dostu sertifikasına sahip mi?
                                    </p>
                                </div>
                                <Switch
                                    id="ecoCertified"
                                    checked={vehicleFormData.ecoCertified}
                                    onCheckedChange={(checked) => handleVehicleInputChange('ecoCertified', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <Label htmlFor="insuranceStatus" className="font-medium">
                                        Sigorta Durumu
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Aracın sigortası mevcut mu?
                                    </p>
                                </div>
                                <Switch
                                    id="insuranceStatus"
                                    checked={vehicleFormData.insuranceStatus}
                                    onCheckedChange={(checked) => handleVehicleInputChange('insuranceStatus', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <Label htmlFor="active" className="font-medium">
                                        Araç Durumu
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        Bu araç aktif olarak kullanılıyor mu?
                                    </p>
                                </div>
                                <Switch
                                    id="active"
                                    checked={vehicleFormData.active}
                                    onCheckedChange={(checked) => handleVehicleInputChange('active', checked)}
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4">
                            <Button
                                type="submit"
                                className="flex items-center gap-2 flex-1"
                            >
                                <Save className="h-4 w-4" />
                                Güncelle
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEditing}
                                className="flex-1"
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
