"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Server, Database, Activity, Clock } from "lucide-react";
import adminService, { SystemHealth } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate, formatDateTime, formatTime } from '@/utils/dateUtils';

export default function SystemSettingsTab() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSystemHealth();
        // Refresh every 30 seconds
        const interval = setInterval(fetchSystemHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchSystemHealth = async () => {
        try {
            const data = await adminService.getSystemHealth();
            setHealth(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch system health",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Activity className="h-4 w-4" />
                                Status
                            </div>
                            <div className="flex items-center gap-2">
                                {health?.status === 'HEALTHY' ? (
                                    <Badge className="bg-green-100 text-green-800">
                                        {health.status}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-800">
                                        {health?.status}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Database className="h-4 w-4" />
                                Database Connections
                            </div>
                            <div className="text-2xl font-bold">
                                {health?.databaseConnections || 0}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Activity className="h-4 w-4" />
                                Active Users
                            </div>
                            <div className="text-2xl font-bold">
                                {health?.activeUsers || 0}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                Uptime
                            </div>
                            <div className="text-2xl font-bold">
                                {health?.uptime || '0h'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Usage</span>
                            <span className="font-semibold">
                                {formatBytes(health?.memoryUsage || 0)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                    width: `${Math.min(100, ((health?.memoryUsage || 0) / (1024 * 1024 * 1024)) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Platform</span>
                            <span className="font-medium">Navlun Platform</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Version</span>
                            <span className="font-medium">1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Environment</span>
                            <Badge>Production</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Last Updated</span>
                            <span className="font-medium">{formatDateTime(new Date().toISOString())}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Limits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Max Users</span>
                            <span className="font-medium">Unlimited</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Max Loads per User</span>
                            <span className="font-medium">1000</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Max File Upload Size</span>
                            <span className="font-medium">10 MB</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">Session Timeout</span>
                            <span className="font-medium">24 hours</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent System Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                            <div className="flex-1">
                                <div className="font-medium">System Health Check</div>
                                <div className="text-sm text-gray-600">All systems operational</div>
                                <div className="text-xs text-gray-400 mt-1">{formatDateTime(new Date().toISOString())}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                            <div className="flex-1">
                                <div className="font-medium">Database Backup</div>
                                <div className="text-sm text-gray-600">Scheduled backup completed successfully</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatDateTime(new Date(Date.now() - 3600000).toISOString())}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                            <div className="flex-1">
                                <div className="font-medium">System Update</div>
                                <div className="text-sm text-gray-600">Platform updated to version 1.0.0</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {formatDateTime(new Date(Date.now() - 86400000).toISOString())}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
