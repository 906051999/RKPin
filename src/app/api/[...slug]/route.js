import { getChannelContent } from '@/lib/get/getChannelContent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying fetch, attempts left: ${retries - 1}`);
      return await fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);

  if (slug[0] === 'refresh' || slug[0] === 'content') {
    const before = searchParams.get('before') || '';
    const { content: newContent, isComplete } = await getChannelContent(console.log, before);
    return Response.json({ content: newContent, isComplete });
  } else if (slug[0] === 'image') {
    const imageUrl = searchParams.get('url');
    if (!imageUrl) {
      return new Response('Missing image URL', { status: 400 });
    }

    try {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      const fetchOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': new URL(imageUrl).origin,
        },
        ...(proxyUrl ? { agent: new HttpsProxyAgent(proxyUrl) } : {}),
        timeout: 10000,
      };

      const imageResponse = await fetchWithRetry(imageUrl, fetchOptions);
      
      if (!imageResponse.ok) {
        throw new Error(`HTTP error! status: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.buffer();
      const headers = new Headers(imageResponse.headers);
      headers.set('Content-Type', imageResponse.headers.get('Content-Type') || 'image/jpeg');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return new Response(imageBuffer, { headers, status: imageResponse.status });
    } catch (error) {
      console.error('Error fetching image:', error);
      return new Response(`Error fetching image: ${error.message}`, { status: 500 });
    }
  }

  return new Response('Invalid route', { status: 400 });
}
