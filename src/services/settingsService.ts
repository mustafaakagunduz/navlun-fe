// src/services/settingsService.ts
import apiService from '@/services/apiService';

// Tip tanımlamaları
export type UserPreferences = {
    language: string;
    theme: 'light' | 'dark' | 'system';
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    dashboard: {
        defaultView: 'summary' | 'activity' | 'analytics';
        widgets: string[];
        refreshInterval: number;
    };
    emailSettings: {
        receiveNewOffers: boolean;
        receiveStatusUpdates: boolean;
        receiveMarketingEmails: boolean;
        receiveNewsletters: boolean;
    };
    displaySettings: {
        timezone: string;
        dateFormat: string;
        timeFormat: '12h' | '24h';
        currency: string;
        distanceUnit: 'km' | 'mile';
        weightUnit: 'kg' | 'lb';
    };
};

export type AppSettings = {
    maintenanceMode: boolean;
    version: string;
    availableLanguages: string[];
    defaultLanguage: string;
    features: {
        enableEcoFriendly: boolean;
        enableInsurance: boolean;
        enableRatings: boolean;
        enableChat: boolean;
    };
    securitySettings: {
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireDigit: boolean;
            requireSpecialChar: boolean;
        };
        sessionTimeout: number;  // dakika cinsinden
        maxLoginAttempts: number;
    };
    limits: {
        maxFileSize: number;  // MB cinsinden
        maxFilesPerVehicle: number;
        maxOffersPerLoad: number;
    };
};

export type NotificationChannelSettings = {
    email: {
        enabled: boolean;
        from: string;
        replyTo: string;
        footerText: string;
        logo: string;
    };
    push: {
        enabled: boolean;
        icon: string;
    };
    sms: {
        enabled: boolean;
        sender: string;
    };
};

