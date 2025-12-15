// src/app/dashboard/broker/available-loads/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { checkOfferedLoads } from '@/store/slices/brokerSlice';

import {
    Search,
    Filter,
    MapPin,
    Package,
    Calendar,
    Weight,
    Truck,
    DollarSign,
    Clock,
    Shield,
    Leaf,
    Eye,
    HandshakeIcon,
    SlidersHorizontal,
    RefreshCcw,
    TrendingUp,
    Building2,
    Route,
    AlertCircle,
    // MessageSquare, // Şimdilik kullanılmıyor
    Loader2, CheckCircle, User
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Load, LoadStatus, TransportType } from "@/services/loadService";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { formatDate } from '@/utils/dateUtils';
import {
    fetchAvailableLoadsForBroker,
    setSearchQuery,
    setGoodsTypeFilter,
    setInsuranceFilter,
    setEcoFriendlyFilter,
    setSortBy,
    setSortDirection,
    setAvailableLoadsPage,
    resetFilters,
    clearAvailableLoadsError
} from '@/store/slices/brokerSlice';

export default function BrokerAvailableLoads() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Redux state
    const {
        availableLoads,
        availableLoadsLoading,
        availableLoadsError,
        availableLoadsPage,
        offeredLoads,
        availableLoadsTotalPages,
        availableLoadsTotalElements,
        filters
    } = useAppSelector(state => state.broker);

    // Local state
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeTransportType, setActiveTransportType] = useState<TransportType>(TransportType.SEA);
    const pageSize = 12;

    // Redirect non-broker users
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        if (availableLoads.length > 0) {
            // Debug: Log all transport types
            console.log('📦 Available loads transport types:', availableLoads.map(load => ({
                title: load.title,
                transportType: load.transportType
            })));

            const loadIds = availableLoads.map(load => load.id);
            dispatch(checkOfferedLoads(loadIds));
        }
    }, [availableLoads, dispatch]);

    // Fetch available loads on mount and page change
    useEffect(() => {
        if (isAuthenticated && user?.role === 'BROKER') {
            dispatch(fetchAvailableLoadsForBroker({ page: availableLoadsPage, size: pageSize }));
        }
    }, [dispatch, availableLoadsPage, isAuthenticated, user]);

    // Clear errors on unmount
    useEffect(() => {
        return () => {
            dispatch(clearAvailableLoadsError());
        };
    }, [dispatch]);

    // Filter and search logic
    const filteredLoads = availableLoads.filter((load) => {
        // Transport type filter
        const matchesTransportType = load.transportType === activeTransportType;

        // Debug: Log transport types
        if (!matchesTransportType) {
            console.log(`🚫 Load filtered out - Transport Type: ${load.transportType}, Expected: ${activeTransportType}`, load.title);
        }

        const matchesSearch = filters.searchQuery === '' ||
            load.goodsType.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            load.loadingAddress.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            load.deliveryAddress.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            load.sender?.companyName?.toLowerCase().includes(filters.searchQuery.toLowerCase());

        const matchesGoodsType = filters.goodsType === '' || filters.goodsType === 'all' ||
            load.goodsType === filters.goodsType;

        const matchesInsurance = filters.insurance === '' || filters.insurance === 'all' ||
            (filters.insurance === 'insured' && load.insuranceRequested) ||
            (filters.insurance === 'not_insured' && !load.insuranceRequested);

        const matchesEcoFriendly = filters.ecoFriendly === '' || filters.ecoFriendly === 'all' ||
            (filters.ecoFriendly === 'eco' && load.ecoTransportRequested) ||
            (filters.ecoFriendly === 'standard' && !load.ecoTransportRequested);

        return matchesTransportType && matchesSearch && matchesGoodsType && matchesInsurance && matchesEcoFriendly;
    });

    // Sort loads
    const sortedLoads = [...filteredLoads].sort((a, b) => {
        const { sortBy, sortDirection } = filters;
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'createdAt':
                aValue = new Date(a.createdAt);
                bValue = new Date(b.createdAt);
                break;
            case 'loadingDate':
                aValue = new Date(a.loadingDate);
                bValue = new Date(b.loadingDate);
                break;
            case 'netWeight':
                aValue = a.netWeight;
                bValue = b.netWeight;
                break;
            case 'estimatedPrice':
                aValue = a.estimatedPrice || 0;
                bValue = b.estimatedPrice || 0;
                break;
            default:
                return 0;
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSearchChange = (value: string) => {
        dispatch(setSearchQuery(value));
    };

    const handleGoodsTypeChange = (value: string) => {
        dispatch(setGoodsTypeFilter(value));
    };

    const handleInsuranceChange = (value: string) => {
        dispatch(setInsuranceFilter(value));
    };

    const handleEcoFriendlyChange = (value: string) => {
        dispatch(setEcoFriendlyFilter(value));
    };

    const handleSortChange = (value: string) => {
        const [sortBy, sortDirection] = value.split('-');
        dispatch(setSortBy(sortBy));
        dispatch(setSortDirection(sortDirection as 'asc' | 'desc'));
    };

    const handlePageChange = (newPage: number) => {
        dispatch(setAvailableLoadsPage(newPage));
    };

    const handleResetFilters = () => {
        dispatch(resetFilters());
    };


    const getStatusBadgeColor = (status: LoadStatus) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusText = (status: LoadStatus) => {
        switch (status) {
            case 'PENDING':
                return 'Beklemede';
            case 'ACTIVE':
                return 'Aktif';
            case 'COMPLETED':
                return 'Tamamlandı';
            case 'CANCELLED':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    const handleOfferClick = (load: Load) => {
        setSelectedLoad(load);
        router.push(`/dashboard/broker/offers/create?loadId=${load.id}`);
    };

    const handleViewDetails = (load: Load) => {
        setSelectedLoad(load);
        setIsDetailModalOpen(true);
    };



    // Mesajlaşma fonksiyonu - şimdilik devre dışı
    // const handleMessageSender = (load: Load) => {
    //     if (load.sender?.id) {
    //         router.push(`/dashboard/messages/load/${load.id}?otherUserId=${load.sender.id}`);
    //     } else {
    //         console.log('Debug - Load object:', load);
    //         toast({
    //             title: 'Hata',
    //             description: 'Gönderici bilgisi bulunamadı.',
    //             variant: 'destructive',
    //         });
    //     }
    // };

    const formatWeight = (weight: number) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)} ton`;
        }
        return `${weight} kg`;
    };

    if (isLoading || availableLoadsLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Yükler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Açık Deniz Yükü Talepleri</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">
                            Teklif verebileceğiniz açık deniz yüklerini görüntüleyin ve değerlendirin
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Package className="h-4 w-4 mr-1" />
                            {sortedLoads.length} deniz yükü
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => dispatch(fetchAvailableLoadsForBroker({ page: 0, size: pageSize }))}
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>


                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Mal türü, şirket adı, konum ile arama yapın..."
                                    value={filters.searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filtreler
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleResetFilters}
                                className="flex items-center gap-2"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Temizle
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mal Türü</label>
                                        <Select value={filters.goodsType} onValueChange={handleGoodsTypeChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tüm türler" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tüm türler</SelectItem>
                                                <SelectItem value="Gıda Ürünleri">Gıda Ürünleri</SelectItem>
                                                <SelectItem value="Elektronik Cihazlar">Elektronik Cihazlar</SelectItem>
                                                <SelectItem value="Tekstil Ürünleri">Tekstil Ürünleri</SelectItem>
                                                <SelectItem value="İnşaat Malzemeleri">İnşaat Malzemeleri</SelectItem>
                                                <SelectItem value="Otomotiv Parçaları">Otomotiv Parçaları</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Sigorta Durumu</label>
                                        <Select value={filters.insurance} onValueChange={handleInsuranceChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tümü" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tümü</SelectItem>
                                                <SelectItem value="insured">Sigortalı</SelectItem>
                                                <SelectItem value="not_insured">Sigortasız</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Çevreci Taşıma</label>
                                        <Select value={filters.ecoFriendly} onValueChange={handleEcoFriendlyChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tümü" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tümü</SelectItem>
                                                <SelectItem value="eco">Çevreci talep edilen</SelectItem>
                                                <SelectItem value="standard">Standart</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Sıralama</label>
                                        <Select
                                            value={`${filters.sortBy}-${filters.sortDirection}`}
                                            onValueChange={handleSortChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="createdAt-desc">En yeni</SelectItem>
                                                <SelectItem value="createdAt-asc">En eski</SelectItem>
                                                <SelectItem value="loadingDate-asc">Yükleme tarihi (yakın)</SelectItem>
                                                <SelectItem value="loadingDate-desc">Yükleme tarihi (uzak)</SelectItem>
                                                <SelectItem value="estimatedPrice-desc">Fiyat (yüksek)</SelectItem>
                                                <SelectItem value="estimatedPrice-asc">Fiyat (düşük)</SelectItem>
                                                <SelectItem value="netWeight-desc">Ağırlık (ağır)</SelectItem>
                                                <SelectItem value="netWeight-asc">Ağırlık (hafif)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Error State */}
                {availableLoadsError && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <span>{availableLoadsError}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">{sortedLoads.length}</span> yük bulundu
                        {availableLoadsTotalElements > 0 && (
                            <span> (toplam {availableLoadsTotalElements})</span>
                        )}
                    </p>
                    {sortedLoads.length > 0 && (
                        <div className="text-sm text-gray-500">
                            Sayfa {availableLoadsPage + 1} / {availableLoadsTotalPages}
                        </div>
                    )}
                </div>

                {/* Loads List */}
                {sortedLoads.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Henüz açık yük bulunamadı
                            </h3>
                            <p className="text-gray-600">
                                Filtreleri değiştirerek farklı yükler arayabilirsiniz.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <Card className="hidden md:block">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Yük
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Şirket
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Mal
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Ağırlık
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Yükleme
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Teslimat
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Tarih
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    Durum
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-tight">
                                                    İşlem
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sortedLoads.map((load) => (
                                                <tr
                                                    key={load.id}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => handleViewDetails(load)}
                                                >
                                                    <td className="px-3 py-3">
                                                        <span className="font-medium text-gray-900 text-sm truncate block max-w-[120px]" title={load.title}>{load.title}</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-1 text-gray-700">
                                                            <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate max-w-[100px] text-sm" title={load.sender?.companyName}>{load.sender?.companyName || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="text-gray-700 text-sm truncate block max-w-[90px]" title={load.goodsType}>{load.goodsType}</span>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1 text-gray-700">
                                                            <Weight className="h-3 w-3 text-gray-400" />
                                                            <span className="text-sm">{formatWeight(load.netWeight)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-1 text-gray-700">
                                                            <MapPin className="h-3 w-3 text-green-600 flex-shrink-0" />
                                                            <span className="truncate max-w-[100px] text-sm" title={load.loadingAddress}>{load.loadingAddress}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-1 text-gray-700">
                                                            <MapPin className="h-3 w-3 text-red-600 flex-shrink-0" />
                                                            <span className="truncate max-w-[100px] text-sm" title={load.deliveryAddress}>{load.deliveryAddress}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1 text-gray-700">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            <span className="text-sm">{formatDate(load.loadingDate)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                        <Badge className={`${getStatusBadgeColor(load.status)} border-0 text-xs px-2 py-0.5`}>
                                                            {getStatusText(load.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDetails(load);
                                                                }}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 h-8 px-2"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                            {offeredLoads.includes(load.id) ? (
                                                                <Badge className="bg-green-100 text-green-800 text-xs px-2 border border-green-200 whitespace-nowrap">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Verildi
                                                                </Badge>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOfferClick(load);
                                                                    }}
                                                                    disabled={load.status !== 'PENDING' && load.status !== 'ACTIVE'}
                                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 h-8 px-2"
                                                                >
                                                                    <HandshakeIcon className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {sortedLoads.map((load) => (
                                <Card
                                    key={load.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleViewDetails(load)}
                                >
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-medium text-gray-900 text-sm">{load.title}</span>
                                                <Badge className={`${getStatusBadgeColor(load.status)} border-0 text-xs flex-shrink-0`}>
                                                    {getStatusText(load.status)}
                                                </Badge>
                                            </div>

                                            {/* Company Info */}
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                <span>{load.sender?.companyName || 'Şirket bilgisi yok'}</span>
                                            </div>

                                            {/* Goods Type and Weight */}
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span>{load.goodsType}</span>
                                                <div className="flex items-center gap-1">
                                                    <Weight className="h-3 w-3 text-gray-400" />
                                                    <span>{formatWeight(load.netWeight)}</span>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                <span>{formatDate(load.loadingDate)}</span>
                                            </div>

                                            {/* Addresses */}
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs text-gray-500 uppercase">Yükleme</div>
                                                        <div className="text-xs text-gray-900 break-words">{load.loadingAddress}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs text-gray-500 uppercase">Teslimat</div>
                                                        <div className="text-xs text-gray-900 break-words">{load.deliveryAddress}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            {load.estimatedPrice && (
                                                <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>₺{load.estimatedPrice.toLocaleString()}</span>
                                                </div>
                                            )}

                                            {/* Badges */}
                                            {(load.insuranceRequested || load.ecoTransportRequested) && (
                                                <div className="flex flex-wrap gap-2">
                                                    {load.insuranceRequested && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Sigortalı
                                                        </Badge>
                                                    )}
                                                    {load.ecoTransportRequested && (
                                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                            <Leaf className="h-3 w-3 mr-1" />
                                                            Çevreci
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="pt-2 border-t flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(load);
                                                    }}
                                                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Detaylar
                                                </Button>
                                                {offeredLoads.includes(load.id) ? (
                                                    <Badge className="bg-green-100 text-green-800 flex-1 justify-center items-center border border-green-200">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Teklif Verildi
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOfferClick(load);
                                                        }}
                                                        disabled={load.status !== 'PENDING' && load.status !== 'ACTIVE'}
                                                        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                                                    >
                                                        <HandshakeIcon className="h-4 w-4 mr-2" />
                                                        Teklif Ver
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {availableLoadsTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(availableLoadsPage - 1)}
                            disabled={availableLoadsPage === 0}
                        >
                            Önceki
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, availableLoadsTotalPages) }, (_, i) => {
                                let pageNumber;
                                if (availableLoadsTotalPages <= 5) {
                                    pageNumber = i;
                                } else if (availableLoadsPage < 3) {
                                    pageNumber = i;
                                } else if (availableLoadsPage > availableLoadsTotalPages - 3) {
                                    pageNumber = availableLoadsTotalPages - 5 + i;
                                } else {
                                    pageNumber = availableLoadsPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNumber}
                                        variant={pageNumber === availableLoadsPage ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNumber)}
                                        className="w-10"
                                    >
                                        {pageNumber + 1}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(availableLoadsPage + 1)}
                            disabled={availableLoadsPage >= availableLoadsTotalPages - 1}
                        >
                            Sonraki
                        </Button>
                    </div>
                )}

                {/* Load Detail Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
                        {selectedLoad && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">
                                        {selectedLoad.title}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Status and Company */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                            <span className="text-lg font-medium">{selectedLoad.sender?.companyName || 'Şirket bilgisi yok'}</span>
                                        </div>
                                        <Badge className={`${getStatusBadgeColor(selectedLoad.status)} border`}>
                                            {getStatusText(selectedLoad.status)}
                                        </Badge>
                                    </div>

                                    {/* Route Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Route className="h-5 w-5" />
                                                Rota Bilgileri
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-green-600">Yükleme Adresi</p>
                                                    <p className="text-gray-700">{selectedLoad.loadingAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-red-600">Teslimat Adresi</p>
                                                    <p className="text-gray-700">{selectedLoad.deliveryAddress}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Load Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Yük Detayları
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Mal Türü</p>
                                                <p className="font-medium">{selectedLoad.goodsType}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Net Ağırlık</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Weight className="h-4 w-4" />
                                                    {selectedLoad.netWeight} kg
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Brüt Ağırlık</p>
                                                <p className="font-medium">{selectedLoad.grossWeight} kg</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Dates and Price */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Tarih ve Fiyat Bilgileri
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Yükleme Tarihi</p>
                                                <p className="font-medium">{formatDate(selectedLoad.loadingDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Teslimat Tarihi</p>
                                                <p className="font-medium">{formatDate(selectedLoad.deliveryDate)}</p>
                                            </div>
                                            {selectedLoad.estimatedPrice && (
                                                <div className="col-span-2">
                                                    <p className="text-sm text-gray-600">Tahmini Fiyat</p>
                                                    <p className="text-2xl font-bold text-amber-600 flex items-center gap-1">
                                                        <DollarSign className="h-6 w-6" />
                                                        ₺{selectedLoad.estimatedPrice.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Additional Services */}
                                    {(selectedLoad.insuranceRequested || selectedLoad.ecoTransportRequested) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Ek Hizmetler</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedLoad.insuranceRequested && (
                                                        <Badge variant="secondary" className="text-sm">
                                                            <Shield className="h-4 w-4 mr-1" />
                                                            Sigorta Talep Edildi
                                                        </Badge>
                                                    )}
                                                    {selectedLoad.ecoTransportRequested && (
                                                        <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
                                                            <Leaf className="h-4 w-4 mr-1" />
                                                            Çevreci Taşıma Talep Edildi
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Description */}
                                    {selectedLoad.description && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Açıklama</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700">{selectedLoad.description}</p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        {/* Profile Git butonu */}
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                if (selectedLoad.sender?.id) {
                                                    router.push(`/dashboard/sender-profile/${selectedLoad.sender.id}`);
                                                } else {
                                                    toast({
                                                        title: 'Hata',
                                                        description: 'Gönderici bilgisi bulunamadı.',
                                                        variant: 'destructive',
                                                    });
                                                }
                                            }}
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Profile Git
                                        </Button>
                                        {/* Mesajlaşma butonu - şimdilik devre dışı */}
                                        {/* <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setIsDetailModalOpen(false);
                                                handleMessageSender(selectedLoad);
                                            }}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Mesajlaş
                                        </Button> */}
                                        {!offeredLoads.includes(selectedLoad.id) && (
                                            <Button
                                                className="flex-1"
                                                onClick={() => {
                                                    setIsDetailModalOpen(false);
                                                    handleOfferClick(selectedLoad);
                                                }}
                                                disabled={selectedLoad.status !== 'PENDING' && selectedLoad.status !== 'ACTIVE'}
                                            >
                                                <HandshakeIcon className="h-4 w-4 mr-2" />
                                                Teklif Ver
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}