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
    RefreshCcw,
    Mail
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from '@/hooks/use-toast';
import messageService, { ConversationResponse } from '@/services/messageService';

export default function MessagesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const { toast } = useToast();

    // State
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

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

    const loadUnreadCount = async () => {
        try {
            const count = await messageService.getUnreadCount(user!.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Okunmamış sayı yüklenirken hata:', error);
        }
    };

    const handleConversationClick = (loadId: string, otherUserId: string) => {
        router.push(`/dashboard/messages/load/${loadId}?otherUserId=${otherUserId}`);
    };

    const handleRefresh = () => {
        loadConversations();
        loadUnreadCount();
    };

    const formatDate = (dateString: string) => {
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
            return date.toLocaleDateString('tr-TR');
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
                                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleConversationClick(conversation.loadId, conversation.otherUserId)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <span className="font-semibold text-gray-900">
                                                        {conversation.loadTitle}
                                                    </span>
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            {conversation.unreadCount} yeni
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">
                                                        {conversation.otherUserName}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
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
                                                        {formatDate(conversation.lastMessageAt)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {conversation.messageCount} mesaj
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