const settingsService = {
    // Kullanıcı tercihlerini getirir
    getUserPreferences: async (): Promise<UserPreferences> => {
        try {
            return await apiService.get<UserPreferences>('/settings/user-preferences');
        } catch (error) {
            console.error('Get user preferences error:', error);
            throw error;
        }
    },

    // Kullanıcı tercihlerini günceller
    updateUserPreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
        try {
            return await apiService.put<UserPreferences, Partial<UserPreferences>>(
                '/settings/user-preferences',
                preferences
            );
        } catch (error) {
            console.error('Update user preferences error:', error);
            throw error;
        }
    },

    // Kullanıcı bildirim tercihlerini günceller
    updateNotificationPreferences: async (
        notificationSettings: UserPreferences['notifications']
    ): Promise<UserPreferences['notifications']> => {
        try {
            return await apiService.patch<UserPreferences['notifications'], UserPreferences['notifications']>(
                '/settings/notification-preferences',
                notificationSettings
            );
        } catch (error) {
            console.error('Update notification preferences error:', error);
            throw error;
        }
    },

    // Kullanıcı görüntüleme tercihlerini günceller
    updateDisplaySettings: async (
        displaySettings: UserPreferences['displaySettings']
    ): Promise<UserPreferences['displaySettings']> => {
        try {
            return await apiService.patch<UserPreferences['displaySettings'], UserPreferences['displaySettings']>(
                '/settings/display-settings',
                displaySettings
            );
        } catch (error) {
            console.error('Update display settings error:', error);
            throw error;
        }
    },

    // Kullanıcı dashboard tercihlerini günceller
    updateDashboardSettings: async (
        dashboardSettings: UserPreferences['dashboard']
    ): Promise<UserPreferences['dashboard']> => {
        try {
            return await apiService.patch<UserPreferences['dashboard'], UserPreferences['dashboard']>(
                '/settings/dashboard-settings',
                dashboardSettings
            );
        } catch (error) {
            console.error('Update dashboard settings error:', error);
            throw error;
        }
    },

    // Kullanıcı tercihlerini varsayılana sıfırlar
    resetUserPreferences: async (): Promise<UserPreferences> => {
        try {
            return await apiService.post<UserPreferences>('/settings/reset-preferences', {});
        } catch (error) {
            console.error('Reset user preferences error:', error);
            throw error;
        }
    },

    // Uygulama ayarlarını getirir (Yalnızca yöneticiler)
    getAppSettings: async (): Promise<AppSettings> => {
        try {
            return await apiService.get<AppSettings>('/settings/app-settings');
        } catch (error) {
            console.error('Get app settings error:', error);
            throw error;
        }
    },

    // Uygulama ayarlarını günceller (Yalnızca yöneticiler)
    updateAppSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
        try {
            return await apiService.put<AppSettings, Partial<AppSettings>>(
                '/settings/app-settings',
                settings
            );
        } catch (error) {
            console.error('Update app settings error:', error);
            throw error;
        }
    },

    // Uygulama özelliklerini günceller (Yalnızca yöneticiler)
    updateFeatures: async (
        features: AppSettings['features']
    ): Promise<AppSettings['features']> => {
        try {
            return await apiService.patch<AppSettings['features'], AppSettings['features']>(
                '/settings/features',
                features
            );
        } catch (error) {
            console.error('Update features error:', error);
            throw error;
        }
    },

    // Güvenlik ayarlarını günceller (Yalnızca yöneticiler)
    updateSecuritySettings: async (
        securitySettings: AppSettings['securitySettings']
    ): Promise<AppSettings['securitySettings']> => {
        try {
            return await apiService.patch<AppSettings['securitySettings'], AppSettings['securitySettings']>(
                '/settings/security-settings',
                securitySettings
            );
        } catch (error) {
            console.error('Update security settings error:', error);
            throw error;
        }
    },

    // Sistem limitlerini günceller (Yalnızca yöneticiler)
    updateLimits: async (
        limits: AppSettings['limits']
    ): Promise<AppSettings['limits']> => {
        try {
            return await apiService.patch<AppSettings['limits'], AppSettings['limits']>(
                '/settings/limits',
                limits
            );
        } catch (error) {
            console.error('Update limits error:', error);
            throw error;
        }
    },

    // Sistem durumunu getirir
    getSystemStatus: async (): Promise<{
        status: 'operational' | 'degraded' | 'maintenance' | 'outage';
        message?: string;
        services: Record<string, 'up' | 'down' | 'degraded'>;
        lastUpdated: string;
    }> => {
        try {
            return await apiService.get('/settings/system-status');
        } catch (error) {
            console.error('Get system status error:', error);
            throw error;
        }
    },

    // Sistem dillerini getirir
    getAvailableLanguages: async (): Promise<{ code: string; name: string; nativeName: string }[]> => {
        try {
            return await apiService.get('/settings/languages');
        } catch (error) {
            console.error('Get available languages error:', error);
            throw error;
        }
    },

    // Sistem zaman dilimlerini getirir
    getAvailableTimezones: async (): Promise<{ value: string; label: string; offset: string }[]> => {
        try {
            return await apiService.get('/settings/timezones');
        } catch (error) {
            console.error('Get available timezones error:', error);
            throw error;
        }
    },

    // Sistem para birimlerini getirir
    getAvailableCurrencies: async (): Promise<{ code: string; name: string; symbol: string }[]> => {
        try {
            return await apiService.get('/settings/currencies');
        } catch (error) {
            console.error('Get available currencies error:', error);
            throw error;
        }
    },

    // Kullanılabilir kullanıcı temaları getirir
    getAvailableThemes: async (): Promise<{ id: string; name: string; preview: string }[]> => {
        try {
            return await apiService.get('/settings/themes');
        } catch (error) {
            console.error('Get available themes error:', error);
            throw error;
        }
    },

    // Bildirim kanallarını yapılandırır (Yalnızca yöneticiler)
    configureNotificationChannels: async (
        channelSettings: NotificationChannelSettings
    ): Promise<NotificationChannelSettings> => {
        try {
            return await apiService.put<NotificationChannelSettings, NotificationChannelSettings>(
                '/settings/notification-channels',
                channelSettings
            );
        } catch (error) {
            console.error('Configure notification channels error:', error);
            throw error;
        }
    },

    // Sistem bilgilerini getirir
    getSystemInfo: async (): Promise<{
        version: string;
        buildDate: string;
        serverTime: string;
        environment: string;
        totalUsers: number;
        totalLoads: number;
        totalOffers: number;
        uptime: string;
    }> => {
        try {
            return await apiService.get('/settings/system-info');
        } catch (error) {
            console.error('Get system info error:', error);
            throw error;
        }
    }
};

export default settingsService;