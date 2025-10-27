"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Package, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import adminService, { AdminDashboardStats } from "@/services/adminService";
import UserManagementTab from "./UserManagementTab";
import LoadManagementTab from "./LoadManagementTab";
import SystemSettingsTab from "./SystemSettingsTab";
import DeliveryManagementTab from "./DeliveryManagementTab";
import MessagesTab from "./MessagesTab";

export default function AdminDashboard() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchStats();
        }
    }, [user]);

    if (isLoading || loadingStats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    <p className="text-green-600 font-medium">{t("dashboard.page.loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="flex h-[calc(100vh-4rem)]">
                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">{t("adminPage.title")}</h1>
                            <p className="text-gray-600">{t("adminPage.description")}</p>
                        </div>

                        {/* Statistics Overview */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    icon={<Users className="h-6 w-6" />}
                                    title={t("adminPage.totalUsers")}
                                    value={stats.totalUsers}
                                    color="green"
                                    subtitle={`+${stats.newUsersThisMonth} ${t("adminPage.thisMonth")}`}
                                />
                                <StatCard
                                    icon={<Package className="h-6 w-6" />}
                                    title={t("adminPage.totalLoads")}
                                    value={stats.totalLoads}
                                    color="blue"
                                    subtitle={`+${stats.newLoadsThisMonth} ${t("adminPage.thisMonth")}`}
                                />
                                <StatCard
                                    icon={<TrendingUp className="h-6 w-6" />}
                                    title={t("adminPage.totalRevenue")}
                                    value={`$${stats.totalRevenue.toLocaleString()}`}
                                    color="purple"
                                    subtitle={t("adminPage.fromAcceptedOffers")}
                                />
                                <StatCard
                                    icon={<Activity className="h-6 w-6" />}
                                    title={t("adminPage.pendingLoads")}
                                    value={stats.pendingLoads}
                                    color="orange"
                                    subtitle={`${stats.inTransitLoads} ${t("adminPage.inTransit")}`}
                                />
                            </div>
                        )}

                        {/* Detailed Stats Grid */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <Users className="h-5 w-5 text-green-600" />
                                            {t("adminPage.userBreakdown")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.senders")}</span>
                                            <span className="font-semibold">{stats.activeSenders}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.carriers")}</span>
                                            <span className="font-semibold">{stats.activeCarriers}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.brokers")}</span>
                                            <span className="font-semibold">{stats.activeBrokers}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <Package className="h-5 w-5 text-blue-600" />
                                            {t("adminPage.loadStatus")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.pending")}</span>
                                            <span className="font-semibold text-orange-600">{stats.pendingLoads}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.inTransit")}</span>
                                            <span className="font-semibold text-blue-600">{stats.inTransitLoads}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.completed")}</span>
                                            <span className="font-semibold text-green-600">{stats.completedLoads}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-purple-600" />
                                            {t("adminPage.offerStatus")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.pending")}</span>
                                            <span className="font-semibold text-orange-600">{stats.pendingOffers}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.accepted")}</span>
                                            <span className="font-semibold text-green-600">{stats.acceptedOffers}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t("adminPage.rejected")}</span>
                                            <span className="font-semibold text-red-600">{stats.rejectedOffers}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Management Tabs */}
                        <Tabs defaultValue="users" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-6">
                                <TabsTrigger value="users">{t("adminPage.userManagement")}</TabsTrigger>
                                <TabsTrigger value="loads">{t("adminPage.loadManagement")}</TabsTrigger>
                                <TabsTrigger value="deliveries">Teslimat Yönetimi</TabsTrigger>
                                <TabsTrigger value="messages">Mesajlar</TabsTrigger>
                                <TabsTrigger value="settings">{t("adminPage.systemSettings")}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="users">
                                <UserManagementTab />
                            </TabsContent>

                            <TabsContent value="loads">
                                <LoadManagementTab />
                            </TabsContent>

                            <TabsContent value="deliveries">
                                <DeliveryManagementTab />
                            </TabsContent>

                            <TabsContent value="messages">
                                <MessagesTab />
                            </TabsContent>

                            <TabsContent value="settings">
                                <SystemSettingsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    color: 'green' | 'blue' | 'purple' | 'orange';
    subtitle?: string;
}

function StatCard({ icon, title, value, color, subtitle }: StatCardProps) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{title}</p>
                        <h3 className="text-3xl font-bold mb-1">{value}</h3>
                        {subtitle && (
                            <p className="text-xs text-gray-500">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
