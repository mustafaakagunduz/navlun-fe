"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    DollarSign,
    TrendingUp,
    Calendar,
    CheckCircle,
    Download,
    Filter,
    Search,
    ArrowUpDown,
    Leaf
} from "lucide-react";
import brokerService, { BrokerProfile, BrokerOfferResponse, OfferStatus } from "@/services/brokerService";

interface CommissionStats {
    totalCommission: number;
    acceptedOffers: number;
    pendingCommission: number;
    thisMonthCommission: number;
}

export default function BrokerCommissionsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
    const [acceptedOffers, setAcceptedOffers] = useState<BrokerOfferResponse[]>([]);
    const [stats, setStats] = useState<CommissionStats>({
        totalCommission: 0,
        acceptedOffers: 0,
        pendingCommission: 0,
        thisMonthCommission: 0
    });
    const [dataLoading, setDataLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Giriş yapmamış veya broker olmayan kullanıcıları yönlendir
    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'BROKER')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Komisyon verilerini yükle
    useEffect(() => {
        const loadCommissionData = async () => {
            if (!user?.id) return;

            try {
                setDataLoading(true);

                // Broker profilini yükle
                const profile = await brokerService.getBrokerProfileByUserId(user.id);
                setBrokerProfile(profile);

                // Kabul edilmiş teklifleri yükle
                const allOffers = await brokerService.getCurrentBrokerOffers();
                const accepted = allOffers.filter(o => o.status === OfferStatus.ACCEPTED);
                const pending = allOffers.filter(o => o.status === OfferStatus.PENDING);

                setAcceptedOffers(accepted);

                // İstatistikleri hesapla
                const totalCommission = accepted.reduce((sum, offer) =>
                    sum + (offer.commissionAmount ? Number(offer.commissionAmount) : 0), 0);

                const pendingCommission = pending.reduce((sum, offer) =>
                    sum + (offer.commissionAmount ? Number(offer.commissionAmount) : 0), 0);

                // Bu ay kabul edilen tekliflerin komisyonları
                const thisMonth = new Date();
                thisMonth.setDate(1);
                thisMonth.setHours(0, 0, 0, 0);

                const thisMonthCommission = accepted
                    .filter(o => o.acceptedAt && new Date(o.acceptedAt) >= thisMonth)
                    .reduce((sum, offer) => sum + (offer.commissionAmount ? Number(offer.commissionAmount) : 0), 0);

                setStats({
                    totalCommission,
                    acceptedOffers: accepted.length,
                    pendingCommission,
                    thisMonthCommission
                });

            } catch (error) {
                console.error('Komisyon verileri yüklenirken hata:', error);
            } finally {
                setDataLoading(false);
            }
        };

        if (user?.id && user?.role === 'BROKER') {
            loadCommissionData();
        }
    }, [user]);

    // Filtreleme ve sıralama
    const filteredOffers = acceptedOffers
        .filter(offer => {
            const searchLower = searchTerm.toLowerCase();
            return (
                offer.loadTitle?.toLowerCase().includes(searchLower) ||
                offer.senderCompanyName?.toLowerCase().includes(searchLower) ||
                offer.senderName?.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.acceptedAt || a.createdAt).getTime();
            const dateB = new Date(b.acceptedAt || b.createdAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Yükleme durumunda gösterilecek içerik
    if (isLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">Komisyon verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['BROKER']}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Komisyon Yönetimi
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Kazançlarınızı ve komisyon detaylarınızı görüntüleyin</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="shadow-lg border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Toplam Komisyon</p>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {formatCurrency(stats.totalCommission)}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                            <span className="text-sm text-green-600 font-medium">
                                                {stats.acceptedOffers} kabul edildi
                                            </span>
                                        </div>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-amber-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Bu Ay Kazanılan</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {formatCurrency(stats.thisMonthCommission)}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                            <span className="text-sm text-gray-600 font-medium">
                                                Bu ay
                                            </span>
                                        </div>
                                    </div>
                                    <Calendar className="h-12 w-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Bekleyen Komisyon</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {formatCurrency(stats.pendingCommission)}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <span className="text-sm text-gray-600 font-medium">
                                                Bekleyen teklifler
                                            </span>
                                        </div>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ort. Komisyon Oranı</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {brokerProfile?.commissionRate || 0}%
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <span className="text-sm text-gray-600 font-medium">
                                                Standart oran
                                            </span>
                                        </div>
                                    </div>
                                    <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Yük veya müşteri ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center gap-2"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            Tarihe Göre {sortOrder === 'desc' ? 'Azalan' : 'Artan'}
                        </Button>
                        <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                            <Download className="h-4 w-4 mr-2" />
                            Rapor İndir
                        </Button>
                    </div>

                    {/* Commissions Table */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                                Komisyon Detayları
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredOffers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Yük</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Müşteri</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Navlun</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Komisyon Oranı</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-700">Komisyon Tutarı</th>
                                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOffers.map((offer) => (
                                                <tr key={offer.id} className="border-b border-gray-100 hover:bg-amber-50 transition-colors">
                                                    <td className="py-4 px-4 text-gray-600">
                                                        {formatDate(offer.acceptedAt || offer.createdAt)}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900">
                                                                {offer.loadTitle || 'Yük'}
                                                            </span>
                                                            {offer.ecoFriendly && (
                                                                <Leaf className="h-4 w-4 text-green-600" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-600">
                                                        {offer.senderCompanyName || offer.senderName || 'Bilinmiyor'}
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-medium text-gray-900">
                                                        {formatCurrency(Number(offer.freightRate))}
                                                    </td>
                                                    <td className="py-4 px-4 text-right text-gray-600">
                                                        {offer.commissionRate}%
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-amber-600">
                                                        {formatCurrency(Number(offer.commissionAmount || 0))}
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <Badge className="bg-green-100 text-green-800" variant="outline">
                                                            Ödendi
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr className="border-t-2 border-gray-300">
                                                <td colSpan={5} className="py-4 px-4 text-right font-bold text-gray-900">
                                                    TOPLAM:
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-amber-600 text-lg">
                                                    {formatCurrency(filteredOffers.reduce((sum, o) =>
                                                        sum + Number(o.commissionAmount || 0), 0))}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">Henüz komisyon kaydı bulunmuyor</p>
                                    <p className="text-sm mt-2">
                                        {searchTerm ?
                                            'Arama kriterlerinize uygun sonuç bulunamadı' :
                                            'Teklifleriniz kabul edildikçe komisyon kazançlarınız burada görünecek'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
