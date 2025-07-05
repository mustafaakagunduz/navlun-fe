// src/store/slices/messagesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import messageService, { MessageRequest, MessageResponse, ConversationResponse } from '@/services/messageService'

interface MessagesState {
    // Gelen kutusu
    inbox: MessageResponse[]
    inboxLoading: boolean
    inboxError: string | null

    // Gönderilen mesajlar
    sent: MessageResponse[]
    sentLoading: boolean
    sentError: string | null

    // Konuşmalar
    conversations: ConversationResponse[]
    conversationsLoading: boolean
    conversationsError: string | null

    // Aktif konuşma
    activeConversation: MessageResponse[]
    activeConversationLoading: boolean
    activeConversationError: string | null
    activeLoadId: string | null

    // Mesaj gönderme
    sendMessageLoading: boolean
    sendMessageError: string | null

    // Okunmamış mesajlar
    unreadCount: number
    unreadMessages: MessageResponse[]
    unreadLoading: boolean

    // Seçili mesaj
    selectedMessage: MessageResponse | null

    // Filtreler
    searchQuery: string
    messageTypeFilter: string
    priorityFilter: string
}

const initialState: MessagesState = {
    inbox: [],
    inboxLoading: false,
    inboxError: null,

    sent: [],
    sentLoading: false,
    sentError: null,

    conversations: [],
    conversationsLoading: false,
    conversationsError: null,

    activeConversation: [],
    activeConversationLoading: false,
    activeConversationError: null,
    activeLoadId: null,

    sendMessageLoading: false,
    sendMessageError: null,

    unreadCount: 0,
    unreadMessages: [],
    unreadLoading: false,

    selectedMessage: null,

    searchQuery: '',
    messageTypeFilter: 'all',
    priorityFilter: 'all'
}

// Async Thunk'lar
export const fetchInbox = createAsyncThunk(
    'messages/fetchInbox',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await messageService.getInboxByUser(userId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gelen kutusu yüklenemedi')
        }
    }
)

export const fetchSentMessages = createAsyncThunk(
    'messages/fetchSentMessages',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await messageService.getSentByUser(userId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Gönderilen mesajlar yüklenemedi')
        }
    }
)

export const fetchConversations = createAsyncThunk(
    'messages/fetchConversations',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await messageService.getConversationsForUser(userId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Konuşmalar yüklenemedi')
        }
    }
)

export const fetchLoadConversation = createAsyncThunk(
    'messages/fetchLoadConversation',
    async ({ loadId, user1Id, user2Id }: { loadId: string, user1Id: string, user2Id: string }, { rejectWithValue }) => {
        try {
            return await messageService.getConversationForLoad(loadId, user1Id, user2Id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Konuşma yüklenemedi')
        }
    }
)

export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async (messageData: MessageRequest, { rejectWithValue }) => {
        try {
            return await messageService.sendMessage(messageData)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Mesaj gönderilemedi')
        }
    }
)

export const replyToMessage = createAsyncThunk(
    'messages/replyToMessage',
    async ({ parentMessageId, messageData }: { parentMessageId: string, messageData: MessageRequest }, { rejectWithValue }) => {
        try {
            return await messageService.replyToMessage(parentMessageId, messageData)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Yanıt gönderilemedi')
        }
    }
)

export const fetchUnreadCount = createAsyncThunk(
    'messages/fetchUnreadCount',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await messageService.getUnreadMessageCount(userId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Okunmamış mesaj sayısı alınamadı')
        }
    }
)

export const fetchUnreadMessages = createAsyncThunk(
    'messages/fetchUnreadMessages',
    async (userId: string, { rejectWithValue }) => {
        try {
            return await messageService.getUnreadMessages(userId)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Okunmamış mesajlar yüklenemedi')
        }
    }
)

