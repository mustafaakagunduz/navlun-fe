/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
    },

    // Production optimizations
    ...(process.env.NODE_ENV === 'production' && {
        compress: true,
        poweredByHeader: false,
        generateEtags: false,

        // Image optimization
        images: {
            domains: ['transyuk.com', 'cdn.transyuk.com'],
            formats: ['image/webp', 'image/avif'],
        },

        // Headers for security
        async headers() {
            return [
                {
                    source: '/(.*)',
                    headers: [
                        {
                            key: 'X-Frame-Options',
                            value: 'DENY',
                        },
                        {
                            key: 'X-Content-Type-Options',
                            value: 'nosniff',
                        },
                        {
                            key: 'Referrer-Policy',
                            value: 'origin-when-cross-origin',
                        },
                    ],
                },
            ];
        },
    }),

    // Development optimizations
    ...(process.env.NODE_ENV === 'development' && {
        reactStrictMode: true,
        eslint: {
            ignoreDuringBuilds: false,
        },
    }),

    // Redirects for production domain
    async redirects() {
        if (process.env.NODE_ENV === 'production') {
            return [
                {
                    source: '/home',
                    destination: '/',
                    permanent: true,
                },
            ];
        }
        return [];
    },
};

module.exports = nextConfig;