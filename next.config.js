/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "img.doodcdn.co",
            },
            {
                hostname: "placehold.co",
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },

    // Konfigurasi Header untuk Caching Bandwidth & Request
    async headers() {
        return [
            {
                // Terapkan ke semua halaman/route
                source: "/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=59",
                    },
                ],
            },
            {
                // Cache ketat untuk aset statis (_next/static) selama 1 tahun
                source: "/_next/static/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
