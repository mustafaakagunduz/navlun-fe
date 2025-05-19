// src/components/dashboard/sender/SenderDashboardStats.tsx
"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import dashboardService from '@/services/dashboardService';

export default function SenderDashboardStats() {
    const [stats, setStats] = useState({
        totalLoads: 0,
        activeLoads: 0,
        completedLoads: 0,
        ecoFriendlyShipments: 0,
        ecoFriendlyRatio: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getSenderDashboardSummary();
                setStats(data);
            } catch (error) {
                console.error('İstatistikler yüklenirken hata:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div>İstatistikler yükleniyor...</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Toplam Yük</p>
                        <h2 className="text-2xl font-bold">{stats.totalLoads}</h2>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <Truck className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Aktif Yük</p>
                        <h2 className="text-2xl font-bold">{stats.activeLoads}</h2>
                    </div>
                </CardContent>
            </Card>

            {/* Diğer istatistik kartları */}
        </div>
    );
}