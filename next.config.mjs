/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TELEGRAM_CHANNEL_URL: process.env.TELEGRAM_CHANNEL_URL,
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    HTTP_PROXY: process.env.HTTP_PROXY,
    HTTPS_PROXY: process.env.HTTPS_PROXY,
  },
  experimental: {
    serverComponentsExternalPackages: ['https-proxy-agent', 'cheerio'],
  },
}

export default nextConfig;