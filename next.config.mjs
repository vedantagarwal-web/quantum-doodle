/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only apply these modifications for client-side bundles
    if (!isServer) {
      // Polyfill Node.js modules for browser environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        events: false,
        constants: false,
        module: false,
        process: false,
        tty: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        dns: false,
        child_process: false,
        timers: false,
        url: false,
        vm: false,
        querystring: false,
        readline: false,
        punycode: false,
        dgram: false,
        string_decoder: false,
      };
    }
    return config;
  },
  // Enable static exports for deployments
  output: 'standalone',
};

export default nextConfig; 