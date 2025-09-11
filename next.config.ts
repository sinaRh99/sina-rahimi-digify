import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // I'm passing api images host to known hosts because next.js requires that for remote images when using next/image component
  // More about this: https://nextjs.org/docs/basic-features/image-optimization#remote-patterns
  images: {
    remotePatterns: [
      {
        hostname: 'flagcdn.com',
      },
      {
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
};

export default nextConfig;
