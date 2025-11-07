"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Search,
    Loader2,
    User,
    Package,
    Clock,
    Mail,
    RefreshCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import messageService, { ConversationResponse } from '@/services/messageService';
import { formatDate } from '@/utils/dateUtils';

export default function MessagesTab() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user?.id) {
            loadConversations();
            loadUnreadCount();
        }
    }, [user?.id]);

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
            case 'CARRIER':
                return 'bg-purple-100 text-purple-800';
            case 'BROKER':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'SENDER':
                return 'Gönderici';
            case 'CARRIER':
                return 'Taşıyıcı';
            case 'BROKER':
                return 'Broker';
            default:
                return role;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Mesajlar
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="bg-red-500 ml-2">
                                <Mail className="h-3 w-3 mr-1" />
                                {unreadCount} okunmamış
                            </Badge>
                        )}
                    </CardTitle>
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
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Konuşmaları ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Conversations */}
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
                                    Kullanıcılar size mesaj gönderdiğinde burada görünecek
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredConversations.map((conversation) => (
                            <div
                                key={`${conversation.loadId}-${conversation.otherUserId}`}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
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
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
