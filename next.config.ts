import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.json$/,
            loader: 'json-loader',
            type: 'javascript/auto',
        });
        return config;
    },
    /* diğer config ayarları buraya */
};

export default nextConfig;