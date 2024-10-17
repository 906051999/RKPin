import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { parseFactory } from '../parser/parserFactory';

const CHANNEL_URL = process.env.TELEGRAM_CHANNEL_URL;
const PROXY_URL = process.env.HTTPS_PROXY;
const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'parsed_content.json');

async function fetchHtml(url, updateStatus) {
  return new Promise((resolve, reject) => {
    updateStatus('开始请求频道内容...');
    const agent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : undefined;
    const options = {
      agent,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://t.me/',
      }
    };

    updateStatus(`使用代理: ${PROXY_URL ? '是' : '否'}`);

    https.get(url, options, (res) => {
      updateStatus(`收到响应，状态码: ${res.statusCode}`);
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP 状态码: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
        updateStatus(`接收数据中...（${data.length} 字节）`);
      });
      res.on('end', () => resolve(data));
    }).on('error', reject)
      .on('timeout', () => reject(new Error('请求超时')));
  });
}

async function parseMessage($, element, updateStatus, channelName) {
  try {
    const $message = $(element);
    updateStatus(`开始解析消息: ${$message.attr('class')}`);
    
    const dataPost = $message.find('.tgme_widget_message').attr('data-post');
    if (!dataPost) {
      updateStatus(`警告: 消息元素没有 data-post 属性`);
      updateStatus(`消息HTML: ${$message.html()}`);
      return null; // 跳过这个消息
    }
    
    const messageId = dataPost.split('/')[1];
    const uniqueId = `${channelName}.${messageId}`;
    let type = 'Telegram';
    const linkPreviewSiteName = $message.find('.link_preview_site_name').text().trim();
    
    if (linkPreviewSiteName) {
      if (['Bilibili', 'GitHub', 'Weixin Official Accounts Platform', 'Weibo'].includes(linkPreviewSiteName)) {
        type = linkPreviewSiteName === 'Weixin Official Accounts Platform' ? 'Weixin' : linkPreviewSiteName;
      } else {
        type = 'Link';
      }
    }

    const replyId = $message.find('.tgme_widget_message_reply').attr('href')?.split('/').pop() || '';
    const author = $message.find('.tgme_widget_message_owner_name').prop('outerHTML') || '';
    const date = $message.find('.tgme_widget_message_date time').attr('datetime');

    const parser = parseFactory(type);
    const parsedContent = await parser({ rawHtml: $.html(element) });

    updateStatus(`成功解析消息: ID ${uniqueId}, 类型 ${type}`);

    return {
      uniqueId,
      messageId,
      type,
      replyId,
      author,
      date,
      parsedContent
    };
  } catch (error) {
    updateStatus(`解析消息时出错: ${error.message}`);
    updateStatus(`消息HTML: ${$(element).html()}`);
    return null; // 跳过这个消息
  }
}

export async function getChannelContent(updateStatus = console.log, before = '', channelUrl = process.env.TELEGRAM_CHANNEL_URL) {
  try {
    const url = before ? `${channelUrl}?before=${before}` : channelUrl;
    const html = await fetchHtml(url, updateStatus);
    updateStatus('数据接收完成，开始解析...');
    const $ = cheerio.load(html);
    const messages = $('.tgme_widget_message_wrap');

    updateStatus(`找到的消息包装器数量: ${messages.length}`);

    if (messages.length === 0) {
      updateStatus(`警告: 没有找到任何消息。页面HTML: ${$.html()}`);
    }

    const channelName = new URL(channelUrl).pathname.split('/')[2];
    
    const parsedMessages = await Promise.all(
      messages.map((_, element) => parseMessage($, element, updateStatus, channelName)).get()
    );

    const validMessages = parsedMessages.filter(msg => msg !== null);

    updateStatus(`成功解析的消息数量: ${validMessages.length}`);

    // 检查是否存在 messageId 为 1 的内容
    const isComplete = validMessages.some(msg => msg.messageId === '1');

    return { content: validMessages, isComplete };
  } catch (error) {
    updateStatus(`获取频道内容出错: ${error.message}`);
    throw error;
  }
}
