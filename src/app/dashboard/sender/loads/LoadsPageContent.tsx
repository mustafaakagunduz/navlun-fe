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



export default function LoadsPageContent() {
    const router = useRouter();
    const { t } = useLanguage();

    const dispatch = useAppDispatch()
    const { myLoads, myLoadsLoading, statusFilter, searchQuery } = useAppSelector(state => state.loads)
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{t('loads.title')}</h1>
                        <p className="text-gray-600 mt-1">{t('loads.description')}</p>
                    </div>

                    <Button
                        onClick={handleNewLoadClick}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('loads.newLoad')}
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={t('loads.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Tabs defaultValue="ALL" onValueChange={handleStatusFilterChange}>
                                <TabsList>
                                    <TabsTrigger value="ALL">{t('loads.filters.all')}</TabsTrigger>
                                    <TabsTrigger value="PENDING">{t('loads.filters.pending')}</TabsTrigger>
                                    <TabsTrigger value="ASSIGNED">{t('loads.filters.assigned')}</TabsTrigger>
                                    <TabsTrigger value="IN_TRANSIT">{t('loads.filters.inTransit')}</TabsTrigger>
                                    <TabsTrigger value="DELIVERED">{t('loads.filters.delivered')}</TabsTrigger>
                                    <TabsTrigger value="COMPLETED">{t('loads.filters.completed')}</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>
                {filteredLoads.length} {t('loads.resultsCount')}
                                {myLoads.length !== filteredLoads.length && (
                                    <span className="ml-1">({myLoads.length} {t('loads.totalCount')})</span>
                                )}
            </span>
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
                    <Card>
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