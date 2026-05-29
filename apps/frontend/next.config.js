/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — used by the backend upload service
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Backend deployment domain
      {
        protocol: 'https',
        hostname: 'solanova-tech-10.onrender.com',
        pathname: '/**',
      },
      // Allow localhost for local dev / seeded images
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
