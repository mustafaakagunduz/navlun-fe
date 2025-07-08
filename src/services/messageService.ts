// src/services/messageService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export interface MessageRequest {
    loadId?: string;
    receiverUserId: string;
    subject: string;
    content: string;
    messageType: MessageType;
    priority?: MessagePriority;
    category?: MessageCategory;
    parentMessageId?: string;
    attachments?: string[];
}


export interface MessageResponse {
    id: string;
    loadId?: string;
    loadTitle?: string;
    loadGoodsType?: string;
    senderUserId: string;
    senderFirstName?: string;
    senderLastName?: string;
    senderEmail: string;
    senderRole: string;
    receiverUserId: string;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail: string;
    receiverRole: string;
    subject: string;
    content: string;
    messageType: MessageType;
    priority: MessagePriority;
    category: MessageCategory;
    isRead: boolean;
    readAt?: string;
    parentMessageId?: string;
    isReply: boolean;
    hasReplies: boolean;
    replyCount: number;
    attachments: string[];
    hasAttachments: boolean;
    senderDeleted: boolean;
    receiverDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationResponse {
    loadId: string;
    loadTitle: string;
    otherUserId: string;
    otherUserName: string;
    otherUserRole: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

export enum MessageType {
    GENERAL = "GENERAL",
    OFFER_NOTIFICATION = "OFFER_NOTIFICATION",
    OFFER_ACCEPTED = "OFFER_ACCEPTED",
    OFFER_REJECTED = "OFFER_REJECTED",
    LOAD_UPDATE = "LOAD_UPDATE",
    DELIVERY_UPDATE = "DELIVERY_UPDATE",
    SYSTEM_MESSAGE = "SYSTEM_MESSAGE",
    CONTRACT_MESSAGE = "CONTRACT_MESSAGE",
    PAYMENT_MESSAGE = "PAYMENT_MESSAGE",
    COMPLAINT = "COMPLAINT"
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
    // Mesaj gönderme
    sendMessage: async (messageData: MessageRequest): Promise<MessageResponse> => {
        try {
            return await apiService.post<MessageResponse>('/messages', messageData);
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    },

    // Mesaja yanıt verme
    replyToMessage: async (parentMessageId: string, messageData: MessageRequest): Promise<MessageResponse> => {
        try {
            return await apiService.post<MessageResponse>(`/messages/${parentMessageId}/reply`, messageData);
        } catch (error) {
            console.error('Reply to message error:', error);
            throw error;
        }
    },

    // Kullanıcının gelen kutusu
    getInboxByUser: async (userId: string): Promise<MessageResponse[]> => {
        try {
            return await apiService.get<MessageResponse[]>(`/messages/user/${userId}/inbox`);
        } catch (error) {
            console.error('Get inbox error:', error);
            throw error;
        }
    },



    // Kullanıcının gönderilen mesajları
    getSentByUser: async (userId: string): Promise<MessageResponse[]> => {
        try {
            return await apiService.get<MessageResponse[]>(`/messages/user/${userId}/sent`);
        } catch (error) {
            console.error('Get sent messages error:', error);
            throw error;
        }
    },

    // Kullanıcının tüm konuşmaları
    getConversationsForUser: async (userId: string): Promise<ConversationResponse[]> => {
        try {
            return await apiService.get<ConversationResponse[]>(`/messages/user/${userId}/conversations`);
        } catch (error) {
            console.error('Get conversations error:', error);
            throw error;
        }
    },

    // Yük bazlı konuşma
    getConversationForLoad: async (loadId: string, user1Id: string, user2Id: string): Promise<MessageResponse[]> => {
        try {
            return await apiService.get<MessageResponse[]>(`/messages/conversation/load/${loadId}`, {
                user1Id,
                user2Id
            });
        } catch (error) {
            console.error('Get load conversation error:', error);
            throw error;
        }
    },

    // Okunmamış mesaj sayısı
    getUnreadMessageCount: async (userId: string): Promise<number> => {
        try {
            return await apiService.get<number>(`/messages/user/${userId}/unread-count`);
        } catch (error) {
            console.error('Get unread count error:', error);
            throw error;
        }
    },

    // Okunmamış mesajlar
    getUnreadMessages: async (userId: string): Promise<MessageResponse[]> => {
        try {
            return await apiService.get<MessageResponse[]>(`/messages/user/${userId}/unread`);
        } catch (error) {
            console.error('Get unread messages error:', error);
            throw error;
        }
    },

    // Mesajı okundu olarak işaretle
    markMessageAsRead: async (messageId: string, userId: string): Promise<boolean> => {
        try {
            return await apiService.post<boolean>(`/messages/${messageId}/mark-read?userId=${userId}`);
        } catch (error) {
            console.error('Mark message as read error:', error);
            throw error;
        }
    },

    // Tüm mesajları okundu işaretle
    markAllMessagesAsRead: async (userId: string): Promise<boolean> => {
        try {
            return await apiService.post<boolean>(`/messages/user/${userId}/mark-all-read`);
        } catch (error) {
            console.error('Mark all messages as read error:', error);
            throw error;
        }
    },

    // Yük için mesajları getir
    getMessagesByLoad: async (loadId: string): Promise<MessageResponse[]> => {
        try {
            return await apiService.get<MessageResponse[]>(`/messages/load/${loadId}`);
        } catch (error) {
            console.error('Get messages by load error:', error);
            throw error;
        }
    },

    // Mesaj sil
    deleteMessageForUser: async (messageId: string, userId: string): Promise<boolean> => {
        try {
            return await apiService.delete<boolean>(`/messages/${messageId}/${ userId }`);
        } catch (error) {
            console.error('Delete message error:', error);
            throw error;
        }
    }
};

export default messageService;