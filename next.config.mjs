/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  swcMinify: true, // Enable SWC minification for faster builds and smaller bundles
  compress: true, // Enable gzip compression

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"], // Modern image formats for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon sizes
  },

  // Bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Remove Node.js modules from client bundle
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Disable powered by header for security
  poweredByHeader: false,
};

export default nextConfig;
