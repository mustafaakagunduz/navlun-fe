"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Loader2,
    ArrowLeft,
    Settings,
    Save,
    RotateCcw,
    Shield,
    Mail,
    Bell,
    DollarSign,
    Database,
    Lock,
    AlertTriangle,
    CheckCircle,
    Server,
    Globe,
    Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminSettingsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    // General Settings
    const [platformName, setPlatformName] = useState('Navlun Platform');
    const [platformDescription, setPlatformDescription] = useState('Freight and logistics management');
    const [supportEmail, setSupportEmail] = useState('support@navlun.com');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistration, setAllowRegistration] = useState(true);

    // Email Settings
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
    const [smtpPort, setSmtpPort] = useState('587');
    const [smtpUsername, setSmtpUsername] = useState('');
    const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);

    // Security Settings
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [passwordMinLength, setPasswordMinLength] = useState('8');
    const [sessionTimeout, setSessionTimeout] = useState('24');
    const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
    const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);

    // Platform Limits
    const [maxLoadPerUser, setMaxLoadPerUser] = useState('1000');
    const [maxFileSize, setMaxFileSize] = useState('10');
    const [maxOffersPerLoad, setMaxOffersPerLoad] = useState('50');
    const [dataRetentionDays, setDataRetentionDays] = useState('365');

    // Payment Settings
    const [paymentEnabled, setPaymentEnabled] = useState(true);
    const [currency, setCurrency] = useState('USD');
    const [platformFeePercentage, setPlatformFeePercentage] = useState('5');
    const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);

    // Notification Settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [notifyAdminOnNewUser, setNotifyAdminOnNewUser] = useState(true);
    const [notifyAdminOnNewLoad, setNotifyAdminOnNewLoad] = useState(false);

    // Logging Settings
    const [loggingEnabled, setLoggingEnabled] = useState(true);
    const [logLevel, setLogLevel] = useState('INFO');
    const [logRetentionDays, setLogRetentionDays] = useState('90');
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // In real app, this would save to backend
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Success",
                description: "Settings saved successfully"
            });
            setHasChanges(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSettings = () => {
        // Reset to defaults
        setPlatformName('Navlun Platform');
        setPlatformDescription('Freight and logistics management');
        setSupportEmail('support@navlun.com');
        setMaintenanceMode(false);
        setAllowRegistration(true);

        setResetDialogOpen(false);
        toast({
            title: "Settings Reset",
            description: "All settings have been reset to defaults"
        });
    };

    if (authLoading) {
        return (
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            </ProtectedRoute>
        );
    }

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
                                    <Settings className="h-8 w-8 text-green-600" />
                                    System Settings
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Configure and manage platform settings
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setResetDialogOpen(true)}
                                disabled={loading}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset to Defaults
                            </Button>
                            <Button
                                onClick={handleSaveSettings}
                                disabled={loading || !hasChanges}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {/* Status Banner */}
                    {maintenanceMode && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="font-semibold text-orange-900">Maintenance Mode Active</p>
                                <p className="text-sm text-orange-700">The platform is currently in maintenance mode. Users cannot access the system.</p>
                            </div>
                        </div>
                    )}

                    {hasChanges && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-blue-600" />
                                <p className="text-sm text-blue-900">You have unsaved changes</p>
                            </div>
                            <Button size="sm" onClick={handleSaveSettings}>
                                Save Now
                            </Button>
                        </div>
                    )}

                    {/* Settings Tabs */}
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-7">
                            <TabsTrigger value="general">
                                <Globe className="h-4 w-4 mr-2" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="email">
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="security">
                                <Shield className="h-4 w-4 mr-2" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="limits">
                                <Database className="h-4 w-4 mr-2" />
                                Limits
                            </TabsTrigger>
                            <TabsTrigger value="payment">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Payment
                            </TabsTrigger>
                            <TabsTrigger value="notifications">
                                <Bell className="h-4 w-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="logs">
                                <Server className="h-4 w-4 mr-2" />
                                Logs
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Configuration</CardTitle>
                                    <CardDescription>Basic platform settings and information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="platformName">Platform Name</Label>
                                        <Input
                                            id="platformName"
                                            value={platformName}
                                            onChange={(e) => { setPlatformName(e.target.value); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="platformDescription">Platform Description</Label>
                                        <Input
                                            id="platformDescription"
                                            value={platformDescription}
                                            onChange={(e) => { setPlatformDescription(e.target.value); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supportEmail">Support Email</Label>
                                        <Input
                                            id="supportEmail"
                                            type="email"
                                            value={supportEmail}
                                            onChange={(e) => { setSupportEmail(e.target.value); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="maintenanceMode" className="text-base font-medium">
                                                Maintenance Mode
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Temporarily disable access to the platform
                                            </p>
                                        </div>
                                        <Switch
                                            id="maintenanceMode"
                                            checked={maintenanceMode}
                                            onCheckedChange={(checked) => { setMaintenanceMode(checked); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="allowRegistration" className="text-base font-medium">
                                                Allow New Registrations
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Enable or disable new user registrations
                                            </p>
                                        </div>
                                        <Switch
                                            id="allowRegistration"
                                            checked={allowRegistration}
                                            onCheckedChange={(checked) => { setAllowRegistration(checked); setHasChanges(true); }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Email Settings */}
                        <TabsContent value="email" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Configuration</CardTitle>
                                    <CardDescription>Configure email server and notification settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="emailEnabled" className="text-base font-medium">
                                                Email Service
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Enable or disable email functionality
                                            </p>
                                        </div>
                                        <Switch
                                            id="emailEnabled"
                                            checked={emailEnabled}
                                            onCheckedChange={(checked) => { setEmailEnabled(checked); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="smtpHost">SMTP Host</Label>
                                            <Input
                                                id="smtpHost"
                                                value={smtpHost}
                                                onChange={(e) => { setSmtpHost(e.target.value); setHasChanges(true); }}
                                                disabled={!emailEnabled}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="smtpPort">SMTP Port</Label>
                                            <Input
                                                id="smtpPort"
                                                value={smtpPort}
                                                onChange={(e) => { setSmtpPort(e.target.value); setHasChanges(true); }}
                                                disabled={!emailEnabled}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                                        <Input
                                            id="smtpUsername"
                                            value={smtpUsername}
                                            onChange={(e) => { setSmtpUsername(e.target.value); setHasChanges(true); }}
                                            disabled={!emailEnabled}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="emailVerificationRequired" className="text-base font-medium">
                                                Email Verification Required
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Require users to verify their email address
                                            </p>
                                        </div>
                                        <Switch
                                            id="emailVerificationRequired"
                                            checked={emailVerificationRequired}
                                            onCheckedChange={(checked) => { setEmailVerificationRequired(checked); setHasChanges(true); }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Configuration</CardTitle>
                                    <CardDescription>Manage security and authentication settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="twoFactorEnabled" className="text-base font-medium">
                                                Two-Factor Authentication
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Require 2FA for all admin accounts
                                            </p>
                                        </div>
                                        <Switch
                                            id="twoFactorEnabled"
                                            checked={twoFactorEnabled}
                                            onCheckedChange={(checked) => { setTwoFactorEnabled(checked); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="passwordMinLength">Min Password Length</Label>
                                            <Input
                                                id="passwordMinLength"
                                                type="number"
                                                value={passwordMinLength}
                                                onChange={(e) => { setPasswordMinLength(e.target.value); setHasChanges(true); }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                                            <Input
                                                id="sessionTimeout"
                                                type="number"
                                                value={sessionTimeout}
                                                onChange={(e) => { setSessionTimeout(e.target.value); setHasChanges(true); }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                        <Input
                                            id="maxLoginAttempts"
                                            type="number"
                                            value={maxLoginAttempts}
                                            onChange={(e) => { setMaxLoginAttempts(e.target.value); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="ipWhitelistEnabled" className="text-base font-medium">
                                                IP Whitelist
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Restrict admin access to specific IP addresses
                                            </p>
                                        </div>
                                        <Switch
                                            id="ipWhitelistEnabled"
                                            checked={ipWhitelistEnabled}
                                            onCheckedChange={(checked) => { setIpWhitelistEnabled(checked); setHasChanges(true); }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Platform Limits */}
                        <TabsContent value="limits" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Limits</CardTitle>
                                    <CardDescription>Set resource and usage limits</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="maxLoadPerUser">Max Loads per User</Label>
                                            <Input
                                                id="maxLoadPerUser"
                                                type="number"
                                                value={maxLoadPerUser}
                                                onChange={(e) => { setMaxLoadPerUser(e.target.value); setHasChanges(true); }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                                            <Input
                                                id="maxFileSize"
                                                type="number"
                                                value={maxFileSize}
                                                onChange={(e) => { setMaxFileSize(e.target.value); setHasChanges(true); }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="maxOffersPerLoad">Max Offers per Load</Label>
                                            <Input
                                                id="maxOffersPerLoad"
                                                type="number"
                                                value={maxOffersPerLoad}
                                                onChange={(e) => { setMaxOffersPerLoad(e.target.value); setHasChanges(true); }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                                            <Input
                                                id="dataRetentionDays"
                                                type="number"
                                                value={dataRetentionDays}
                                                onChange={(e) => { setDataRetentionDays(e.target.value); setHasChanges(true); }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payment Settings */}
                        <TabsContent value="payment" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Configuration</CardTitle>
                                    <CardDescription>Configure payment processing settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="paymentEnabled" className="text-base font-medium">
                                                Payment Processing
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Enable payment processing on the platform
                                            </p>
                                        </div>
                                        <Switch
                                            id="paymentEnabled"
                                            checked={paymentEnabled}
                                            onCheckedChange={(checked) => { setPaymentEnabled(checked); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Default Currency</Label>
                                            <Select value={currency} onValueChange={(value) => { setCurrency(value); setHasChanges(true); }}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="TRY">TRY - Turkish Lira</SelectItem>
                                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                                            <Input
                                                id="platformFeePercentage"
                                                type="number"
                                                value={platformFeePercentage}
                                                onChange={(e) => { setPlatformFeePercentage(e.target.value); setHasChanges(true); }}
                                                disabled={!paymentEnabled}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="autoPayoutEnabled" className="text-base font-medium">
                                                Automatic Payouts
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Automatically process payouts to carriers
                                            </p>
                                        </div>
                                        <Switch
                                            id="autoPayoutEnabled"
                                            checked={autoPayoutEnabled}
                                            onCheckedChange={(checked) => { setAutoPayoutEnabled(checked); setHasChanges(true); }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notification Settings */}
                        <TabsContent value="notifications" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Settings</CardTitle>
                                    <CardDescription>Configure notification channels and preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium">Email Notifications</Label>
                                                <p className="text-sm text-gray-600">Send notifications via email</p>
                                            </div>
                                            <Switch
                                                checked={emailNotifications}
                                                onCheckedChange={(checked) => { setEmailNotifications(checked); setHasChanges(true); }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium">SMS Notifications</Label>
                                                <p className="text-sm text-gray-600">Send notifications via SMS</p>
                                            </div>
                                            <Switch
                                                checked={smsNotifications}
                                                onCheckedChange={(checked) => { setSmsNotifications(checked); setHasChanges(true); }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="space-y-1">
                                                <Label className="text-base font-medium">Push Notifications</Label>
                                                <p className="text-sm text-gray-600">Send browser push notifications</p>
                                            </div>
                                            <Switch
                                                checked={pushNotifications}
                                                onCheckedChange={(checked) => { setPushNotifications(checked); setHasChanges(true); }}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h4 className="font-semibold mb-4">Admin Notifications</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="space-y-1">
                                                    <Label className="text-base font-medium">New User Registration</Label>
                                                    <p className="text-sm text-gray-600">Notify when a new user registers</p>
                                                </div>
                                                <Switch
                                                    checked={notifyAdminOnNewUser}
                                                    onCheckedChange={(checked) => { setNotifyAdminOnNewUser(checked); setHasChanges(true); }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="space-y-1">
                                                    <Label className="text-base font-medium">New Load Posted</Label>
                                                    <p className="text-sm text-gray-600">Notify when a new load is posted</p>
                                                </div>
                                                <Switch
                                                    checked={notifyAdminOnNewLoad}
                                                    onCheckedChange={(checked) => { setNotifyAdminOnNewLoad(checked); setHasChanges(true); }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Logging Settings */}
                        <TabsContent value="logs" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Logging Configuration</CardTitle>
                                    <CardDescription>Configure system logging and debugging</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="loggingEnabled" className="text-base font-medium">
                                                System Logging
                                            </Label>
                                            <p className="text-sm text-gray-600">
                                                Enable or disable system logging
                                            </p>
                                        </div>
                                        <Switch
                                            id="loggingEnabled"
                                            checked={loggingEnabled}
                                            onCheckedChange={(checked) => { setLoggingEnabled(checked); setHasChanges(true); }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="logLevel">Log Level</Label>
                                            <Select value={logLevel} onValueChange={(value) => { setLogLevel(value); setHasChanges(true); }}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ERROR">ERROR - Critical errors only</SelectItem>
                                                    <SelectItem value="WARN">WARN - Warnings and errors</SelectItem>
                                                    <SelectItem value="INFO">INFO - General information</SelectItem>
                                                    <SelectItem value="DEBUG">DEBUG - Detailed debugging</SelectItem>
                                                    <SelectItem value="TRACE">TRACE - All events</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="logRetentionDays">Log Retention (days)</Label>
                                            <Input
                                                id="logRetentionDays"
                                                type="number"
                                                value={logRetentionDays}
                                                onChange={(e) => { setLogRetentionDays(e.target.value); setHasChanges(true); }}
                                                disabled={!loggingEnabled}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="space-y-1">
                                            <Label htmlFor="debugMode" className="text-base font-medium text-orange-900">
                                                Debug Mode
                                            </Label>
                                            <p className="text-sm text-orange-700">
                                                Enable verbose logging (may affect performance)
                                            </p>
                                        </div>
                                        <Switch
                                            id="debugMode"
                                            checked={debugMode}
                                            onCheckedChange={(checked) => { setDebugMode(checked); setHasChanges(true); }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Reset Confirmation Dialog */}
                <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will reset all settings to their default values. This action cannot be undone.
                                Are you sure you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetSettings}>
                                Reset Settings
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ProtectedRoute>
    );
}
