// src/components/dashboard/sender/SenderProfilePage.tsx
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';
import linkedAccountService, { LinkedAccount, CreateLinkedAccountDto } from '@/services/linkedAccountService';

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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    Upload,
    X,
    Building2,
    User,
    FileText,
    Mail,
    Phone,
    Save,
    AlertCircle,
    CheckCircle2,
    Eye,
    Download,
    Trash2,
    Plus,
    Lock
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import senderService from '@/services/senderService';
import AccountTypeChangeSection from '@/components/AccountTypeChangeSection';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function SenderProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Type assertion for user with phone
    const userWithPhone = user as UserWithPhone;

    // Form state
    const [formData, setFormData] = useState({
        company: false,
        companyName: '',
        productionTypes: [] as string[],
        certificates: [] as string[],
        certificateFiles: [] as File[],
        phone: '',
        email: '',
        billingInfo: ''
    });

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

    // Yeni dosya yönetimi state'leri
    const [uploadedFiles, setUploadedFiles] = useState<{
        id: string;
        name: string;
        size: string;
        type: string;
        url?: string;
        downloadUrl?: string;
        viewUrl?: string; // EKLENEN
        uploadDate: string;
        isPermanent?: boolean;
    }[]>([]);

    // Linked Accounts states
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [loadingLinkedAccounts, setLoadingLinkedAccounts] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newLinkedAccount, setNewLinkedAccount] = useState<CreateLinkedAccountDto>({
        email: '',
        password: '',
        displayName: ''
    });
    const [addingLinkedAccount, setAddingLinkedAccount] = useState(false);

    // Predefined data
    const productionTypeOptions = [
        'Gıda Üretimi',
        'Tekstil Üretimi',
        'Otomotiv Parçaları',
        'Elektronik Cihazlar',
        'İnşaat Malzemeleri',
        'Kimyasal Ürünler',
        'Metal İşleme',
        'Plastik Ürünler',
        'Cam Ürünleri',
        'Mobilya Üretimi'
    ];

    const certificateOptions = [
        'ISO 9001',
        'ISO 14001',
        'ISO 45001',
        'TSE',
        'CE Belgesi',
        'FDA Onayı',
        'Helal Sertifikası',
        'Organik Sertifikası',
        'HACCP',
        'BRC Sertifikası'
    ];

    // Dosya boyutunu formatlamak için yardımcı fonksiyon
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Load existing profile and files
    useEffect(() => {
        const loadProfile = async () => {
            if (!userWithPhone?.id) return;

            try {
                setIsLoading(true);
                const profile = await senderService.getSenderProfileByUserId(userWithPhone.id);

                setFormData({
                    company: profile.company,
                    companyName: profile.companyName || '',
                    productionTypes: profile.productionTypes || [],
                    certificates: profile.certificates || [],
                    certificateFiles: [],
                    phone: profile.phone || userWithPhone.phone || '',
                    email: profile.email || userWithPhone.email || '',
                    billingInfo: profile.billingInfo || ''
                });
                setHasExistingProfile(true);
                setCurrentProfileId(profile.id);

                // Mevcut dosyaları yükle
                try {
                    const existingFiles = await senderService.getCertificateFilesByProfileId(profile.id);
                    const formattedFiles = existingFiles.map(file => ({
                        id: file.id,
                        name: file.originalFileName,
                        size: formatFileSize(file.fileSize),
                        type: file.contentType,
                        url: file.viewUrl,
                        viewUrl: file.viewUrl, // EKLENEN
                        downloadUrl: file.downloadUrl,
                        uploadDate: formatDateTime(file.createdAt),
                        isPermanent: true
                    }));
                    setUploadedFiles(formattedFiles);
                } catch (fileError) {
                    console.log('No existing files found or error loading files:', fileError);
                }

            } catch (error) {
                console.log('No existing profile found, creating new one');
                setFormData(prev => ({
                    ...prev,
                    phone: userWithPhone?.phone || '',
                    email: userWithPhone?.email || ''
                }));
                setHasExistingProfile(false);
                setCurrentProfileId(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
        loadLinkedAccounts();
    }, [userWithPhone]);

    // Linked Accounts fonksiyonları
    const loadLinkedAccounts = async () => {
        try {
            const accounts = await linkedAccountService.getLinkedAccounts();
            setLinkedAccounts(accounts);
        } catch (error) {
            console.error('Load linked accounts error:', error);
        } finally {
            setLoadingLinkedAccounts(false);
        }
    };

    const handleAddLinkedAccount = async () => {
        if (!newLinkedAccount.email || !newLinkedAccount.password) {
            setError('Email ve şifre gereklidir');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setAddingLinkedAccount(true);
        try {
            await linkedAccountService.createLinkedAccount(newLinkedAccount);
            setSuccess('Bağlı hesap başarıyla eklendi');
            setTimeout(() => setSuccess(''), 3000);
            setShowAddDialog(false);
            setNewLinkedAccount({ email: '', password: '', displayName: '' });
            loadLinkedAccounts();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Bağlı hesap eklenirken bir hata oluştu');
            setTimeout(() => setError(''), 3000);
        } finally {
            setAddingLinkedAccount(false);
        }
    };

    const handleDeleteLinkedAccount = async (id: string) => {
        if (!confirm('Bu bağlı hesabı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await linkedAccountService.deleteLinkedAccount(id);
            setSuccess('Bağlı hesap başarıyla silindi');
            setTimeout(() => setSuccess(''), 3000);
            loadLinkedAccounts();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Bağlı hesap silinirken bir hata oluştu');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Handle form changes
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleProductionTypeAdd = (type: string) => {
        if (!formData.productionTypes.includes(type)) {
            setFormData(prev => ({
                ...prev,
                productionTypes: [...prev.productionTypes, type]
            }));
        }
    };

    const handleProductionTypeRemove = useCallback((typeToRemove: string) => {
        console.log('Removing production type:', typeToRemove);

        setFormData(currentData => {
            const filteredTypes = currentData.productionTypes.filter(type => type !== typeToRemove);
            console.log('Filtered types:', filteredTypes);

            return {
                ...currentData,
                productionTypes: filteredTypes
            };
        });
    }, []);

    const handleCertificateRemove = useCallback((certToRemove: string) => {
        console.log('Removing certificate:', certToRemove);

        setFormData(currentData => {
            const filteredCertificates = currentData.certificates.filter(cert => cert !== certToRemove);
            console.log('Filtered certificates:', filteredCertificates);

            return {
                ...currentData,
                certificates: filteredCertificates
            };
        });
    }, []);

    const handleCertificateAdd = (cert: string) => {
        if (!formData.certificates.includes(cert)) {
            setFormData(prev => ({
                ...prev,
                certificates: [...prev.certificates, cert]
            }));
        }
    };

    // Geliştirilmiş dosya yükleme fonksiyonu
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        // Dosya tipini kontrol et
        const invalidFiles = files.filter(file =>
            !file.type.includes('pdf') &&
            !file.type.startsWith('image/')
        );

        if (invalidFiles.length > 0) {
            setError('Sadece PDF ve resim dosyaları yüklenebilir');
            return;
        }

        // Dosya boyutunu kontrol et (5MB limit)
        const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (largeFiles.length > 0) {
            setError('Dosya boyutu 5MB\'dan büyük olamaz');
            return;
        }

        // Geliştirme aşamasında dosyaları local olarak sakla
        const newFiles = files.map(file => ({
            id: crypto.randomUUID?.() || Math.random().toString(36),
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            url: URL.createObjectURL(file), // Önizleme için
            uploadDate: formatDateTime(new Date().toISOString()),
            isPermanent: false
        }));

        // Mevcut dosyaları güncelle
        setUploadedFiles(prev => [...prev, ...newFiles]);

        // Form data'ya da ekle (backend için)
        setFormData(prev => ({
            ...prev,
            certificateFiles: [...prev.certificateFiles, ...files]
        }));

        // Input'u temizle
        event.target.value = '';
        setError('');
    };

    // Dosya silme fonksiyonu
    const handleFileRemove = async (fileId: string) => {
        // Silme işlemini onaylat
        if (!window.confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const fileToRemove = uploadedFiles.find(f => f.id === fileId);

            if (fileToRemove?.isPermanent && currentProfileId) {
                // Backend'den sil (kaydedilmiş dosya)
                await senderService.deleteCertificateFile(currentProfileId, fileId);
            }

            // UI'dan kaldır
            setUploadedFiles(prev => {
                const fileToRemove = prev.find(f => f.id === fileId);
                if (fileToRemove?.url && !fileToRemove.isPermanent) {
                    URL.revokeObjectURL(fileToRemove.url); // Memory temizliği
                }
                return prev.filter(f => f.id !== fileId);
            });

            // Form data'dan da sil (henüz kaydedilmemiş dosyalar için)
            setFormData(prev => {
                const fileIndex = uploadedFiles.findIndex(f => f.id === fileId);
                if (fileIndex !== -1 && fileIndex < prev.certificateFiles.length) {
                    const newFiles = [...prev.certificateFiles];
                    newFiles.splice(fileIndex, 1);
                    return { ...prev, certificateFiles: newFiles };
                }
                return prev;
            });

            setSuccess('Dosya başarıyla silindi');
            setTimeout(() => setSuccess(''), 2000);

        } catch (error: any) {
            console.error('File delete error:', error);
            setError('Dosya silinirken hata oluştu: ' + (error.response?.data?.message || error.message));
            setTimeout(() => setError(''), 3000);
        }
    };

    // Dosya önizleme fonksiyonu
    const handleFilePreview = (file: { url?: string; type: string; name: string }) => {
        if (!file.url) return;

        if (file.type.startsWith('image/')) {
            // Resim için modal açabilir veya yeni sekmede açabilirsiniz
            window.open(file.url, '_blank');
        } else if (file.type.includes('pdf')) {
            // PDF için yeni sekmede aç
            window.open(file.url, '_blank');
        }
    };

    // Save profile
    const handleSave = async () => {
        if (!userWithPhone?.id) {
            setError(t('senderProfile.userNotFound'));
            return;
        }

        try {
            setIsSaving(true);
            setError('');

            const profileData = {
                userId: userWithPhone.id,
                company: formData.company,
                companyName: formData.companyName,
                productionTypes: formData.productionTypes,
                certificates: formData.certificates,
                billingInfo: formData.billingInfo,
                phone: formData.phone,
                email: formData.email
            };

            let savedProfile;
            if (hasExistingProfile && currentProfileId) {
                savedProfile = await senderService.updateSenderProfile(currentProfileId, profileData);
            } else {
                savedProfile = await senderService.createSenderProfile(profileData);
                setHasExistingProfile(true);
                setCurrentProfileId(savedProfile.id);
            }

            // Dosya yükleme işlemi - SADECE yeni dosyalar varsa
            if (formData.certificateFiles.length > 0) {
                try {
                    const uploadedFileNames = await senderService.uploadCertificateFiles(
                        savedProfile.id || currentProfileId!,
                        formData.certificateFiles
                    );

                    console.log('Uploaded files:', uploadedFileNames);

                    // Dosyalar başarıyla yüklendikten sonra dosya listesini yenile
                    try {
                        const refreshedFiles = await senderService.getCertificateFilesByProfileId(savedProfile.id || currentProfileId!);
                        const formattedFiles = refreshedFiles.map(file => ({
                            id: file.id,
                            name: file.originalFileName,
                            size: formatFileSize(file.fileSize),
                            type: file.contentType,
                            url: file.viewUrl,
                            viewUrl: file.viewUrl, // EKLENEN
                            downloadUrl: file.downloadUrl,
                            uploadDate: formatDateTime(file.createdAt),
                            isPermanent: true
                        }));
                        setUploadedFiles(formattedFiles);
                    } catch (refreshError) {
                        console.error('Error refreshing file list:', refreshError);
                    }

                    // Geçici dosyaları temizle
                    setFormData(prev => ({
                        ...prev,
                        certificateFiles: []
                    }));

                } catch (fileError) {
                    console.error('File upload error:', fileError);
                    setError('Profil kaydedildi ancak dosya yükleme başarısız oldu');
                }
            }

            setSuccess(t('senderProfile.saved'));
            setTimeout(() => setSuccess(''), 3000);

        } catch (error: any) {
            console.error('Save error:', error);
            setError(error.response?.data?.message || t('senderProfile.error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">{t('senderProfile.loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('senderProfile.title')}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Profil bilgilerinizi güncelleyin ve hesabınızı yönetin
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('senderProfile.saving')}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {t('senderProfile.save')}
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

            <div className="space-y-6">
                {/* User Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t('senderProfile.userType.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={formData.company ? "company" : "individual"}
                            onValueChange={(value) => handleInputChange('company', value === 'company')}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                <RadioGroupItem value="individual" id="individual" />
                                <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                                    <User className="h-4 w-4" />
                                    {t('senderProfile.userType.individual')}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                <RadioGroupItem value="company" id="company" />
                                <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                                    <Building2 className="h-4 w-4" />
                                    {t('senderProfile.userType.company')}
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Company Information */}
                {formData.company && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {t('senderProfile.companyInfo.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Company Name */}
                            <div className="space-y-2">
                                <Label htmlFor="companyName">
                                    {t('senderProfile.companyInfo.companyNameRequired')}
                                </Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    placeholder={t('senderProfile.companyInfo.companyNamePlaceholder')}
                                    required
                                />
                            </div>

                            <Separator />

                            {/* Production Types */}
                            <div className="space-y-3">
                                <Label>{t('senderProfile.companyInfo.productionTypes')}</Label>
                                <Select onValueChange={handleProductionTypeAdd}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('senderProfile.companyInfo.productionTypesPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productionTypeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {formData.productionTypes.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.productionTypes.map((type, index) => (
                                            <Badge
                                                key={`${type}-${index}`}
                                                variant="secondary"
                                                className="flex items-center gap-2 py-1 px-2"
                                            >
                                                <span>{type}</span>
                                                <button
                                                    type="button"
                                                    className="ml-1 hover:text-red-500 cursor-pointer transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleProductionTypeRemove(type);
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Certificates */}
                            <div className="space-y-3">
                                <Label>{t('senderProfile.companyInfo.certificates')}</Label>
                                <Select onValueChange={handleCertificateAdd}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('senderProfile.companyInfo.certificatesPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {certificateOptions.map((cert) => (
                                            <SelectItem key={cert} value={cert}>
                                                {cert}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {formData.certificates.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.certificates.map((cert, index) => (
                                            <Badge
                                                key={`${cert}-${index}`}
                                                variant="outline"
                                                className="flex items-center gap-2 py-1 px-2"
                                            >
                                                <span>{cert}</span>
                                                <button
                                                    type="button"
                                                    className="ml-1 hover:text-red-500 cursor-pointer transition-colors"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleCertificateRemove(cert);
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Certificate Files - Geliştirilmiş UI */}
                            <div className="space-y-3">
                                <Label>{t('senderProfile.companyInfo.certificateFiles')}</Label>

                                {/* Dosya Yükleme Alanı */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="certificateFiles"
                                    />
                                    <Label
                                        htmlFor="certificateFiles"
                                        className="cursor-pointer flex flex-col items-center gap-3"
                                    >
                                        <div className="p-3 bg-gray-100 rounded-full">
                                            <Upload className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-gray-700">
                                                {t('senderProfile.companyInfo.selectFile')}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                PDF, JPG, PNG dosyaları desteklenir (Max: 5MB)
                                            </p>
                                        </div>
                                    </Label>
                                </div>

                                {/* Yüklenen Dosyalar Listesi */}
                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-gray-700">Yüklenen Dosyalar:</p>
                                        <div className="grid gap-3">
                                            {uploadedFiles.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {/* Dosya İkonu */}
                                                        <div className="p-2 bg-white rounded border">
                                                            {file.type.startsWith('image/') && file.url ? (
                                                                <img
                                                                    src={file.url}
                                                                    alt={file.name}
                                                                    className="h-8 w-8 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <FileText className="h-6 w-6 text-red-600" />
                                                            )}
                                                        </div>

                                                        {/* Dosya Bilgileri */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {file.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500">{file.size}</span>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-500">{file.uploadDate}</span>
                                                                {file.isPermanent && (
                                                                    <>
                                                                        <span className="text-xs text-gray-400">•</span>
                                                                        <span className="text-xs text-green-600">Kaydedildi</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Dosya Aksiyon Butonları */}
                                                    <div className="flex items-center gap-2">
                                                        {/* Önizleme Butonu - SADECE GÖRÜNTÜLE */}
                                                        {(file.url || file.viewUrl) && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    // ÖNCE viewUrl'i dene, yoksa url'i kullan
                                                                    const displayUrl = file.viewUrl || file.url;
                                                                    if (displayUrl) {
                                                                        // Yeni sekmede aç (görüntüleme için)
                                                                        window.open(displayUrl, '_blank');
                                                                    }
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                                                title="Görüntüle"
                                                            >
                                                                <Eye className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        )}

                                                        {/* İndirme Butonu - SADECE İNDİR */}
                                                        {(file.url || file.downloadUrl) && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const downloadUrl = file.downloadUrl || file.url;
                                                                    if (downloadUrl) {
                                                                        if (file.isPermanent) {
                                                                            // ✅ Backend dosyası için: Doğrudan link ile indirme
                                                                            const a = document.createElement('a');
                                                                            a.href = downloadUrl;
                                                                            a.download = file.name;
                                                                            a.style.display = 'none';
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            document.body.removeChild(a);
                                                                        } else {
                                                                            // Local dosya için: blob download
                                                                            const a = document.createElement('a');
                                                                            a.href = downloadUrl;
                                                                            a.download = file.name;
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            document.body.removeChild(a);
                                                                        }
                                                                    }
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-green-100"
                                                                title="İndir"
                                                            >
                                                                <Download className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                        )}

                                                        {/* Silme Butonu */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleFileRemove(file.id)}
                                                            className="h-8 w-8 p-0 hover:bg-red-100"
                                                            title="Sil"
                                                        >
                                                            <X className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            {t('senderProfile.contactInfo.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('senderProfile.contactInfo.phone')}</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder={t('senderProfile.contactInfo.phonePlaceholder')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('senderProfile.contactInfo.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder={t('senderProfile.contactInfo.emailPlaceholder')}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('senderProfile.billingInfo.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="billingInfo">Fatura Bilgileri</Label>
                            <Textarea
                                id="billingInfo"
                                value={formData.billingInfo}
                                onChange={(e) => handleInputChange('billingInfo', e.target.value)}
                                placeholder={t('senderProfile.billingInfo.placeholder')}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Hesap Türü Değiştirme Bölümü */}
                <div className="mt-8">
                    <AccountTypeChangeSection />
                </div>

                {/* Bağlı Hesaplar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Bağlı Hesaplar
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    Farklı email adresleri ile aynı hesaba giriş yapabilirsiniz
                                </p>
                            </div>
                            <Button onClick={() => setShowAddDialog(true)} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Hesap Ekle
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingLinkedAccounts ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                <p className="text-gray-500 mt-2">Yükleniyor...</p>
                            </div>
                        ) : linkedAccounts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Henüz bağlı hesap eklemediniz</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {linkedAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{account.email}</p>
                                                {account.displayName && (
                                                    <p className="text-sm text-gray-500">{account.displayName}</p>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    Eklendi: {new Date(account.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteLinkedAccount(account.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bağlı Hesap Ekleme Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Bağlı Hesap Ekle</DialogTitle>
                            <DialogDescription>
                                Bu email ve şifre ile de aynı hesaba giriş yapabilirsiniz
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="linked-email">Email</Label>
                                <Input
                                    id="linked-email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={newLinkedAccount.email}
                                    onChange={(e) => setNewLinkedAccount({ ...newLinkedAccount, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="linked-password">Şifre</Label>
                                <Input
                                    id="linked-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newLinkedAccount.password}
                                    onChange={(e) => setNewLinkedAccount({ ...newLinkedAccount, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="linked-display-name">Görünen İsim (Opsiyonel)</Label>
                                <Input
                                    id="linked-display-name"
                                    type="text"
                                    placeholder="İş Hesabı, Kişisel vb."
                                    value={newLinkedAccount.displayName}
                                    onChange={(e) => setNewLinkedAccount({ ...newLinkedAccount, displayName: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                İptal
                            </Button>
                            <Button onClick={handleAddLinkedAccount} disabled={addingLinkedAccount}>
                                {addingLinkedAccount ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Ekleniyor...
                                    </>
                                ) : (
                                    'Ekle'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Alt Kaydet Butonu */}
                <div className="flex justify-end mt-8">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('senderProfile.saving')}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {t('senderProfile.save')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}