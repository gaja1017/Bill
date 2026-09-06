/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    // In production (Hugging Face), proxy to local backend
    // In development, use NEXT_PUBLIC_API_URL or default to localhost:8001
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
