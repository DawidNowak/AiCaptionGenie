/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // Add path alias resolution to ensure @/ imports work in Vercel
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

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
