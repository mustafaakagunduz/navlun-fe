// src/services/notificationService.ts
import apiService from '@/services/apiService';

// Enum tanımlamaları
export enum NotificationType {
    INFO = 'INFO',
    WARNING = 'WARNING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

// Tip tanımlamaları
export type Notification = {
    id: string;
    userId: string;
    content: string;
    title: string;
    type: NotificationType;
    isRead: boolean;
    readAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type NotificationRequest = {
    userId: string;
    content: string;
    title: string;
    type: NotificationType;
};

export type NotificationUpdateRequest = {
    isRead: boolean;
};


export type BulkNotificationRequest = {
    userIds: string[];
    title: string;
    content: string;
    type: NotificationType;
};

export type NotificationStats = {
    totalCount: number;
    unreadCount: number;
    todayCount: number;
    thisWeekCount: number;
};

const notificationService = {
    // Yeni bildirim oluşturur
    createNotification: async (notificationData: NotificationRequest): Promise<Notification> => {
        try {
            return await apiService.post<Notification, NotificationRequest>('/notifications', notificationData);
        } catch (error) {
            console.error('Create notification error:', error);
            throw error;
        }
    },

    // Belirli bir bildirimi ID'ye göre getirir
    getNotificationById: async (id: string): Promise<Notification> => {
        try {
            return await apiService.get<Notification>(`/notifications/${id}`);
        } catch (error) {
            console.error(`Get notification by ID (${id}) error:`, error);
            throw error;
        }
    },



    // Tüm bildirimleri getirir
    getAllNotifications: async (): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>('/notifications');
        } catch (error) {
            console.error('Get all notifications error:', error);
            throw error;
        }
    },

