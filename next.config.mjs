const nextConfig = {
  agentRules: false,
  async headers() {
    return [
      {
        // Model filename isn't content-hashed: cache for a week, then revalidate.
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
