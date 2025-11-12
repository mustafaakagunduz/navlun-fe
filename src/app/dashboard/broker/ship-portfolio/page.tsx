"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from '@/utils/dateUtils';
import {
    Loader2,
    Ship,
    Plus,
    Search,
    Eye,
    Edit,
    MapPin,
    Calendar,
    Leaf,
    Weight,
    AlertCircle,
    CheckCircle,
    Globe,
    Trash2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchBrokerProfile } from '@/store/slices/brokerSlice';
import { fetchBrokerShips, deleteShip } from '@/store/slices/shipsSlice';
import AddShipDialog from "@/app/dashboard/broker/ship-portfolio/AddShipDialog";
import { useToast } from '@/hooks/use-toast';
import type { Ship as ShipType } from '@/services/shipService';

export default function ShipPortfolio() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const dispatch = useAppDispatch();
    const { toast } = useToast();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [shipToDelete, setShipToDelete] = useState<ShipType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Redux state
    const { profile, profileLoading } = useAppSelector(state => state.broker);
    const {
        brokerShips,
        brokerShipsLoading,
        brokerShipsError
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
    const filteredShips = brokerShips.filter(ship => {
        const matchesSearch = ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ship.shipType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ship.currentPort.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    // Calculate stats
    const stats = {
        totalShips: brokerShips.length,
        availableShips: brokerShips.filter(ship => ship.available).length,
        ecoFriendlyShips: brokerShips.filter(ship => ship.ecoFriendly).length,
        totalCapacity: brokerShips.reduce((sum, ship) => sum + ship.deadweightTonnage, 0)
    };

    // Delete handlers
    const handleDeleteClick = (ship: ShipType) => {
        setShipToDelete(ship);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!shipToDelete) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteShip(shipToDelete.id)).unwrap();
            toast({
                title: 'Başarılı',
                description: 'Gemi başarıyla silindi.',
            });
            setIsDeleteModalOpen(false);
            setShipToDelete(null);
        } catch (error: any) {
            toast({
                title: 'Hata',
                description: error || 'Gemi silinirken bir hata oluştu.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setShipToDelete(null);
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

                    <AddShipDialog>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Gemi Ekle
                        </Button>
                    </AddShipDialog>
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

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Gemi adı, tipi veya liman ile arama yapın..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white text-black placeholder:text-black"
                    />
                </div>

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
                                {searchTerm ?
                                    "Arama kriterlerinize uygun gemi bulunamadı" :
                                    "Henüz hiç geminiz yok"
                                }
                            </h3>
                            <p className="text-gray-600 text-center mb-4">
                                {searchTerm ?
                                    "Farklı arama kriterleri deneyin" :
                                    "İlk geminizi eklemek için yukarıdaki butona tıklayın"
                                }
                            </p>
                            {!searchTerm && (
                                <AddShipDialog>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        İlk Geminizi Ekleyin
                                    </Button>
                                </AddShipDialog>
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
                                                    Gemi Adı
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    IMO No
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Gemi Tipi
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    DWT
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Yapım Yılı
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Bandıra
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Mevcut Liman
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Müsaitlik
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Durum
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    İşlemler
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredShips.map((ship) => (
                                                <tr
                                                    key={ship.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Ship className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                            <span className="font-medium text-gray-900">{ship.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-700">{ship.imoNumber}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-700">{ship.shipType}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Weight className="h-4 w-4 text-gray-400" />
                                                            <span>{ship.deadweightTonnage.toLocaleString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{ship.buildYear}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Globe className="h-4 w-4 text-gray-400" />
                                                            <span>{ship.flag}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                            <span className="truncate max-w-xs">{ship.currentPort}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {ship.nextAvailableDate ? (
                                                            <span className="text-gray-700">{formatDate(ship.nextAvailableDate)}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {ship.available ? (
                                                                <Badge variant="secondary" className="bg-green-50 text-green-700 border-0">
                                                                    Müsait
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="bg-red-50 text-red-700 border-0">
                                                                    Meşgul
                                                                </Badge>
                                                            )}
                                                            {ship.ecoFriendly && (
                                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">
                                                                    <Leaf className="h-3 w-3 mr-1" />
                                                                    Çevreci
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.push(`/dashboard/broker/ships/${ship.id}`)}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200"
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Detay
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.push(`/dashboard/broker/ships/${ship.id}/edit`)}
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Düzenle
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(ship)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Sil
                                                            </Button>
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
                            {filteredShips.map((ship) => (
                                <Card key={ship.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                                    <Ship className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-gray-900 text-sm">{ship.name}</span>
                                                        <p className="text-xs text-gray-600">IMO: {ship.imoNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {ship.available ? (
                                                        <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                                                            Müsait
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-red-50 text-red-700 text-xs">
                                                            Meşgul
                                                        </Badge>
                                                    )}
                                                    {ship.ecoFriendly && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                            <Leaf className="h-3 w-3 mr-1" />
                                                            Çevreci
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ship Type and DWT */}
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Ship className="h-3 w-3 text-gray-400" />
                                                    <span>{ship.shipType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Weight className="h-3 w-3 text-gray-400" />
                                                    <span>{ship.deadweightTonnage.toLocaleString()} DWT</span>
                                                </div>
                                            </div>

                                            {/* Build Year and Flag */}
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <span>{ship.buildYear}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3 text-gray-400" />
                                                    <span>{ship.flag}</span>
                                                </div>
                                            </div>

                                            {/* Current Port */}
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3 w-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs text-gray-500 uppercase">Mevcut Liman</div>
                                                    <div className="text-xs text-gray-900 break-words">{ship.currentPort}</div>
                                                </div>
                                            </div>

                                            {/* Next Available Date */}
                                            {ship.nextAvailableDate && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Calendar className="h-3 w-3 text-orange-600" />
                                                    <span>Müsait: {formatDate(ship.nextAvailableDate)}</span>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="pt-2 border-t flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/broker/ships/${ship.id}`)}
                                                    className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Detay
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/broker/ships/${ship.id}/edit`)}
                                                    className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Düzenle
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(ship)}
                                                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Sil
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {/* Delete Confirmation Modal */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Gemiyi Sil</DialogTitle>
                            <DialogDescription>
                                Bu gemiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </DialogDescription>
                        </DialogHeader>
                        {shipToDelete && (
                            <div className="py-4">
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Ship className="h-5 w-5 text-gray-600" />
                                        <span className="font-semibold text-gray-900">{shipToDelete.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span>IMO: {shipToDelete.imoNumber}</span>
                                        <span className="mx-2">•</span>
                                        <span>{shipToDelete.shipType}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                            >
                                İptal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Siliniyor...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Evet, Sil
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}

