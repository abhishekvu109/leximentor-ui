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
};

export default nextConfig;
