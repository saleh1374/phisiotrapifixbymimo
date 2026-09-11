/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Origin (scheme + host[:port]) of the backend API — used for connect-src.
const apiOrigin = (() => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:8000";
  }
})();

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
            // Fonts are self-hosted (@fontsource/vazirmatn) — no external font hosts needed.
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self' data:",
            "img-src 'self' data: blob: https: http://localhost:* http://127.0.0.1:*",
            // Backend API origin is build-time configurable (NEXT_PUBLIC_API_URL).
            "connect-src 'self' " + apiOrigin + " https://oauth2.googleapis.com",
            "frame-src https://accounts.google.com",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;