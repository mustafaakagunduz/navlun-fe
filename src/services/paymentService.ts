import apiService from '@/services/apiService';

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
    PAYPAL = 'PAYPAL',
    STRIPE = 'STRIPE',
    OTHER = 'OTHER'
}

export interface Payment {
    id: string;
    loadId: string;
    loadTitle: string;
    offerId?: string;
    senderId: string;
    senderCompanyName?: string;
    carrierId?: string;
    carrierCompanyName?: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paymentDate?: string;
    transactionId?: string;
    description?: string;
    notes?: string;
    invoiceNumber?: string;
    invoiceUrl?: string;
    commissionAmount?: number;
    serviceFee?: number;
    taxAmount?: number;
    totalAmount: number;
    refundAmount?: number;
    refundDate?: string;
    refundReason?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface PaymentStatistics {
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalRefunded: number;
    lastMonthTotal: number;
    thisMonthTotal: number;
}

class PaymentService {
    private baseUrl = '/payments';

    /**
     * Get current user's payment history
     */
    async getCurrentUserPaymentHistory(): Promise<Payment[]> {
        const response = await apiService.get<Payment[]>(`${this.baseUrl}/current-user/history`);
        return response;
    }

    /**
     * Get current user's payment statistics
     */
    async getCurrentUserPaymentStatistics(): Promise<PaymentStatistics> {
        const response = await apiService.get<PaymentStatistics>(`${this.baseUrl}/current-user/statistics`);
        return response;
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(id: string): Promise<Payment> {
        const response = await apiService.get<Payment>(`${this.baseUrl}/${id}`);
        return response;
    }

    /**
     * Create payment for a completed load
     */
    async createPaymentForLoad(loadId: string, paymentData: {
        loadId: string;
        senderId: string;
        offerId?: string;
        carrierId?: string;
        amount: number;
        paymentMethod: PaymentMethod;
        description?: string;
    }): Promise<Payment> {
        const response = await apiService.post<Payment>(`${this.baseUrl}/load/${loadId}`, paymentData);
        return response;
    }

    /**
     * Get status color class
     */
    getStatusColor(status: PaymentStatus): string {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return 'text-green-700 bg-green-50 border-green-200';
            case PaymentStatus.PENDING:
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case PaymentStatus.PROCESSING:
                return 'text-blue-700 bg-blue-50 border-blue-200';
            case PaymentStatus.FAILED:
                return 'text-red-700 bg-red-50 border-red-200';
            case PaymentStatus.REFUNDED:
                return 'text-purple-700 bg-purple-50 border-purple-200';
            case PaymentStatus.CANCELLED:
                return 'text-gray-700 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    }

    /**
     * Get status display name
     */
    getStatusDisplayName(status: PaymentStatus): string {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return 'Tamamlandı';
            case PaymentStatus.PENDING:
                return 'Bekliyor';
            case PaymentStatus.PROCESSING:
                return 'İşleniyor';
            case PaymentStatus.FAILED:
                return 'Başarısız';
            case PaymentStatus.REFUNDED:
                return 'İade Edildi';
            case PaymentStatus.CANCELLED:
                return 'İptal Edildi';
            default:
                return 'Bilinmiyor';
        }
    }

    /**
     * Get payment method display name
     */
    getPaymentMethodDisplayName(method?: PaymentMethod): string {
        if (!method) return '-';

        switch (method) {
            case PaymentMethod.CREDIT_CARD:
                return 'Kredi Kartı';
            case PaymentMethod.DEBIT_CARD:
                return 'Banka Kartı';
            case PaymentMethod.BANK_TRANSFER:
                return 'Banka Havalesi';
            case PaymentMethod.CASH:
                return 'Nakit';
            case PaymentMethod.PAYPAL:
                return 'PayPal';
            case PaymentMethod.STRIPE:
                return 'Stripe';
            case PaymentMethod.OTHER:
                return 'Diğer';
            default:
                return 'Bilinmiyor';
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount?: number): string {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format date
     */
    formatDate(dateString?: string): string {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    }

    /**
     * Download invoice
     */
    downloadInvoice(invoiceUrl: string): void {
        window.open(invoiceUrl, '_blank');
    }
}

const paymentService = new PaymentService();
export default paymentService;
