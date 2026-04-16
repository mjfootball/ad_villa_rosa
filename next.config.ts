import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",   // demo / placeholders
      "res.cloudinary.com",    // production uploads
    ],
  },
};

export default nextConfig;