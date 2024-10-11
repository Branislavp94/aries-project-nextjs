const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'localhost',
      'https://4981-93-86-62-95.ngrok-free.app',
      'SOURCE_IMAGE_DOMAIN',
    ],
  },
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    GIPHY_API: process.env.GIPHY_API,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
