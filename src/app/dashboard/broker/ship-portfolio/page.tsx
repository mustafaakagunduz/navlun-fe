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
import {
    Loader2,
    Ship,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    MapPin,
    Calendar,
    Leaf,
    Weight,
    AlertCircle,
    CheckCircle,
    Globe
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchBrokerProfile } from '@/store/slices/brokerSlice';
import {
    fetchBrokerShips,
    setShipTypeFilter,
    setEcoFriendlyFilter,
    setAvailableFilter
} from '@/store/slices/shipsSlice';

export default function ShipPortfolio() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');

    // Redux state
    const { profile, profileLoading } = useAppSelector(state => state.broker);
    const {
        brokerShips,
        brokerShipsLoading,
        brokerShipsError,
        filters
    } = useAppSelector(state => state.ships);

    // Redirect if not broker
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Load broker profile and ships
    useEffect(() => {
        if (isAuthenticated && user?.role === 'BROKER') {
            dispatch(fetchBrokerProfile());
        }
    }, [dispatch, isAuthenticated, user]);

    useEffect(() => {
        if (profile?.id) {
            dispatch(fetchBrokerShips());
        }
    }, [dispatch, profile]);

    // Filter ships
    // Filter ships kısmını şu şekilde değiştir:
    const filteredShips = brokerShips.filter(ship => {
        const matchesSearch = ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ship.shipType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ship.currentPort.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesShipType = filters.shipType === 'all' || ship.shipType === filters.shipType;
        const matchesEcoFriendly = filters.ecoFriendly === 'all' ||
            (filters.ecoFriendly === 'true' ? ship.ecoFriendly : !ship.ecoFriendly);
        const matchesAvailable = filters.available === 'all' ||
            (filters.available === 'true' ? ship.available : !ship.available);

        return matchesSearch && matchesShipType && matchesEcoFriendly && matchesAvailable;
    });

    // Get unique ship types
    const shipTypes = [...new Set(brokerShips.map(ship => ship.shipType))];

    // Calculate stats
    const stats = {
        totalShips: brokerShips.length,
        availableShips: brokerShips.filter(ship => ship.available).length,
        ecoFriendlyShips: brokerShips.filter(ship => ship.ecoFriendly).length,
        totalCapacity: brokerShips.reduce((sum, ship) => sum + ship.deadweightTonnage, 0)
    };

    const clearAllFilters = () => {
        dispatch(setShipTypeFilter('all'));
        dispatch(setEcoFriendlyFilter('all'));
        dispatch(setAvailableFilter('all'));
        setSearchTerm('');
    };

    if (isLoading || profileLoading) {
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

    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Gemi Portföyü
                        </h1>
                        <p className="text-gray-600">
                            Gemi filonuzu yönetin ve takip edin
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard/broker/ships/create')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Gemi Ekle
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Toplam Gemi</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalShips}</p>
                                </div>
                                <Ship className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Müsait</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.availableShips}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Çevreci</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.ecoFriendlyShips}</p>
                                </div>
                                <Leaf className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Toplam DWT</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalCapacity.toLocaleString()}
                                    </p>
                                </div>
                                <Weight className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Arama ve Filtreler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Gemi ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Ship Type Filter */}
                            <Select
                                value={filters.shipType}
                                onValueChange={(value) => dispatch(setShipTypeFilter(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Gemi Tipi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    {shipTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Eco Filter */}
                            <Select
                                value={filters.ecoFriendly}
                                onValueChange={(value) => dispatch(setEcoFriendlyFilter(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Çevreci" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    <SelectItem value="true">Çevreci</SelectItem>
                                    <SelectItem value="false">Standart</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Available Filter */}
                            <Select
                                value={filters.available}
                                onValueChange={(value) => dispatch(setAvailableFilter(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Durum" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    <SelectItem value="true">Müsait</SelectItem>
                                    <SelectItem value="false">Meşgul</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-600">
                                {filteredShips.length} gemi gösteriliyor (toplam {brokerShips.length})
                            </p>
                            <Button
                                variant="outline"
                                onClick={clearAllFilters}
                                className="text-sm"
                            >
                                Filtreleri Temizle
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {brokerShipsError && (
                    <Card className="border-red-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <span>{brokerShipsError}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Ships List */}
                <div className="space-y-4">
                    {brokerShipsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Gemiler yükleniyor...</span>
                            </div>
                        </div>
                    ) : filteredShips.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Ship className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm || Object.values(filters).some(f => f) ?
                                        "Arama kriterlerinize uygun gemi bulunamadı" :
                                        "Henüz hiç geminiz yok"
                                    }
                                </h3>
                                <p className="text-gray-600 text-center mb-4">
                                    {searchTerm || Object.values(filters).some(f => f) ?
                                        "Farklı arama kriterleri deneyin veya filtreleri temizleyin" :
                                        "İlk geminizi eklemek için aşağıdaki butona tıklayın"
                                    }
                                </p>
                                {!searchTerm && !Object.values(filters).some(f => f) && (
                                    <Button
                                        onClick={() => router.push('/dashboard/broker/ships/create')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        İlk Geminizi Ekleyin
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredShips.map((ship) => (
                                <Card key={ship.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                                    {ship.name}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    IMO: {ship.imoNumber}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {ship.available ? (
                                                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                                                        Müsait
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-red-50 text-red-700">
                                                        Meşgul
                                                    </Badge>
                                                )}
                                                {ship.ecoFriendly && (
                                                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                                                        <Leaf className="h-3 w-3 mr-1" />
                                                        Çevreci
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Ship Info */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Ship className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">{ship.shipType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Weight className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {ship.deadweightTonnage.toLocaleString()} DWT
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">{ship.buildYear}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600">{ship.flag}</span>
                                            </div>
                                        </div>

                                        {/* Current Port */}
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <span className="text-gray-900 font-medium">
                                                {ship.currentPort}
                                            </span>
                                        </div>

                                        {/* Next Available Date */}
                                        {ship.nextAvailableDate && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-orange-600" />
                                                <span className="text-gray-600">
                                                    Müsait: {new Date(ship.nextAvailableDate).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => router.push(`/dashboard/broker/ships/${ship.id}`)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Detay
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => router.push(`/dashboard/broker/ships/${ship.id}/edit`)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Düzenle
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}