import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    domains: [
      'wrkbecdjmehklugtcpyt.supabase.co',
    ],
    // include both configured quality options used by images
    qualities: [70, 75],
  },
};

export default nextConfig;
