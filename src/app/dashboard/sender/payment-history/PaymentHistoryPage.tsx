'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Loader2,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Calendar,
    Package,
    Download,
    RefreshCw,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    FileText,
    Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import paymentService, { Payment, PaymentStatus, PaymentStatistics } from '@/services/paymentService';

export default function PaymentHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const { toast } = useToast();

    const loadData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const [paymentsData, statsData] = await Promise.all([
                paymentService.getCurrentUserPaymentHistory(),
                paymentService.getCurrentUserPaymentStatistics()
            ]);

            console.log('📊 Payment History - Payments Data:', paymentsData);
            console.log('📊 Payment History - Payments Count:', paymentsData?.length);
            console.log('📊 Payment History - Statistics:', statsData);

            setPayments(paymentsData);
            setStatistics(statsData);
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.message || "Ödeme verileri yüklenirken hata oluştu",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredPayments = payments.filter(payment => {
        // Status filter
        if (filterStatus !== 'ALL' && payment.status !== filterStatus) {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                payment.loadTitle?.toLowerCase().includes(query) ||
                payment.transactionId?.toLowerCase().includes(query) ||
                payment.invoiceNumber?.toLowerCase().includes(query) ||
                payment.senderCompanyName?.toLowerCase().includes(query) ||
                payment.carrierCompanyName?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const getStatusIcon = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case PaymentStatus.FAILED:
                return <XCircle className="h-5 w-5 text-red-600" />;
            case PaymentStatus.PENDING:
            case PaymentStatus.PROCESSING:
                return <Clock className="h-5 w-5 text-yellow-600" />;
            default:
                return <CreditCard className="h-5 w-5 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Ödeme geçmişi yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ödeme Geçmişi</h1>
                    <p className="text-gray-600 mt-1">
                        Tüm ödeme işlemlerinizi ve faturalarınızı görüntüleyin.
                    </p>
                </div>
                <Button
                    onClick={() => loadData(true)}
                    variant="outline"
                    disabled={refreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Yenile
                </Button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Amount */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Toplam Ödeme
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {paymentService.formatCurrency(statistics.totalAmount)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {statistics.totalPayments} işlem
                            </p>
                        </CardContent>
                    </Card>

                    {/* This Month */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Bu Ay
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {paymentService.formatCurrency(statistics.thisMonthTotal)}
                            </div>
                            {statistics.thisMonthTotal > statistics.lastMonthTotal ? (
                                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Geçen aydan daha fazla
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <TrendingDown className="h-3 w-3" />
                                    Geçen aydan daha az
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Completed */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Tamamlanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {statistics.completedPayments}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                %{((statistics.completedPayments / statistics.totalPayments) * 100).toFixed(1)} başarı oranı
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pending */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Bekleyen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {statistics.pendingPayments}
                            </div>
                            {statistics.failedPayments > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                    {statistics.failedPayments} başarısız
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Yük, işlem no, fatura no ile ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('ALL')}
                            >
                                Tümü ({payments.length})
                            </Button>
                            <Button
                                variant={filterStatus === PaymentStatus.COMPLETED ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus(PaymentStatus.COMPLETED)}
                            >
                                Tamamlanan ({payments.filter(p => p.status === PaymentStatus.COMPLETED).length})
                            </Button>
                            <Button
                                variant={filterStatus === PaymentStatus.PENDING ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus(PaymentStatus.PENDING)}
                            >
                                Bekleyen ({payments.filter(p => p.status === PaymentStatus.PENDING).length})
                            </Button>
                            <Button
                                variant={filterStatus === PaymentStatus.FAILED ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus(PaymentStatus.FAILED)}
                            >
                                Başarısız ({payments.filter(p => p.status === PaymentStatus.FAILED).length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments List */}
            <div className="space-y-4">
                {filteredPayments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {filterStatus === 'ALL' ? 'Henüz ödeme bulunmuyor' : 'Bu durumda ödeme bulunmuyor'}
                            </h3>
                            <p className="text-gray-600 text-center">
                                {searchQuery ? 'Arama kriterlerinize uygun ödeme bulunamadı.' : 'Ödeme işlemleri burada görünecektir.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPayments.map((payment) => (
                        <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {getStatusIcon(payment.status)}
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    {payment.loadTitle}
                                                    <Badge className={paymentService.getStatusColor(payment.status)}>
                                                        {paymentService.getStatusDisplayName(payment.status)}
                                                    </Badge>
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {paymentService.formatDate(payment.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            {/* Amount */}
                                            <div>
                                                <p className="text-xs text-gray-500">Tutar</p>
                                                <p className="font-semibold text-lg">
                                                    {paymentService.formatCurrency(payment.totalAmount)}
                                                </p>
                                            </div>

                                            {/* Payment Method */}
                                            {payment.paymentMethod && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Ödeme Yöntemi</p>
                                                    <p className="font-medium">
                                                        {paymentService.getPaymentMethodDisplayName(payment.paymentMethod)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Transaction ID */}
                                            {payment.transactionId && (
                                                <div>
                                                    <p className="text-xs text-gray-500">İşlem No</p>
                                                    <p className="font-mono text-sm">{payment.transactionId}</p>
                                                </div>
                                            )}

                                            {/* Invoice Number */}
                                            {payment.invoiceNumber && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Fatura No</p>
                                                    <p className="font-mono text-sm">{payment.invoiceNumber}</p>
                                                </div>
                                            )}

                                            {/* Carrier */}
                                            {payment.carrierCompanyName && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Taşıyıcı</p>
                                                    <p className="font-medium">{payment.carrierCompanyName}</p>
                                                </div>
                                            )}

                                            {/* Payment Date */}
                                            {payment.paymentDate && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Ödeme Tarihi</p>
                                                    <p className="font-medium">
                                                        {paymentService.formatDate(payment.paymentDate)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Breakdown */}
                                        {(payment.amount || payment.serviceFee || payment.taxAmount) && (
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                                {payment.amount && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Ana Tutar:</span>
                                                        <span className="font-medium">
                                                            {paymentService.formatCurrency(payment.amount)}
                                                        </span>
                                                    </div>
                                                )}
                                                {payment.serviceFee && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Hizmet Bedeli:</span>
                                                        <span className="font-medium">
                                                            {paymentService.formatCurrency(payment.serviceFee)}
                                                        </span>
                                                    </div>
                                                )}
                                                {payment.taxAmount && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">KDV:</span>
                                                        <span className="font-medium">
                                                            {paymentService.formatCurrency(payment.taxAmount)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                                                    <span>Toplam:</span>
                                                    <span>{paymentService.formatCurrency(payment.totalAmount)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Refund Info */}
                                        {payment.status === PaymentStatus.REFUNDED && payment.refundAmount && (
                                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-purple-800 mb-1">
                                                    <TrendingDown className="h-4 w-4" />
                                                    <span className="font-semibold text-sm">İade Edildi</span>
                                                </div>
                                                <p className="text-sm">
                                                    <span className="font-semibold">
                                                        {paymentService.formatCurrency(payment.refundAmount)}
                                                    </span>
                                                    {payment.refundDate && (
                                                        <span className="text-gray-600">
                                                            {' • '}
                                                            {paymentService.formatDate(payment.refundDate)}
                                                        </span>
                                                    )}
                                                </p>
                                                {payment.refundReason && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Sebep: {payment.refundReason}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        {payment.invoiceUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => paymentService.downloadInvoice(payment.invoiceUrl!)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Fatura
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedPayment(payment)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Detay
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Ödeme Detayları</h2>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => setSelectedPayment(null)}
                                    className="text-2xl hover:bg-gray-100"
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {/* Status */}
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(selectedPayment.status)}
                                    <Badge className={`${paymentService.getStatusColor(selectedPayment.status)} text-base px-4 py-1`}>
                                        {paymentService.getStatusDisplayName(selectedPayment.status)}
                                    </Badge>
                                </div>

                                {/* Load Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Yük Bilgileri
                                    </h3>
                                    <p className="font-medium text-lg">{selectedPayment.loadTitle}</p>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Ödeme Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Toplam Tutar</p>
                                            <p className="font-bold text-lg">
                                                {paymentService.formatCurrency(selectedPayment.totalAmount)}
                                            </p>
                                        </div>
                                        {selectedPayment.paymentMethod && (
                                            <div>
                                                <p className="text-gray-600">Ödeme Yöntemi</p>
                                                <p className="font-medium">
                                                    {paymentService.getPaymentMethodDisplayName(selectedPayment.paymentMethod)}
                                                </p>
                                            </div>
                                        )}
                                        {selectedPayment.transactionId && (
                                            <div>
                                                <p className="text-gray-600">İşlem No</p>
                                                <p className="font-mono">{selectedPayment.transactionId}</p>
                                            </div>
                                        )}
                                        {selectedPayment.invoiceNumber && (
                                            <div>
                                                <p className="text-gray-600">Fatura No</p>
                                                <p className="font-mono">{selectedPayment.invoiceNumber}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-600">Oluşturulma Tarihi</p>
                                            <p className="font-medium">
                                                {paymentService.formatDate(selectedPayment.createdAt)}
                                            </p>
                                        </div>
                                        {selectedPayment.paymentDate && (
                                            <div>
                                                <p className="text-gray-600">Ödeme Tarihi</p>
                                                <p className="font-medium">
                                                    {paymentService.formatDate(selectedPayment.paymentDate)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description/Notes */}
                                {(selectedPayment.description || selectedPayment.notes) && (
                                    <div className="space-y-2">
                                        {selectedPayment.description && (
                                            <div>
                                                <p className="text-sm text-gray-600">Açıklama</p>
                                                <p className="text-sm">{selectedPayment.description}</p>
                                            </div>
                                        )}
                                        {selectedPayment.notes && (
                                            <div>
                                                <p className="text-sm text-gray-600">Notlar</p>
                                                <p className="text-sm">{selectedPayment.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                    {selectedPayment.invoiceUrl && (
                                        <Button
                                            onClick={() => paymentService.downloadInvoice(selectedPayment.invoiceUrl!)}
                                            className="flex-1"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Faturayı İndir
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedPayment(null)}
                                        className="flex-1"
                                    >
                                        Kapat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