export const markMessageAsRead = createAsyncThunk(
    'messages/markMessageAsRead',
    async ({ messageId, userId }: { messageId: string, userId: string }, { rejectWithValue }) => {
        try {
            await messageService.markMessageAsRead(messageId, userId)
            return messageId
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Mesaj okundu olarak işaretlenemedi')
        }
    }
)

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload
        },
        setMessageTypeFilter: (state, action: PayloadAction<string>) => {
            state.messageTypeFilter = action.payload
        },
        setPriorityFilter: (state, action: PayloadAction<string>) => {
            state.priorityFilter = action.payload
        },
        setSelectedMessage: (state, action: PayloadAction<MessageResponse | null>) => {
            state.selectedMessage = action.payload
        },
        setActiveLoadId: (state, action: PayloadAction<string | null>) => {
            state.activeLoadId = action.payload
        },
        clearSendMessageError: (state) => {
            state.sendMessageError = null
        },
        clearActiveConversation: (state) => {
            state.activeConversation = []
            state.activeLoadId = null
        },
        addMessageToActiveConversation: (state, action: PayloadAction<MessageResponse>) => {
            state.activeConversation.push(action.payload)
        },
        updateMessageInInbox: (state, action: PayloadAction<MessageResponse>) => {
            const index = state.inbox.findIndex(msg => msg.id === action.payload.id)
            if (index !== -1) {
                state.inbox[index] = action.payload
            }
        },
        decrementUnreadCount: (state) => {
            if (state.unreadCount > 0) {
                state.unreadCount -= 1
            }
        },
        resetMessageCount: (state) => {  // 👈 EKSİK OLAN REDUCER
            state.unreadCount = 0
        }
    },
    extraReducers: (builder) => {
        // Fetch Inbox
        builder
            .addCase(fetchInbox.pending, (state) => {
                state.inboxLoading = true
                state.inboxError = null
            })
            .addCase(fetchInbox.fulfilled, (state, action) => {
                state.inboxLoading = false
                state.inbox = action.payload
            })
            .addCase(fetchInbox.rejected, (state, action) => {
                state.inboxLoading = false
                state.inboxError = action.payload as string
            })

        // Fetch Sent Messages
        builder
            .addCase(fetchSentMessages.pending, (state) => {
                state.sentLoading = true
                state.sentError = null
            })
            .addCase(fetchSentMessages.fulfilled, (state, action) => {
                state.sentLoading = false
                state.sent = action.payload
            })
            .addCase(fetchSentMessages.rejected, (state, action) => {
                state.sentLoading = false
                state.sentError = action.payload as string
            })

        // Fetch Conversations
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.conversationsLoading = true
                state.conversationsError = null
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversationsLoading = false
                state.conversations = action.payload
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.conversationsLoading = false
                state.conversationsError = action.payload as string
            })

        // Fetch Load Conversation
        builder
            .addCase(fetchLoadConversation.pending, (state) => {
                state.activeConversationLoading = true
                state.activeConversationError = null
            })
            .addCase(fetchLoadConversation.fulfilled, (state, action) => {
                state.activeConversationLoading = false
                state.activeConversation = action.payload
            })
            .addCase(fetchLoadConversation.rejected, (state, action) => {
                state.activeConversationLoading = false
                state.activeConversationError = action.payload as string
            })

        // Send Message
        builder
            .addCase(sendMessage.pending, (state) => {
                state.sendMessageLoading = true
                state.sendMessageError = null
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sendMessageLoading = false
                // Gönderilen mesajı sent listesine ekle
                state.sent.unshift(action.payload)
                // Eğer aktif konuşmadaysa, konuşmaya da ekle
                if (state.activeLoadId === action.payload.loadId) {
                    state.activeConversation.push(action.payload)
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.sendMessageLoading = false
                state.sendMessageError = action.payload as string
            })

        // Reply to Message
        builder
            .addCase(replyToMessage.pending, (state) => {
                state.sendMessageLoading = true
                state.sendMessageError = null
            })
            .addCase(replyToMessage.fulfilled, (state, action) => {
                state.sendMessageLoading = false
                // Yanıtı sent listesine ekle
                state.sent.unshift(action.payload)
                // Eğer aktif konuşmadaysa, konuşmaya da ekle
                if (state.activeLoadId === action.payload.loadId) {
                    state.activeConversation.push(action.payload)
                }
            })
            .addCase(replyToMessage.rejected, (state, action) => {
                state.sendMessageLoading = false
                state.sendMessageError = action.payload as string
            })

        // Fetch Unread Count
        builder
            .addCase(fetchUnreadCount.pending, (state) => {
                state.unreadLoading = true
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadLoading = false
                state.unreadCount = action.payload
            })
            .addCase(fetchUnreadCount.rejected, (state) => {
                state.unreadLoading = false
            })

        // Fetch Unread Messages
        builder
            .addCase(fetchUnreadMessages.pending, (state) => {
                state.unreadLoading = true
            })
            .addCase(fetchUnreadMessages.fulfilled, (state, action) => {
                state.unreadLoading = false
                state.unreadMessages = action.payload
            })
            .addCase(fetchUnreadMessages.rejected, (state) => {
                state.unreadLoading = false
            })

        // Mark Message as Read
        builder
            .addCase(markMessageAsRead.fulfilled, (state, action) => {
                const messageId = action.payload
                // Inbox'ta mesajı güncelle
                const inboxMessage = state.inbox.find(msg => msg.id === messageId)
                if (inboxMessage) {
                    inboxMessage.isRead = true
                    inboxMessage.readAt = new Date().toISOString()
                }
                // Aktif konuşmada mesajı güncelle
                const activeMessage = state.activeConversation.find(msg => msg.id === messageId)
                if (activeMessage) {
                    activeMessage.isRead = true
                    activeMessage.readAt = new Date().toISOString()
                }
                // Okunmamış sayıyı azalt
                if (state.unreadCount > 0) {
                    state.unreadCount -= 1
                }
            })
    },
})

export const {
    setSearchQuery,
    setMessageTypeFilter,
    setPriorityFilter,
    setSelectedMessage,
    setActiveLoadId,
    clearSendMessageError,
    clearActiveConversation,
    addMessageToActiveConversation,
    updateMessageInInbox,
    decrementUnreadCount,
    resetMessageCount  // 👈 EKSİK OLAN EXPORT
} = messagesSlice.actions

export default messagesSlice.reducer

// NOT: src/store/index.ts dosyasına da eklenmelidir:
// import messagesReducer from './slices/messagesSlice'
//
// store yapılandırmasında:
// messages: messagesReducer,