"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Truck,
    Eye,
    MapPin,
    FileText,
    MessageSquare,
    User,
    Package
} from "lucide-react";
import adminService, { DeliveryManagement } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from 'next/navigation';
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

export default function DeliveryManagementTab() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const router = useRouter();
    const [activeDeliveries, setActiveDeliveries] = useState<DeliveryManagement[]>([]);
    const [completedDeliveries, setCompletedDeliveries] = useState<DeliveryManagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activePage, setActivePage] = useState(0);
    const [completedPage, setCompletedPage] = useState(0);
    const [activeTotalPages, setActiveTotalPages] = useState(0);
    const [completedTotalPages, setCompletedTotalPages] = useState(0);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryManagement | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchActiveDeliveries();
    }, [activePage]);

    useEffect(() => {
        fetchCompletedDeliveries();
    }, [completedPage]);

    const fetchActiveDeliveries = async () => {
        setLoading(true);
        try {
            const response = await adminService.getActiveDeliveries(activePage, 10);
            setActiveDeliveries(response.content);
            setActiveTotalPages(response.totalPages);
        } catch (error) {
            toast({
                title: "Hata",
                description: "Aktif teslimatlar yüklenemedi",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedDeliveries = async () => {
        setLoading(true);
        try {
            const response = await adminService.getCompletedDeliveries(completedPage, 10);
            setCompletedDeliveries(response.content);
            setCompletedTotalPages(response.totalPages);
        } catch (error) {
            toast({
                title: "Hata",
                description: "Tamamlanmış teslimatlar yüklenemedi",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setActivePage(0);
        setCompletedPage(0);
        fetchActiveDeliveries();
        fetchCompletedDeliveries();
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ON_THE_WAY':
                return 'bg-blue-100 text-blue-800';
            case 'PICKED_UP':
                return 'bg-purple-100 text-purple-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ON_THE_WAY':
                return 'Yolda';
            case 'PICKED_UP':
                return 'Alındı';
            case 'DELIVERED':
                return 'Teslim Edildi';
            case 'CANCELLED':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    const handleViewDetails = (delivery: DeliveryManagement) => {
        setSelectedDelivery(delivery);
        setDetailDialogOpen(true);
    };

    const handleViewUserProfile = (userId: string) => {
        setSelectedUserId(userId);
        setUserProfileDialogOpen(true);
    };

    const handleSendMessage = (loadId: string, otherUserId: string) => {
        // Mesajlaşma sayfasına yönlendir - query parametresi otherUserId olmalı
        router.push(`/dashboard/messages/load/${loadId}?otherUserId=${otherUserId}`);
    };

    const renderDeliveryTable = (deliveries: DeliveryManagement[], isActive: boolean) => {
        if (loading) {
            return (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            );
        }

        return (
            <>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Yük Bilgisi</TableHead>
                                <TableHead>Gönderici</TableHead>
                                <TableHead>Taşıyıcı</TableHead>
                                <TableHead>Rota</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Son Konum</TableHead>
                                <TableHead>İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deliveries.map((delivery) => (
                                <TableRow key={delivery.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                <Package className="h-4 w-4 text-gray-500" />
                                                {delivery.loadDetails.goodsType}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {delivery.loadDetails.weight} kg
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{delivery.senderInfo.name}</div>
                                            <div className="text-xs text-gray-500">{delivery.senderInfo.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{delivery.carrierInfo.name}</div>
                                            <div className="text-xs text-gray-500">{delivery.carrierInfo.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-medium">{delivery.loadDetails.loadingCity}</div>
                                            <div className="text-gray-500">→ {delivery.loadDetails.deliveryCity}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusBadgeColor(delivery.currentStatus)}>
                                            {getStatusLabel(delivery.currentStatus)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {delivery.currentLocation ? (
                                            <div className="flex items-center gap-1 text-sm">
                                                <MapPin className="h-3 w-3" />
                                                {delivery.currentLocation}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(delivery)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Detay
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">
                        Sayfa {isActive ? activePage + 1 : completedPage + 1} / {isActive ? activeTotalPages : completedTotalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => isActive ? setActivePage(p => Math.max(0, p - 1)) : setCompletedPage(p => Math.max(0, p - 1))}
                            disabled={isActive ? activePage === 0 : completedPage === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => isActive ? setActivePage(p => Math.min(activeTotalPages - 1, p + 1)) : setCompletedPage(p => Math.min(completedTotalPages - 1, p + 1))}
                            disabled={isActive ? activePage >= activeTotalPages - 1 : completedPage >= completedTotalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Teslimat Yönetimi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="Yük tipi, şehir veya kullanıcı ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} variant="outline">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="active">Aktif Teslimatlar ({activeDeliveries.length})</TabsTrigger>
                            <TabsTrigger value="completed">Tamamlanmış Teslimatlar ({completedDeliveries.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="active">
                            {renderDeliveryTable(activeDeliveries, true)}
                        </TabsContent>

                        <TabsContent value="completed">
                            {renderDeliveryTable(completedDeliveries, false)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Delivery Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Teslimat Detayları
                        </DialogTitle>
                        <DialogDescription>
                            Teslimat hakkında detaylı bilgiler
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDelivery && (
                        <div className="space-y-6">
                            {/* Load Info */}
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-semibold mb-3">Yük Bilgileri</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Yük Tipi</p>
                                        <p className="font-medium">{selectedDelivery.loadDetails.goodsType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Ağırlık</p>
                                        <p className="font-medium">{selectedDelivery.loadDetails.weight} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Yükleme Noktası</p>
                                        <p className="font-medium">{selectedDelivery.loadDetails.loadingCity}</p>
                                        <p className="text-xs text-gray-500">{selectedDelivery.loadDetails.loadingAddress}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Teslimat Noktası</p>
                                        <p className="font-medium">{selectedDelivery.loadDetails.deliveryCity}</p>
                                        <p className="text-xs text-gray-500">{selectedDelivery.loadDetails.deliveryAddress}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sender & Carrier Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Gönderici
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="font-medium">{selectedDelivery.senderInfo.name}</p>
                                        <p className="text-sm text-gray-600">{selectedDelivery.senderInfo.email}</p>
                                        <p className="text-sm text-gray-600">{selectedDelivery.senderInfo.phone}</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewUserProfile(selectedDelivery.senderInfo.id)}
                                            >
                                                <User className="h-3 w-3 mr-1" />
                                                Profil
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSendMessage(selectedDelivery.loadId, selectedDelivery.senderInfo.id)}
                                            >
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                Mesaj
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Truck className="h-4 w-4" />
                                        Taşıyıcı
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="font-medium">{selectedDelivery.carrierInfo.name}</p>
                                        <p className="text-sm text-gray-600">{selectedDelivery.carrierInfo.email}</p>
                                        <p className="text-sm text-gray-600">{selectedDelivery.carrierInfo.phone}</p>
                                        {selectedDelivery.vehicleInfo && (
                                            <p className="text-sm text-gray-600">
                                                Araç: {selectedDelivery.vehicleInfo.plateNumber} - {selectedDelivery.vehicleInfo.type}
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewUserProfile(selectedDelivery.carrierInfo.id)}
                                            >
                                                <User className="h-3 w-3 mr-1" />
                                                Profil
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSendMessage(selectedDelivery.loadId, selectedDelivery.carrierInfo.id)}
                                            >
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                Mesaj
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Location */}
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <h3 className="font-semibold mb-3">Durum ve Konum</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Mevcut Durum</p>
                                        <Badge className={getStatusBadgeColor(selectedDelivery.currentStatus)}>
                                            {getStatusLabel(selectedDelivery.currentStatus)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Son Konum</p>
                                        <p className="font-medium">{selectedDelivery.currentLocation || 'Belirtilmemiş'}</p>
                                    </div>
                                    {selectedDelivery.statusNote && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600">Not</p>
                                            <p className="text-sm">{selectedDelivery.statusNote}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Belgeler
                                </h3>
                                <div className="space-y-4">
                                    {selectedDelivery.pickupDocuments.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Alım Belgeleri ({selectedDelivery.pickupDocuments.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDelivery.pickupDocuments.map((doc, idx) => (
                                                    <Button
                                                        key={idx}
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(doc, '_blank')}
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        Belge {idx + 1}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedDelivery.deliveryDocuments.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Teslimat Belgeleri ({selectedDelivery.deliveryDocuments.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDelivery.deliveryDocuments.map((doc, idx) => (
                                                    <Button
                                                        key={idx}
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(doc, '_blank')}
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        Belge {idx + 1}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedDelivery.pickupDocuments.length === 0 && selectedDelivery.deliveryDocuments.length === 0 && (
                                        <p className="text-sm text-gray-500">Henüz belge yüklenmemiş</p>
                                    )}
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4">
                                {selectedDelivery.pickupTime && (
                                    <div>
                                        <p className="text-sm text-gray-600">Alım Zamanı</p>
                                        <p className="text-sm">{formatDateTime(selectedDelivery.pickupTime)}</p>
                                    </div>
                                )}
                                {selectedDelivery.deliveryTime && (
                                    <div>
                                        <p className="text-sm text-gray-600">Teslimat Zamanı</p>
                                        <p className="text-sm">{formatDateTime(selectedDelivery.deliveryTime)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
