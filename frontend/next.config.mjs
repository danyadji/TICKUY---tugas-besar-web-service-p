/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi untuk performa lebih cepat
  reactStrictMode: true,
  
  // Hilangkan warning lockfiles
  outputFileTracingRoot: undefined,
  
  // Compiler options untuk speed
  compiler: {
    removeConsole: false,
  },
  
  // Experimental features untuk performa
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Development optimization
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // Reduce memory usage
    config.optimization = {
      ...config.optimization,
      minimize: !dev,
    }
    
    return config
  },
}

export default nextConfig
