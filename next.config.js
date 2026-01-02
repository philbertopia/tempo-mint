/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude Hardhat files from webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore Hardhat config and scripts completely
    config.module.rules.push({
      test: /(hardhat\.config\.(js|ts)|scripts\/.*\.(js|ts))$/,
      use: 'ignore-loader',
    });
    
    return config;
  },
}

module.exports = nextConfig
