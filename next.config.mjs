/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep heavy Node-only parsers out of the bundle (they use fs/Buffer and
  // ship their own dynamic requires).
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
};

export default nextConfig;
