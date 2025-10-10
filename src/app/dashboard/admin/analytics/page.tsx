"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    DollarSign,
    Activity,
    BarChart3,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from "lucide-react";
import adminService, { AdminDashboardStats } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminAnalyticsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<string>('month');

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch analytics data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateGrowthRate = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const exportData = () => {
        if (!stats) return;

        const data = {
            generatedAt: new Date().toISOString(),
            timeRange,
            statistics: stats
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Success",
            description: "Analytics data exported successfully"
        });
    };

    const GrowthIndicator = ({ value }: { value: number }) => {
        if (value > 0) {
            return (
                <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm font-medium">+{value.toFixed(1)}%</span>
                </div>
            );
        } else if (value < 0) {
            return (
                <div className="flex items-center gap-1 text-red-600">
                    <ArrowDownRight className="h-4 w-4" />
                    <span className="text-sm font-medium">{value.toFixed(1)}%</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1 text-gray-600">
                <Minus className="h-4 w-4" />
                <span className="text-sm font-medium">0%</span>
            </div>
        );
    };

    const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
        const percentage = (value / max) * 100;
        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        );
    };

    if (authLoading || loading) {
        return (
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            </ProtectedRoute>
        );
    }

    if (!stats) {
        return (
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-gray-500">No analytics data available</p>
                </div>
            </ProtectedRoute>
        );
    }

    // Mock growth data (in real app, this would come from backend)
    const userGrowth = calculateGrowthRate(stats.newUsersThisMonth, Math.floor(stats.newUsersThisMonth * 0.8));
    const loadGrowth = calculateGrowthRate(stats.newLoadsThisMonth, Math.floor(stats.newLoadsThisMonth * 0.7));
    const revenueGrowth = calculateGrowthRate(Number(stats.totalRevenue), Number(stats.totalRevenue) * 0.85);

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/dashboard/admin')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <BarChart3 className="h-8 w-8 text-green-600" />
                                    Analytics & Insights
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Comprehensive platform analytics and performance metrics
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-40">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Last Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="quarter">This Quarter</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={exportData} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 font-medium">Total Users</p>
                                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                                        <GrowthIndicator value={userGrowth} />
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">
                                        +{stats.newUsersThisMonth} new this month
                                    </p>
                                    <ProgressBar
                                        value={stats.newUsersThisMonth}
                                        max={stats.totalUsers}
                                        color="bg-blue-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 font-medium">Total Loads</p>
                                        <p className="text-3xl font-bold">{stats.totalLoads}</p>
                                        <GrowthIndicator value={loadGrowth} />
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Package className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">
                                        +{stats.newLoadsThisMonth} new this month
                                    </p>
                                    <ProgressBar
                                        value={stats.newLoadsThisMonth}
                                        max={stats.totalLoads}
                                        color="bg-green-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                                        <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                                        <GrowthIndicator value={revenueGrowth} />
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">
                                        From {stats.acceptedOffers} accepted offers
                                    </p>
                                    <ProgressBar
                                        value={stats.acceptedOffers}
                                        max={stats.totalOffers}
                                        color="bg-purple-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 font-medium">Active Loads</p>
                                        <p className="text-3xl font-bold">{stats.pendingLoads + stats.inTransitLoads}</p>
                                        <div className="flex items-center gap-1 text-orange-600">
                                            <Activity className="h-4 w-4" />
                                            <span className="text-sm font-medium">Active</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">
                                        {stats.completedLoads} completed
                                    </p>
                                    <ProgressBar
                                        value={stats.completedLoads}
                                        max={stats.totalLoads}
                                        color="bg-orange-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* User Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Distribution by Role</CardTitle>
                                <CardDescription>Active users categorized by their roles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-100 text-blue-800">SENDER</Badge>
                                                <span className="text-sm font-medium">{stats.activeSenders} users</span>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {((stats.activeSenders / stats.totalUsers) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            value={stats.activeSenders}
                                            max={stats.totalUsers}
                                            color="bg-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-green-100 text-green-800">CARRIER</Badge>
                                                <span className="text-sm font-medium">{stats.activeCarriers} users</span>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {((stats.activeCarriers / stats.totalUsers) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            value={stats.activeCarriers}
                                            max={stats.totalUsers}
                                            color="bg-green-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-purple-100 text-purple-800">BROKER</Badge>
                                                <span className="text-sm font-medium">{stats.activeBrokers} users</span>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {((stats.activeBrokers / stats.totalUsers) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            value={stats.activeBrokers}
                                            max={stats.totalUsers}
                                            color="bg-purple-500"
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Total Active Users</span>
                                            <span className="font-bold text-green-600">{stats.totalUsers}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Load Status Overview</CardTitle>
                                <CardDescription>Current state of all shipments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                                <span className="text-sm font-medium">Pending</span>
                                            </div>
                                            <span className="text-sm font-bold">{stats.pendingLoads}</span>
                                        </div>
                                        <ProgressBar
                                            value={stats.pendingLoads}
                                            max={stats.totalLoads}
                                            color="bg-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                                <span className="text-sm font-medium">In Transit</span>
                                            </div>
                                            <span className="text-sm font-bold">{stats.inTransitLoads}</span>
                                        </div>
                                        <ProgressBar
                                            value={stats.inTransitLoads}
                                            max={stats.totalLoads}
                                            color="bg-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                                <span className="text-sm font-medium">Completed</span>
                                            </div>
                                            <span className="text-sm font-bold">{stats.completedLoads}</span>
                                        </div>
                                        <ProgressBar
                                            value={stats.completedLoads}
                                            max={stats.totalLoads}
                                            color="bg-green-500"
                                        />
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Completion Rate</span>
                                            <span className="font-bold text-green-600">
                                                {((stats.completedLoads / stats.totalLoads) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Offers Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Offers & Transactions</CardTitle>
                            <CardDescription>Analysis of offer activity and conversion rates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Offers</span>
                                        <Badge variant="outline">{stats.totalOffers}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold">{stats.totalOffers}</p>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gray-500" style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <Badge className="bg-orange-100 text-orange-800">{stats.pendingOffers}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">{stats.pendingOffers}</p>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500"
                                            style={{ width: `${(stats.pendingOffers / stats.totalOffers) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Accepted</span>
                                        <Badge className="bg-green-100 text-green-800">{stats.acceptedOffers}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">{stats.acceptedOffers}</p>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${(stats.acceptedOffers / stats.totalOffers) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Rejected</span>
                                        <Badge className="bg-red-100 text-red-800">{stats.rejectedOffers}</Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejectedOffers}</p>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500"
                                            style={{ width: `${(stats.rejectedOffers / stats.totalOffers) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Acceptance Rate</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {((stats.acceptedOffers / stats.totalOffers) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Rejection Rate</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {((stats.rejectedOffers / stats.totalOffers) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Avg. Revenue per Offer</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${(Number(stats.totalRevenue) / stats.acceptedOffers).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-blue-900">User Growth</h3>
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-blue-900 mb-2">
                                    +{stats.newUsersThisMonth}
                                </p>
                                <p className="text-sm text-blue-700">New users this month</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-blue-300 rounded-full" />
                                    <span className="text-xs text-blue-700 font-medium">
                                        {((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-green-900">Load Volume</h3>
                                    <Package className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-green-900 mb-2">
                                    +{stats.newLoadsThisMonth}
                                </p>
                                <p className="text-sm text-green-700">New loads this month</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-green-300 rounded-full" />
                                    <span className="text-xs text-green-700 font-medium">
                                        {((stats.newLoadsThisMonth / stats.totalLoads) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-purple-900">Platform Health</h3>
                                    <Activity className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="text-3xl font-bold text-purple-900 mb-2">
                                    {((stats.acceptedOffers / stats.totalOffers) * 100).toFixed(0)}%
                                </p>
                                <p className="text-sm text-purple-700">Offer success rate</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-purple-300 rounded-full" />
                                    <Badge className="bg-purple-200 text-purple-800">Healthy</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
