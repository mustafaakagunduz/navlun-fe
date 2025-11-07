// src/app/dashboard/sender/loads/LoadsPageContent.tsx
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, Filter, Package, Calendar, MapPin, Weight, AlertCircle, Eye } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import loadService, { Load, LoadStatus } from '@/services/loadService';
import LoadDetailsDialog from './LoadDetailsDialog';
import { Badge } from "@/components/ui/badge";
import senderService from "@/services/senderService";
import authService from "@/services/authService";
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchMyLoads, setStatusFilter, setSearchQuery } from '@/store/slices/loadsSlice'
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';



export default function LoadsPageContent() {
    const router = useRouter();
    const { t } = useLanguage();

    const dispatch = useAppDispatch()
    const { myLoads, myLoadsLoading, statusFilter, searchQuery } = useAppSelector(state => state.loads)

    // URL query parametresinden tab değerini oku
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam) {
            dispatch(setStatusFilter(tabParam as LoadStatus | 'ALL'));
        }
    }, [dispatch]);
    const filteredLoads = useAppSelector(state => {
        const { myLoads, statusFilter, searchQuery } = state.loads;
        let result = myLoads;

        // Arama filtresi
        if (searchQuery) {
            result = result.filter(load =>
                load.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.goodsType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Durum filtresi
        if (statusFilter !== 'ALL') {
            result = result.filter(load => load.status === statusFilter);
        }

        return result;
    });

    const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    useEffect(() => {
        dispatch(fetchMyLoads())
    }, [dispatch])



    const handleNewLoadClick = () => {
        router.push('/dashboard/sender/loads/new-load');
    };

    const refreshLoads = () => {
        dispatch(fetchMyLoads())
    }

// handleLoadClick fonksiyonunu güncelle:
    const handleLoadClick = (load: Load) => {
        setSelectedLoad(load);
        setShowDetailsDialog(true);
    };

// LoadDetailsDialog'u kapatırken yükleri yenile
    const handleCloseDialog = () => {
        setShowDetailsDialog(false);
        setSelectedLoad(null);
        // Dialog kapanırken yükleri yenile
        refreshLoads();
    };

    const handleStatusFilterChange = (value: string) => {
        dispatch(setStatusFilter(value as LoadStatus | 'ALL'))
    }

    const handleSearchChange = (value: string) => {
        dispatch(setSearchQuery(value))
    }



    const getStatusColor = (status: LoadStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: LoadStatus) => {
        return t(`loads.status.${status.toLowerCase()}`);
    };

    const formatWeight = (weight: number) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)} ${t('loads.units.ton')}`;
        }
        return `${weight} ${t('loads.units.kg')}`;
    };

    if (myLoadsLoading) {
        return (
            <ProtectedRoute allowedRoles={['SENDER']}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex items-center gap-3">
                        <Package className="h-6 w-6 animate-pulse text-green-600" />
                        <span className="text-gray-600">{t('loads.loading')}</span>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{t('loads.title')}</h1>
                        <p className="text-sm md:text-base text-gray-600 mt-1">{t('loads.description')}</p>
                    </div>

                    <Button
                        onClick={handleNewLoadClick}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('loads.newLoad')}
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={t('loads.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filter Tabs */}
                            <Tabs value={statusFilter} onValueChange={handleStatusFilterChange} className="w-full">
                                <TabsList className="w-full h-auto flex-wrap justify-start gap-1 p-1">
                                    <TabsTrigger value="ALL" className="text-xs md:text-sm px-2 md:px-3 py-1.5">
                                        {t('loads.filters.all')}
                                    </TabsTrigger>
                                    <TabsTrigger value="PENDING" className="text-xs md:text-sm px-2 md:px-3 py-1.5">
                                        {t('loads.filters.pending')}
                                    </TabsTrigger>
                                    <TabsTrigger value="ASSIGNED" className="text-xs md:text-sm px-2 md:px-3 py-1.5">
                                        {t('loads.filters.assigned')}
                                    </TabsTrigger>
                                    <TabsTrigger value="IN_TRANSIT" className="text-xs md:text-sm px-2 md:px-3 py-1.5">
                                        {t('loads.filters.inTransit')}
                                    </TabsTrigger>
                                    <TabsTrigger value="DELIVERED" className="text-xs md:text-sm px-2 md:px-3 py-1.5">
                                        {t('loads.filters.delivered')}
                                    </TabsTrigger>
                                    <TabsTrigger value="COMPLETED" className="text-xs md:text-sm px-2 md:px-3 py-1.5">
                                        {t('loads.filters.completed')}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {/* Results Summary */}
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                                <Package className="h-3 w-3 md:h-4 md:w-4" />
                                <span>
                                    {filteredLoads.length} {t('loads.resultsCount')}
                                    {myLoads.length !== filteredLoads.length && (
                                        <span className="ml-1">({myLoads.length} {t('loads.totalCount')})</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Loads List */}
                {filteredLoads.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? t('loads.noResults')
                                    : t('loads.noLoads')
                                }
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? t('loads.tryDifferentFilter')
                                    : t('loads.createFirstLoad')
                                }
                            </p>
                            {(!searchQuery && statusFilter === 'ALL') && (
                                <Button onClick={handleNewLoadClick} className="bg-green-600 hover:bg-green-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('loads.newLoad')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <Card className="hidden md:block">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.name')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.weight')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.pickup')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.delivery')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.date')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.status')}
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    {t('loads.table.actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredLoads.map((load) => (
                                                <tr
                                                    key={load.id}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => handleLoadClick(load)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                            <span className="font-medium text-gray-900">{load.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Weight className="h-4 w-4 text-gray-400" />
                                                            <span>{formatWeight(load.netWeight)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                            <span className="truncate max-w-xs">{load.loadingAddress}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                            <span className="truncate max-w-xs">{load.deliveryAddress}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{formatDate(load.loadingDate)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={`${getStatusColor(load.status)} border-0`}>
                                                            {getStatusText(load.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLoadClick(load);
                                                            }}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
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
                            {filteredLoads.map((load) => (
                                <Card
                                    key={load.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleLoadClick(load)}
                                >
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                                    <Package className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium text-gray-900 text-sm">{load.title}</span>
                                                </div>
                                                <Badge className={`${getStatusColor(load.status)} border-0 text-xs flex-shrink-0`}>
                                                    {getStatusText(load.status)}
                                                </Badge>
                                            </div>

                                            {/* Weight and Date */}
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Weight className="h-3 w-3 text-gray-400" />
                                                    <span>{formatWeight(load.netWeight)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <span>{formatDate(load.loadingDate)}</span>
                                                </div>
                                            </div>

                                            {/* Addresses */}
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs text-gray-500 uppercase">{t('loads.pickup')}</div>
                                                        <div className="text-xs text-gray-900 break-words">{load.loadingAddress}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs text-gray-500 uppercase">{t('loads.delivery')}</div>
                                                        <div className="text-xs text-gray-900 break-words">{load.deliveryAddress}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-2 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLoadClick(load);
                                                    }}
                                                    className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t('loads.clickForDetails')}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Load Details Dialog */}
                <LoadDetailsDialog
                    load={selectedLoad}
                    isOpen={showDetailsDialog}
                    onClose={handleCloseDialog}
                />
            </div>
        </ProtectedRoute>
    );
}