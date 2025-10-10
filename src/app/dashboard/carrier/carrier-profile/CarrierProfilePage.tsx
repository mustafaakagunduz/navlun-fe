// src/app/dashboard/carrier/carrier-profile/CarrierProfilePage.tsx
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    X,
    Building2,
    User,
    Truck,
    Mail,
    Phone,
    Save,
    AlertCircle,
    CheckCircle2,
    Plus,
    Edit3,
    Trash2,
    Shield,
    CreditCard,
    Leaf,
    Calendar,
    Package
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import carrierService from '@/services/carrierService';

// Local types for carrier profile
interface CarrierProfile {
    id?: string;
    company: boolean;
    companyName: string;
    taxNumber?: string;
    iban?: string;
    isEcoFriendly: boolean;
    driverLicense?: string;
    phone?: string;
    email?: string;
}

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

export default function CarrierProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Type assertion for user with phone
    const userWithPhone = user as UserWithPhone;

    // Form state for carrier profile
    const [profileData, setProfileData] = useState({
        company: false,
        name: '',
        taxNumber: '',
        iban: '',
        isEcoFriendly: false,
        driverLicense: '',
        phone: '',
        email: '',
    });


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
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

    // Vehicle management state
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

    // Vehicle types
    const vehicleTypes = carrierService.getVehicleTypes();

    // Utility functionss
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';

        try {
            // Backend'den gelen tarih formatını kontrol et
            const date = new Date(dateString);

            // Geçerli tarih mi kontrol et
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
        const loadProfile = async () => {
            if (!userWithPhone?.id) return;

            try {
                setIsLoading(true);

                // Load carrier profile
                try {
                    const profile = await carrierService.getCarrierProfileByUserId(userWithPhone.id);
                    setProfileData({
                        company: profile.company,
                        name: profile.name || '',
                        taxNumber: profile.taxNumber || '',
                        iban: profile.iban || '',
                        isEcoFriendly: profile.isEcoFriendly || false,
                        driverLicense: profile.driverLicense || '',
                        phone: userWithPhone.phone || '',
                        email: userWithPhone.email || '',
                    });
                    setHasExistingProfile(true);
                    setCurrentProfileId(profile.id);

                    // Load vehicles
                    try {
                        const userVehicles = await carrierService.getVehiclesByCarrier(profile.id);
                        setVehicles(userVehicles);
                    } catch (vehicleError) {
                        console.log('No vehicles found:', vehicleError);
                    }

                } catch (profileError) {
                    console.log('No existing profile found, creating new one');
                    setProfileData(prev => ({
                        ...prev,
                        phone: userWithPhone?.phone || '',
                        email: userWithPhone?.email || ''
                    }));
                    setHasExistingProfile(false);
                    setCurrentProfileId(null);
                }

            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [userWithPhone]);

    // Handle profile form changes
    const handleProfileInputChange = (field: string, value: any) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // Handle vehicle form changes
    const handleVehicleInputChange = (field: string, value: any) => {
        setVehicleFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // Save carrier profile
    const handleSaveProfile = async () => {
        if (!userWithPhone?.id) {
            setError('Kullanıcı bilgileri bulunamadı');
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            const profilePayload = {
                userId: userWithPhone.id,
                company: profileData.company,
                name: profileData.name,
                taxNumber: profileData.taxNumber,
                iban: profileData.iban,
                isEcoFriendly: profileData.isEcoFriendly,
                driverLicense: profileData.driverLicense
            };

            let savedProfile;
            if (hasExistingProfile && currentProfileId) {
                // Update için sadece gerekli alanları gönder (userId hariç)
                const updatePayload = {
                    company: profileData.company,
                    name: profileData.name,
                    taxNumber: profileData.taxNumber,
                    iban: profileData.iban,
                    isEcoFriendly: profileData.isEcoFriendly,
                    driverLicense: profileData.driverLicense,

                };
                savedProfile = await carrierService.updateCarrierProfile(currentProfileId, updatePayload);
            } else {
                savedProfile = await carrierService.createCarrierProfile(profilePayload);
                setHasExistingProfile(true);
                setCurrentProfileId(savedProfile.id);
            }

            setSuccess('Profil başarıyla kaydedildi!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (error: any) {
            console.error('Save profile error:', error);
            setError(error.response?.data?.message || 'Profil kaydedilemedi');
        } finally {
            setIsSaving(false);
        }
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

            setIsAddVehicleDialogOpen(false); // Dialog'u kapat
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
            setIsEditVehicleDialogOpen(false); // Bu satırı ekleyin
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
        setIsEditVehicleDialogOpen(false); // Bu satırı ekleyin
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
                    <span className="text-gray-600">Profil yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Taşıyıcı Profilim
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Profil bilgilerinizi ve araçlarınızı yönetin
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Profili Kaydet
                            </>
                        )}
                    </Button>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Profile Information */}
                <div className="space-y-6">
                    {/* User Type Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Hesap Türü
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={profileData.company ? "company" : "individual"}
                                onValueChange={(value) => handleProfileInputChange('company', value === 'company')}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                    <RadioGroupItem value="individual" id="individual" />
                                    <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                                        <User className="h-4 w-4" />
                                        Bireysel
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                    <RadioGroupItem value="company" id="company" />
                                    <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                                        <Building2 className="h-4 w-4" />
                                        Firma
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Temel Bilgiler
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    {profileData.company ? 'Firma Adı *' : 'Ad Soyad *'}
                                </Label>
                                <Input
                                    id="name"
                                    value={profileData.name}
                                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                                    placeholder={profileData.company ? 'Firma adınızı girin' : 'Adınızı ve soyadınızı girin'}
                                    required
                                />
                            </div>

                            {profileData.company && (
                                <div className="space-y-2">
                                    <Label htmlFor="taxNumber">Vergi Numarası (Opsiyonel)</Label>
                                    <Input
                                        id="taxNumber"
                                        value={profileData.taxNumber}
                                        onChange={(e) => handleProfileInputChange('taxNumber', e.target.value)}
                                        placeholder="Vergi numaranızı girin"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="iban">IBAN *</Label>
                                <Input
                                    id="iban"
                                    value={profileData.iban}
                                    onChange={(e) => handleProfileInputChange('iban', e.target.value)}
                                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="driverLicense">Ehliyet</Label>
                                <Input
                                    id="driverLicense"
                                    value={profileData.driverLicense}
                                    onChange={(e) => handleProfileInputChange('driverLicense', e.target.value)}
                                    placeholder="Ehliyet sınıfınızı girin (örn: B, C, CE)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                İletişim Bilgileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    value={profileData.phone}
                                    onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                                    placeholder="Telefon numaranızı girin"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                                    placeholder="E-posta adresinizi girin"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Eco-Friendly Certification */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="h-5 w-5" />
                                Çevre Dostu Taşımacılık
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <Label htmlFor="ecoFriendly" className="font-medium">
                                        Araç Çevre Dostu mu?
                                    </Label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Bu seçenek profilinizde ve tekliflerinizde görünecektir
                                    </p>
                                </div>
                                <Switch
                                    id="ecoFriendly"
                                    checked={profileData.isEcoFriendly}
                                    onCheckedChange={(checked) => handleProfileInputChange('isEcoFriendly', checked)}
                                />
                            </div>
                            {profileData.isEcoFriendly && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Leaf className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">
                                            ✅ Çevre Dostu Taşıyıcı
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-700 mt-1">
                                        Bu profil çevre dostu taşımacılık kategorisinde görünecektir
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Vehicle Management */}
                <div className="space-y-6">
                    {/* Vehicle List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Araçlarım ({vehicles.length})
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
                                    variant="outline"
                                    size="sm"
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
                                <div className="space-y-3">
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
                                <div className="text-center py-8 text-gray-500">
                                    <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>Henüz araç eklenmemiş</p>
                                    <p className="text-sm">İlk aracınızı eklemek için yukarıdaki butona tıklayın</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vehicle Form */}
                    <Dialog open={isAddVehicleDialogOpen} onOpenChange={setIsAddVehicleDialogOpen}>
                        <DialogContent className="max-w-2xl">
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

                    {/* Araç Düzenleme Dialog'u */}
                    <Dialog open={isEditVehicleDialogOpen} onOpenChange={setIsEditVehicleDialogOpen}>
                        <DialogContent className="max-w-2xl">
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
            </div>
        </div>
    );
}