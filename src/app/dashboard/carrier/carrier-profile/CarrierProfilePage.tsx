// src/app/dashboard/carrier/carrier-profile/CarrierProfilePage.tsx
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";


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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    Building2,
    User,
    Truck,
    Save,
    AlertCircle,
    CheckCircle2,
    Leaf,
    Phone
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import carrierService from '@/services/carrierService';
import AccountTypeChangeSection from '@/components/AccountTypeChangeSection';

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



    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);



    // Load existing profile
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
                    <div className="flex items-center gap-4">
                        {/* Logo/Fotoğraf */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 flex items-center justify-center">
                                {profileData.company ? (
                                    <Building2 className="h-10 w-10 text-blue-600" />
                                ) : (
                                    <Truck className="h-10 w-10 text-blue-600" />
                                )}
                            </div>
                        </div>

                        {/* Başlık ve Açıklama */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {profileData.name || 'Taşıyıcı Profilim'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {profileData.company ? 'Firma Profili' : 'Bireysel Taşıyıcı Profili'}
                            </p>
                        </div>
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

            <div className="max-w-3xl mx-auto">
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
            </div>

            {/* Hesap Türü Değiştirme Bölümü */}
            <div className="mt-8">
                <AccountTypeChangeSection />
            </div>
        </div>
    );
}