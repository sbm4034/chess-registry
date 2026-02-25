import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wrkbecdjmehklugtcpyt.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    qualities: [70, 75],
  },
};

export default nextConfig;