const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'localhost',
      'SOURCE_IMAGE_DOMAIN',
    ],
  },
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    GIPHY_API: process.env.GIPHY_API,
  },
};

module.exports = nextConfig;
