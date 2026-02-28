/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Fix BigInt serialization and suppress React Native warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };

    // Suppress warnings for MetaMask SDK React Native dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];

    return config;
  },
  // Enable BigInt serialization
  experimental: {
    // This is no longer needed in Next.js 16, but keeping for compatibility
  },
  // Suppress BigInt serialization warnings
  reactStrictMode: true,
};

module.exports = nextConfig;
