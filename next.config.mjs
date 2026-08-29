/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Serve images directly from their CDNs (Pexels/Unsplash already resize
    // and compress via URL params). Bypasses Vercel's image optimizer, whose
    // free quota was exhausted and made every image return 402.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "assets.mixkit.co",
      },
    ],
  },
}

export default nextConfig