    // Kullanıcı ID'sine göre bildirimleri getirir
    getNotificationsByUser: async (userId: string): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>(`/notifications/user/${userId}`);
        } catch (error) {
            console.error(`Get notifications by user (${userId}) error:`, error);
            throw error;
        }
    },

    // Kullanıcı ID'si ve okunma durumuna göre bildirimleri getirir
    getNotificationsByUserAndReadStatus: async (userId: string, isRead: boolean): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>(`/notifications/user/${userId}/status`, { isRead });
        } catch (error) {
            console.error(`Get notifications by user (${userId}) and read status (${isRead}) error:`, error);
            throw error;
        }
    },

    // Bildirim tipine göre bildirimleri getirir
    getNotificationsByType: async (type: NotificationType): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>(`/notifications/type/${type}`);
        } catch (error) {
            console.error(`Get notifications by type (${type}) error:`, error);
            throw error;
        }
    },

    // Oluşturma tarihi aralığına göre bildirimleri getirir
    getNotificationsByCreationDateRange: async (
        start: string,
        end: string
    ): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>('/notifications/created-between', { start, end });
        } catch (error) {
            console.error(`Get notifications by creation date range error:`, error);
            throw error;
        }
    },

    // Okunma tarihi aralığına göre bildirimleri getirir
    getNotificationsByReadDateRange: async (
        start: string,
        end: string
    ): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>('/notifications/read-between', { start, end });
        } catch (error) {
            console.error(`Get notifications by read date range error:`, error);
            throw error;
        }
    },

    // Bildirim okunma durumunu günceller
    updateNotification: async (id: string, updateDto: NotificationUpdateRequest): Promise<Notification> => {
        try {
            return await apiService.put<Notification, NotificationUpdateRequest>(`/notifications/${id}`, updateDto);
        } catch (error) {
            console.error(`Update notification (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Bildirimi siler
    deleteNotification: async (id: string): Promise<void> => {
        try {
            await apiService.delete(`/notifications/${id}`);
        } catch (error) {
            console.error(`Delete notification (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Bildirimi okundu olarak işaretler
    markAsRead: async (id: string): Promise<void> => {
        try {
            await apiService.patch(`/notifications/${id}/mark-read`, {});
        } catch (error) {
            console.error(`Mark notification as read (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Bildirimi okunmadı olarak işaretler
    markAsUnread: async (id: string): Promise<void> => {
        try {
            await apiService.patch(`/notifications/${id}/mark-unread`, {});
        } catch (error) {
            console.error(`Mark notification as unread (ID: ${id}) error:`, error);
            throw error;
        }
    },

    // Mevcut kullanıcının bildirimlerini getirir
    getCurrentUserNotifications: async (): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>('/notifications/me');
        } catch (error) {
            console.error('Get current user notifications error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının okunmamış bildirimlerini getirir
    getCurrentUserUnreadNotifications: async (): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>('/notifications/me/unread');
        } catch (error) {
            console.error('Get current user unread notifications error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının tüm bildirimlerini okundu olarak işaretler
    markAllAsRead: async (): Promise<void> => {
        try {
            await apiService.patch('/notifications/me/mark-all-read', {});
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            throw error;
        }
    },

    // Bildirim sayısını getirir
    getNotificationCount: async (params?: {
        userId?: string;
        isRead?: boolean;
        type?: NotificationType;
    }): Promise<number> => {
        try {
            return await apiService.get<number>('/notifications/count', params);
        } catch (error) {
            console.error('Get notification count error:', error);
            throw error;
        }
    },

    // Bu metodları dosyanın sonuna, son } 'den önce ekle

    // Kullanıcının okunmamış bildirim sayısını getirir
    getUnreadNotificationCount: async (userId: string): Promise<number> => {
        try {
            return await apiService.get<number>(`/notifications/user/${userId}/unread-count`);
        } catch (error) {
            console.error(`Get unread notification count (${userId}) error:`, error);
            throw error;
        }
    },

    // Kullanıcının son bildirimlerini getirir (sınırlı sayıda)
    getRecentNotificationsByUser: async (userId: string, limit: number = 10): Promise<Notification[]> => {
        try {
            return await apiService.get<Notification[]>(`/notifications/user/${userId}/recent`, { limit });
        } catch (error) {
            console.error(`Get recent notifications by user (${userId}) error:`, error);
            throw error;
        }
    },

    // Toplu bildirim gönderir
    sendBulkNotification: async (bulkData: BulkNotificationRequest): Promise<void> => {
        try {
            await apiService.post('/notifications/bulk', bulkData);
        } catch (error) {
            console.error('Send bulk notification error:', error);
            throw error;
        }
    },

    // Mevcut kullanıcının bildirim istatistiklerini getirir
    getCurrentUserNotificationStats: async (): Promise<NotificationStats> => {
        try {
            const notifications = await notificationService.getCurrentUserNotifications();
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            return {
                totalCount: notifications.length,
                unreadCount: notifications.filter(n => !n.isRead).length,
                todayCount: notifications.filter(n =>
                    new Date(n.createdAt || '') >= today
                ).length,
                thisWeekCount: notifications.filter(n =>
                    new Date(n.createdAt || '') >= thisWeek
                ).length
            };
        } catch (error) {
            console.error('Get current user notification stats error:', error);
            throw error;
        }
    },

    // Bildirim tipine göre renk döndürür (UI için)
    getNotificationColor: (type: NotificationType): string => {
        switch (type) {
            case NotificationType.SUCCESS:
                return 'green';
            case NotificationType.WARNING:
                return 'yellow';
            case NotificationType.ERROR:
                return 'red';
            case NotificationType.INFO:
            default:
                return 'blue';
        }
    },

    // Bildirim tipine göre ikon döndürür (UI için)
    getNotificationIcon: (type: NotificationType): string => {
        switch (type) {
            case NotificationType.SUCCESS:
                return 'CheckCircle';
            case NotificationType.WARNING:
                return 'AlertTriangle';
            case NotificationType.ERROR:
                return 'XCircle';
            case NotificationType.INFO:
            default:
                return 'Info';
        }
    },

    // Bildirim içeriğini özetler (uzun bildirimleri kısaltır)
    summarizeNotificationContent: (content: string, maxLength: number = 100): string => {
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + '...';
    },

    // Teklif bildirimi için özel format
    formatOfferNotification: (
        loadTitle: string,
        carrierName: string,
        price: number,
        vehicleInfo: string,
        isEcoFriendly: boolean = false
    ): { title: string; content: string } => {
        const ecoText = isEcoFriendly ? ' 🌱 (Çevreci Araç)' : '';
        return {
            title: 'Yeni Teklif Aldınız',
            content: `"${loadTitle}" yükünüz için ${carrierName} firmasından ${price} TL teklif aldınız. Araç: ${vehicleInfo}${ecoText}`
        };
    },

    // Teklif kabul bildirimi için özel format
    formatOfferAcceptedNotification: (
        loadTitle: string,
        loadingAddress: string,
        deliveryAddress: string,
        loadingDate: string
    ): { title: string; content: string } => {
        return {
            title: 'Teklifiniz Kabul Edildi! 🎉',
            content: `"${loadTitle}" yükü için verdiğiniz teklif kabul edildi. Yükleme: ${loadingAddress}, Teslimat: ${deliveryAddress}, Tarih: ${loadingDate}`
        };
    }
};

export default notificationService;