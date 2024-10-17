/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    TELEGRAM_CHANNEL_URL: process.env.TELEGRAM_CHANNEL_URL,
    TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    HTTP_PROXY: process.env.HTTP_PROXY,
    HTTPS_PROXY: process.env.HTTPS_PROXY,
    LLM_API_KEY: process.env.LLM_API_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: ['https-proxy-agent', 'cheerio'],
  },
  logging: {
    level: 'verbose',
  },
  images: {
    domains: [
      'cdn1.cdn-telegram.org',
      'cdn2.cdn-telegram.org',
      'cdn3.cdn-telegram.org',
      'cdn4.cdn-telegram.org',
      'cdn5.cdn-telegram.org',
      'i0.hdslb.com',
      // 添加其他可能的 CDN 域名
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:channelName',
        destination: '/',
      },
    ];
  },
}

export default nextConfig;
