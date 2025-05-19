// src/app/dashboard/sender/loads/page.tsx
"use client"

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, Filter } from "lucide-react";
import loadService, { Load, LoadStatus } from '@/services/loadService';

export default function LoadsPage() {
    const [loads, setLoads] = useState<Load[]>([]);
    const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<LoadStatus | 'ALL'>('ALL');
    const [showNewLoadModal, setShowNewLoadModal] = useState(false);

    useEffect(() => {
        const fetchLoads = async () => {
            try {
                const response = await loadService.getCurrentUserLoads();
                setLoads(response.content);
                setFilteredLoads(response.content);
            } catch (error) {
                console.error('Yükler yüklenirken hata:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoads();
    }, []);

    // Filtre ve arama işlemleri
    useEffect(() => {
        let result = loads;

        // Arama filtresi
        if (searchQuery) {
            result = result.filter(load =>
                load.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                load.goodsType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Durum filtresi
        if (statusFilter !== 'ALL') {
            result = result.filter(load => load.status === statusFilter);
        }

        setFilteredLoads(result);
    }, [searchQuery, statusFilter, loads]);

    return (
        <ProtectedRoute allowedRoles={['SENDER']}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h1 className="text-3xl font-bold">Yüklerim</h1>

                    <Button
                        onClick={() => setShowNewLoadModal(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Yeni Yük Ekle
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Yük ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Tabs defaultValue="ALL" onValueChange={(value) => setStatusFilter(value as LoadStatus | 'ALL')}>
                                <TabsList>
                                    <TabsTrigger value="ALL">Tümü</TabsTrigger>
                                    <TabsTrigger value="PENDING">Bekleyen</TabsTrigger>
                                    <TabsTrigger value="ASSIGNED">Atanmış</TabsTrigger>
                                    <TabsTrigger value="IN_TRANSIT">Taşınıyor</TabsTrigger>
                                    <TabsTrigger value="DELIVERED">Teslim Edildi</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                    </CardContent>
                </Card>
            </div>


        </ProtectedRoute>
    );
}