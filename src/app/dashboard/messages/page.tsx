// src/app/dashboard/messages/page.tsx
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    Search,
    Mail,
    Send,
    Loader2,
    Clock,
    CheckCircle,
    Circle,
    Package,
    User,
    Calendar,
    Filter,
    RefreshCcw,
    Eye,
    Trash2,
    Reply,
    MoreVertical
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchInbox,
    fetchSentMessages,
    fetchConversations,
    fetchUnreadCount,
    markMessageAsRead,
    setSearchQuery,
    setMessageTypeFilter,
    resetMessageCount
} from '@/store/slices/messagesSlice';


export default function MessagesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t, language } = useLanguage();
    const dispatch = useAppDispatch();

    // Redux state
    const {
        inbox,
        inboxLoading,
        sent,
        sentLoading,
        conversations,
        conversationsLoading,
        unreadCount,
        searchQuery,
        messageTypeFilter
    } = useAppSelector(state => state.messages);

    // Local state
    const [activeTab, setActiveTab] = useState('conversations');
    const [showFilters, setShowFilters] = useState(false);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load messages on mount
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            dispatch(fetchConversations(user.id));
            dispatch(fetchInbox(user.id));
            dispatch(fetchSentMessages(user.id));
            dispatch(fetchUnreadCount(user.id));
        }
    }, [dispatch, isAuthenticated, user?.id]);

    // Reset message notification count when visiting this page
    useEffect(() => {
        dispatch(resetMessageCount());
    }, [dispatch]);

    // Filter messages based on search and filters
    const filterMessages = (messages: any[]) => {
        return messages.filter(message => {
            const matchesSearch = searchQuery === '' ||
                message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                message.senderFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                message.senderLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                message.receiverFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                message.receiverLastName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = messageTypeFilter === 'all' ||
                message.messageType === messageTypeFilter;

            return matchesSearch && matchesType;
        });
    };

    const handleMessageClick = (loadId: string, otherUserId: string) => {
        if (loadId) {
            router.push(`/dashboard/messages/load/${loadId}?otherUserId=${otherUserId}`);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        if (user?.id) {
            await dispatch(markMessageAsRead({ messageId, userId: user.id }));
        }
    };

    const getMessagePreview = (content: string) => {
        return content?.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    const formatDate = (dateString: string) => {
        // Basit tarih formatı (date-fns yerine)
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Bugün';
        } else if (diffInDays === 1) {
            return 'Dün';
        } else if (diffInDays < 7) {
            return `${diffInDays} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    };

    const getStatusBadgeColor = (isRead: boolean) => {
        return isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <MessageSquare className="h-8 w-8 text-blue-600" />
                            Mesajlar
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Yük bazlı mesajlaşma ve iletişim merkezi
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Mail className="h-4 w-4 mr-1" />
                            {unreadCount} okunmamış mesaj
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (user?.id) {
                                    dispatch(fetchConversations(user.id));
                                    dispatch(fetchInbox(user.id));
                                    dispatch(fetchUnreadCount(user.id));
                                }
                            }}
                        >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Yenile
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Mesajlarda ara..."
                                    value={searchQuery}
                                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtreler
                            </Button>
                        </div>

                        {showFilters && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mesaj Türü</label>
                                        <select
                                            value={messageTypeFilter}
                                            onChange={(e) => dispatch(setMessageTypeFilter(e.target.value))}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="all">Tümü</option>
                                            <option value="GENERAL_MESSAGE">Genel Mesaj</option>
                                            <option value="OFFER_NOTIFICATION">Teklif Bildirimi</option>
                                            <option value="LOAD_UPDATE">Yük Güncellemesi</option>
                                            <option value="DELIVERY_UPDATE">Teslimat Güncellemesi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Messages Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="conversations" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Konuşmalar
                        </TabsTrigger>
                        <TabsTrigger value="inbox" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Gelen Kutusu ({inbox.length})
                        </TabsTrigger>
                        <TabsTrigger value="sent" className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Gönderilenler ({sent.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Conversations Tab */}
                    <TabsContent value="conversations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Yük Bazlı Konuşmalar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {conversationsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Konuşmalar yükleniyor...
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Henüz konuşma bulunmuyor</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Yük kartlarından "Gönderici ile Mesajlaş" butonunu kullanarak mesajlaşma başlatabilirsiniz
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {conversations.map((conversation) => (
                                            <div
                                                key={`${conversation.loadId}-${conversation.otherUserId}`}
                                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleMessageClick(conversation.loadId, conversation.otherUserId)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Package className="h-4 w-4 text-blue-600" />
                                                            <span className="font-medium">{conversation.loadTitle || "Yük Başlığı Yok"}</span>

                                                            {conversation.unreadCount > 0 && (
                                                                <Badge className="bg-red-100 text-red-600 border-red-200">
                                                                    {conversation.unreadCount} yeni
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                            <User className="h-3 w-3" />
                                                            <span>{conversation.otherUserName}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {conversation.otherUserRole}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            {getMessagePreview(conversation.lastMessage)}
                                                        </p>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(conversation.lastMessageAt)}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Inbox Tab */}
                    <TabsContent value="inbox" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gelen Kutusu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inboxLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Gelen kutusu yükleniyor...
                                    </div>
                                ) : filterMessages(inbox).length === 0 ? (
                                    <div className="text-center py-8">
                                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Gelen mesaj bulunmuyor</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filterMessages(inbox).map((message) => (
                                            <div
                                                key={message.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    message.isRead ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                                                }`}
                                                onClick={() => {
                                                    if (!message.isRead) {
                                                        handleMarkAsRead(message.id);
                                                    }
                                                    if (message.loadId) {
                                                        handleMessageClick(message.loadId, message.senderUserId);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {message.isRead ? (
                                                                <CheckCircle className="h-4 w-4 text-gray-400" />
                                                            ) : (
                                                                <Circle className="h-4 w-4 text-blue-600" />
                                                            )}
                                                            <span className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                                                                {message.subject}
                                                            </span>
                                                            <Badge className={getStatusBadgeColor(message.isRead)}>
                                                                {message.messageType}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                            <User className="h-3 w-3" />
                                                            <span>{message.senderFirstName} {message.senderLastName}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {message.senderRole}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            {getMessagePreview(message.content)}
                                                        </p>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(message.createdAt)}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Reply className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sent Tab */}
                    <TabsContent value="sent" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gönderilen Mesajlar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sentLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Gönderilen mesajlar yükleniyor...
                                    </div>
                                ) : filterMessages(sent).length === 0 ? (
                                    <div className="text-center py-8">
                                        <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Gönderilen mesaj bulunmuyor</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filterMessages(sent).map((message) => (
                                            <div
                                                key={message.id}
                                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    if (message.loadId) {
                                                        handleMessageClick(message.loadId, message.receiverUserId);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Send className="h-4 w-4 text-green-600" />
                                                            <span className="font-medium">{message.subject}</span>
                                                            <Badge className="bg-green-100 text-green-600 border-green-200">
                                                                {message.messageType}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                            <User className="h-3 w-3" />
                                                            <span>Kime: {message.receiverFirstName} {message.receiverLastName}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {message.receiverRole}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            {getMessagePreview(message.content)}
                                                        </p>
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(message.createdAt)}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ProtectedRoute>
    );
}