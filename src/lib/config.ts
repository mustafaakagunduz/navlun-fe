// src/lib/config.ts
export const config = {
    // Environment bilgileri
    env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === 'development',
    isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',

    // API ayarları
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
        timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000'),
    },

    // Site ayarları
    site: {
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        name: 'EkoTransport',
        description: 'Navlun ve Kargo Takip Sistemi'
    },

    // Feature flags
    features: {
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
        debug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
        mockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
    },

    // Security
    security: {
        recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    },

    // Logging
    logging: {
        level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    },

    // CDN (gerekirse)
    cdn: {
        url: process.env.NEXT_PUBLIC_CDN_URL || '',
    }
};

// Environment kontrolü için helper functions
export const isDev = () => config.isDevelopment;
export const isProd = () => config.isProduction;

// Console log helper (sadece development'da loglar)
export const devLog = (...args: any[]) => {
    if (config.isDevelopment && config.features.debug) {
        console.log(...args);
    }
};

export const devError = (...args: any[]) => {
    if (config.isDevelopment) {
        console.error(...args);
    }
};

// API URL helper
export const getApiUrl = (endpoint?: string) => {
    const baseUrl = config.api.baseUrl;
    return endpoint ? `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}` : baseUrl;
};