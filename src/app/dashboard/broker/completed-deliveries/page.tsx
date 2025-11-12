// src/app/dashboard/broker/completed-deliveries/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { CheckCircle, Package, Clock, MapPin, DollarSign, Calendar, Search, Weight, TruckIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import deliveryService from '@/services/deliveryService'
import { DeliveryTrackingData } from '@/services/deliveryService'
import { useToast } from '@/hooks/use-toast'

export default function BrokerCompletedDeliveriesPage() {
    const [deliveries, setDeliveries] = useState<DeliveryTrackingData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        loadCompletedDeliveries()
    }, [])

    const loadCompletedDeliveries = async () => {
        try {
            setIsLoading(true)
            const data = await deliveryService.getCurrentBrokerCompletedDeliveries()
            setDeliveries(data)
        } catch (error: any) {
            console.error('Error loading completed deliveries:', error)
            toast({
                title: 'Hata',
                description: error.response?.data?.message || 'Tamamlanmış teslimatlar yüklenirken hata oluştu',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'DELIVERED': { label: 'Teslim Edildi', variant: 'default' },
            'PAYMENT_RECEIVED': { label: 'Ödeme Alındı', variant: 'default' },
            'COMPLETED': { label: 'Tamamlandı', variant: 'default' },
        }

        const statusInfo = statusMap[status] || { label: status, variant: 'secondary' }
        return <Badge variant={statusInfo.variant} className="bg-green-100 text-green-800 border-green-200">{statusInfo.label}</Badge>
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-'
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Tamamlanmış teslimatlar yükleniyor...</p>
                    </div>
                </div>
            </div>
        )
    }

    const filteredDeliveries = deliveries.filter(delivery =>
        delivery.loadTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.loadDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.currentLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.carrier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tamamlanan Teslimatlar</h1>
                    <p className="text-gray-600 mt-1">Kabul edilen ve tamamlanan tekliflerinizi görüntüleyin</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {filteredDeliveries.length} teslimat
                    </Badge>
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Yük başlığı, açıklama, konum veya taşıyıcı ile arayın..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* İstatistikler */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Toplam Teslimat</p>
                                <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Bu Ay</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {deliveries.filter(d => {
                                        // statusHistory'den DELIVERED veya COMPLETED durumunu bul
                                        const completedStatus = d.statusHistory?.find(
                                            h => h.status === 'DELIVERED' || h.status === 'COMPLETED'
                                        );
                                        if (!completedStatus?.timestamp) return false;
                                        const deliveryDate = new Date(completedStatus.timestamp);
                                        const now = new Date();
                                        return deliveryDate.getMonth() === now.getMonth() &&
                                               deliveryDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ödeme Bekleyen</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {deliveries.filter(d => d.currentStatus === 'PAYMENT_PENDING').length}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Toplam Komisyon</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {formatCurrency(
                                        deliveries.reduce((sum, d) => sum + (d.brokerInfo?.commissionAmount || 0), 0)
                                    )}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {filteredDeliveries.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'Arama sonucu bulunamadı' : 'Tamamlanmış Teslimat Yok'}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm
                                    ? 'Farklı arama terimleri ile tekrar deneyin.'
                                    : 'Henüz tamamlanmış teslimat bulunmuyor.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {filteredDeliveries.map((delivery) => (
                        <Card key={delivery.loadId} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{delivery.loadTitle || 'Yük Başlığı'}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            {delivery.loadDescription || 'Açıklama yok'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(delivery.currentStatus)}
                                        {delivery.currentStatus === 'PAYMENT_RECEIVED' && (
                                            <Badge className="bg-green-600">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                Ücret Alındı
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Taşıyıcı ve Araç Bilgileri */}
                                {delivery.carrier && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Taşıyıcı Bilgileri</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Firma:</span>
                                                <p className="font-medium">{delivery.carrier.name || '-'}</p>
                                            </div>
                                            {delivery.vehicle && (
                                                <div>
                                                    <span className="text-gray-600">Araç:</span>
                                                    <p className="font-medium">{delivery.vehicle.plateNumber || '-'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Teslimat Detayları */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Alım
                                        </span>
                                        <p className="font-medium">
                                            {formatDate(delivery.statusHistory?.find(h => h.status === 'PICKED_UP')?.timestamp || delivery.lastUpdate)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Teslim
                                        </span>
                                        <p className="font-medium">
                                            {formatDate(delivery.statusHistory?.find(h => h.status === 'DELIVERED' || h.status === 'COMPLETED')?.timestamp || delivery.lastUpdate)}
                                        </p>
                                    </div>
                                    {delivery.brokerInfo?.commissionAmount && (
                                        <div>
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                Komisyon
                                            </span>
                                            <p className="font-medium text-green-600">
                                                {formatCurrency(delivery.brokerInfo.commissionAmount)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-600 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Son Güncelleme
                                        </span>
                                        <p className="font-medium">{formatDate(delivery.lastUpdate)}</p>
                                    </div>
                                </div>

                                {/* Konum Bilgisi */}
                                {delivery.currentLocation && (
                                    <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                                        <MapPin className="h-4 w-4 text-gray-600" />
                                        <div>
                                            <span className="text-gray-600">Teslimat Konumu:</span>
                                            <p className="font-medium text-gray-900">{delivery.currentLocation}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Not */}
                                {delivery.statusNote && (
                                    <div className="text-sm bg-blue-50 p-3 rounded-lg">
                                        <span className="font-medium text-gray-700">Not:</span>
                                        <p className="text-gray-600 mt-1">{delivery.statusNote}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detaylı İstatistikler */}
            {filteredDeliveries.length > 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel İstatistikler</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg">
                                <p className="text-3xl font-bold text-green-600">{filteredDeliveries.length}</p>
                                <p className="text-sm text-gray-600 mt-1">Toplam Teslimat</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <p className="text-3xl font-bold text-blue-600">
                                    {filteredDeliveries.filter(d => d.brokerInfo?.ecoFriendly).length}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Çevre Dostu</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <p className="text-3xl font-bold text-yellow-600">
                                    {filteredDeliveries.filter(d => d.currentStatus === 'PAYMENT_PENDING').length}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Ödeme Bekleyen</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <p className="text-3xl font-bold text-purple-600">
                                    {formatCurrency(
                                        filteredDeliveries.reduce((sum, d) => sum + (d.brokerInfo?.commissionAmount || 0), 0)
                                    )}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Toplam Komisyon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-center">
                <Button onClick={loadCompletedDeliveries} variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Yenile
                </Button>
            </div>
        </div>
    )
}
