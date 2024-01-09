const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com' ,'avatars.githubusercontent.com', 'localhost'],
},
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  }
}

module.exports = nextConfig
