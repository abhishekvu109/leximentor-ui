/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        return [
            {
                source: '/api/proxy-auth/:path*',
                destination: 'http://192.168.1.90:31372/api/auth/v1/:path*',
            },
            {
                source: '/api/proxy-main/:path*',
                destination: 'http://192.168.1.90:31372/api/:path*',
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/cashflow',
                permanent: true,
            },
        ];
    },
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
};

export default nextConfig;
