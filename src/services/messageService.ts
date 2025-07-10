// src/services/messageService.ts
import apiService from '@/services/apiService';

// Temizlenmiş tip tanımları
export interface MessageRequest {
    loadId: string;
    senderUserId: string;
    receiverUserId: string;
    subject: string;
    content: string;
    messageType?: MessageType;
    priority?: MessagePriority;
    category?: MessageCategory;
}

export interface MessageResponse {
    id: string;
    loadId: string;
    loadTitle?: string;
    loadGoodsType?: string;
    senderUserId: string;
    senderFirstName?: string;
    senderLastName?: string;
    senderEmail?: string;
    senderRole: string;
    receiverUserId: string;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiverRole: string;
    subject: string;
    content: string;
    messageType: MessageType;
    priority: MessagePriority;
    category: MessageCategory;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationResponse {
    loadId: string;
    loadTitle: string;
    otherUserId: string;
    otherUserName: string;
    otherUserRole: string;
    messageCount: number;
    unreadCount: number;
    lastMessageAt: string;
    lastMessageContent: string;
}

export enum MessageType {
    GENERAL = "GENERAL",
    OFFER_NOTIFICATION = "OFFER_NOTIFICATION",
    OFFER_ACCEPTED = "OFFER_ACCEPTED",
    OFFER_REJECTED = "OFFER_REJECTED",
    LOAD_UPDATE = "LOAD_UPDATE",
    DELIVERY_UPDATE = "DELIVERY_UPDATE"
}

export enum MessagePriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum MessageCategory {
    GENERAL = 'GENERAL',
    OFFER = 'OFFER',
    DELIVERY = 'DELIVERY',
    SYSTEM = 'SYSTEM'
}

const messageService = {
    // Mesaj gönder
    sendMessage: async (messageData: MessageRequest): Promise<MessageResponse> => {
        try {
            return await apiService.post<MessageResponse>('/messages', messageData);
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    },

    // Yük için konuşma getir
    getLoadConversation: async (loadId: string, userId: string, otherUserId: string): Promise<MessageResponse[]> => {
        try {
            return await apiService.get<MessageResponse[]>(
                `/messages/load/${loadId}/conversation?userId=${userId}&otherUserId=${otherUserId}`
            );
        } catch (error) {
            console.error('Get load conversation error:', error);
            throw error;
        }
    },

    // Kullanıcının konuşma listesi
    getUserConversations: async (userId: string): Promise<ConversationResponse[]> => {
        try {
            return await apiService.get<ConversationResponse[]>(`/messages/user/${userId}/conversations`);
        } catch (error) {
            console.error('Get user conversations error:', error);
            throw error;
        }
    },

    // Okunmamış mesaj sayısı
    getUnreadCount: async (userId: string): Promise<number> => {
        try {
            return await apiService.get<number>(`/messages/user/${userId}/unread-count`);
        } catch (error) {
            console.error('Get unread count error:', error);
            throw error;
        }
    },

    // Konuşmayı kullanıcı için sil (soft delete)
    deleteConversationForUser: async (userId: string, loadId: string, otherUserId: string): Promise<boolean> => {
        try {
            return await apiService.delete<boolean>(`/messages/user/${userId}/conversation/${loadId}?otherUserId=${otherUserId}`);
        } catch (error) {
            console.error('Delete conversation error:', error);
            throw error;
        }
    },

    // Mesajı okundu olarak işaretle
    markAsRead: async (messageId: string, userId: string): Promise<boolean> => {
        try {
            return await apiService.post<boolean>(`/messages/${messageId}/mark-read?userId=${userId}`);
        } catch (error) {
            console.error('Mark as read error:', error);
            throw error;
        }
    }
};

export default messageService;