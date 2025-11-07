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
import {
    MessageSquare,
    Search,
    Loader2,
    Clock,
    Package,
    User,
    Trash2,
    RefreshCcw,
    Mail
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from '@/hooks/use-toast';
import messageService, { ConversationResponse } from '@/services/messageService';
import { updateMessageCount } from '@/store/slices/notificationsSlice';
import { useAppDispatch } from '@/hooks/redux';
import { formatDate } from '@/utils/dateUtils';

export default function MessagesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const { toast } = useToast();
    const dispatch = useAppDispatch();
    // State
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Load conversations on mount
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadConversations();
            loadUnreadCount();
        }
    }, [isAuthenticated, user?.id]);

    // Filter conversations based on search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            const filtered = conversations.filter(conversation =>
                conversation.loadTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conversation.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conversation.lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredConversations(filtered);
        }
    }, [searchQuery, conversations]);

    // Sayfa focus olduğunda unread count'ları güncelle
    useEffect(() => {
        const handleFocus = () => {
            if (user?.id) {
                loadUnreadCount();
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [user?.id]);

// Sayfa görünür olduğunda konuşmaları yenile
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user?.id) {
                loadConversations();
                loadUnreadCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user?.id]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await messageService.getUserConversations(user!.id);
            setConversations(data);
        } catch (error) {
            console.error('Konuşmalar yüklenirken hata:', error);
            toast({
                title: "Hata",
                description: "Konuşmalar yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConversation = async (loadId: string, otherUserId: string, loadTitle: string) => {
        if (!user?.id) return;

        const confirmed = window.confirm(
            `"${loadTitle}" konuşmasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
        );

        if (!confirmed) return;

        try {
            setDeletingConversationId(`${loadId}-${otherUserId}`);

            await messageService.deleteConversationForUser(user.id, loadId, otherUserId);

            // Konuşmayı listeden kaldır
            setConversations(prev =>
                prev.filter(conv => !(conv.loadId === loadId && conv.otherUserId === otherUserId))
            );

            toast({
                title: "Başarılı",
                description: "Konuşma silindi.",
            });

        } catch (error) {
            console.error('Konuşma silme hatası:', error);
            toast({
                title: "Hata",
                description: "Konuşma silinemedi.",
                variant: "destructive",
            });
        } finally {
            setDeletingConversationId(null);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await messageService.getUnreadCount(user!.id);
            setUnreadCount(count);
            dispatch(updateMessageCount(count));
        } catch (error) {
            console.error('Okunmamış sayı yüklenirken hata:', error);
        }
    };

    const handleConversationClick = (loadId: string, otherUserId: string) => {
        // Admin destek konuşması için null yerine "admin-support" kullan
        const finalLoadId = loadId === null || loadId === 'null' ? 'admin-support' : loadId;

        router.push(`/dashboard/messages/load/${finalLoadId}?otherUserId=${otherUserId}`);

        // Konuşmaya girince o konuşmanın unread count'ını sıfırla (UI güncelleme)
        setTimeout(() => {
            setConversations(prev =>
                prev.map(conv =>
                    conv.loadId === loadId && conv.otherUserId === otherUserId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                )
            );
            loadUnreadCount();
        }, 1000);
    };

    const handleRefresh = () => {
        loadConversations();
        loadUnreadCount();
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            return 'Az önce';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} saat önce`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)} gün önce`;
        } else {
            return formatDate(dateString);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'bg-blue-100 text-blue-800';
            case 'BROKER':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'Gönderici';
            case 'BROKER':
                return 'Broker';
            default:
                return role;
        }
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
                        <h1 className="text-3xl font-bold text-gray-900">Mesajlarım</h1>
                        <p className="text-gray-600 mt-1">
                            Yük bazlı konuşmalarınızı görüntüleyin ve yönetin
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="bg-red-500">
                                <Mail className="h-4 w-4 mr-1" />
                                {unreadCount} okunmamış
                            </Badge>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Yenile
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Konuşmaları ara... (yük başlığı, kullanıcı adı, mesaj içeriği)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Contact Card */}
                <Card className="border-2 border-green-500 bg-green-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">Sistem Yöneticisi (Admin)</h3>
                                    <p className="text-sm text-gray-600">
                                        Sorularınız için admin ile iletişime geçin
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                    // Admin ile genel konuşma için özel bir "system-admin" load ID kullan
                                    router.push(`/dashboard/messages/admin-contact`);
                                }}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Admin ile Mesajlaş
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Conversations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Yük Bazlı Konuşmalar
                            <Badge variant="outline" className="ml-auto">
                                {filteredConversations.length} konuşma
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Konuşmalar yükleniyor...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                {searchQuery ? (
                                    <>
                                        <p className="text-gray-500">Arama kriterlerinize uygun konuşma bulunamadı</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Farklı anahtar kelimelerle tekrar deneyin
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-500">Henüz konuşma bulunmuyor</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Yük kartlarından "Mesajlaş" butonunu kullanarak mesajlaşma başlatabilirsiniz
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredConversations.map((conversation) => (
                                    <div
                                        key={`${conversation.loadId}-${conversation.otherUserId}`}
                                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors relative group"
                                    >
                                        {/* Delete Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteConversation(conversation.loadId, conversation.otherUserId, conversation.loadTitle);
                                            }}
                                            disabled={deletingConversationId === `${conversation.loadId}-${conversation.otherUserId}`}
                                        >
                                            {deletingConversationId === `${conversation.loadId}-${conversation.otherUserId}` ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>

                                        {/* Conversation Content - Clickable */}
                                        <div
                                            className="cursor-pointer pr-10"
                                            onClick={() => handleConversationClick(conversation.loadId, conversation.otherUserId)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {conversation.loadTitle}
                                                        </h3>
                                                        {conversation.unreadCount > 0 && (
                                                            <Badge variant="destructive" className="bg-red-500 text-xs">
                                                                {conversation.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="h-3 w-3 text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                        {conversation.otherUserName}
                                                    </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${getRoleBadgeColor(conversation.otherUserRole)}`}
                                                        >
                                                            {getRoleText(conversation.otherUserRole)}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {conversation.lastMessageContent}
                                                    </p>

                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {getRelativeTime(conversation.lastMessageAt)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {conversation.messageCount} mesaj
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}