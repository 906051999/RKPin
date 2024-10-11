import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const channelUrl = 'https://t.me/s/rk_pins';
const proxyUrl = process.env.HTTPS_PROXY;

export async function getChannelContent(updateStatus, beforeId = null) {
  return new Promise((resolve, reject) => {
    updateStatus('开始请求频道内容...');
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    const options = {
      agent,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    updateStatus(`使用代理: ${proxyUrl ? '是' : '否'}`);

    let url = channelUrl;
    if (beforeId) {
      url += `?before=${beforeId}`;
    }

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

      res.on('end', async () => {
        updateStatus('数据接收完成，开始解析...');
        try {
          const $ = cheerio.load(data);
          const messages = [];

          updateStatus(`页面标题: ${$('title').text()}`);
          updateStatus(`找到的消息包装器数量: ${$('.tgme_widget_message_wrap').length}`);

          $('.tgme_widget_message_wrap').each((i, elem) => {
            const $elem = $(elem);
            const text = $elem.find('.tgme_widget_message_text').text().trim();
            const html = $elem.find('.tgme_widget_message_text').html();
            const date = $elem.find('.tgme_widget_message_date time').attr('datetime');
            const messageId = $elem.find('.tgme_widget_message').attr('data-post')?.split('/').pop();
            
            updateStatus(`消息 ${i + 1}: 文本长度 ${text.length}, 日期 ${date}, ID ${messageId}`);

            if (text || html) {
              messages.push({ 
                text, 
                html,
                date, 
                messageId,
                rawHtml: $elem.html() // 添加原始HTML
              });
            }
          });

          messages.sort((a, b) => b.messageId - a.messageId); // 倒序排列消息

          // 保存到 JSON 文件
          const jsonPath = path.join(process.cwd(), 'public', 'channel_content.json');
          let existingData = [];
          try {
            const fileContent = await fs.readFile(jsonPath, 'utf-8');
            existingData = JSON.parse(fileContent);
          } catch (err) {
            // 文件不存在或解析错误，使用空数组
          }

          // 合并新消息并去重
          const mergedData = [...existingData, ...messages];
          const uniqueData = Array.from(new Map(mergedData.map(item => [item.messageId, item])).values());

          await fs.writeFile(jsonPath, JSON.stringify(uniqueData, null, 2));

          updateStatus(`解析完成，共获取 ${messages.length} 条消息，保存到文件`);
          resolve(messages);
        } catch (error) {
          updateStatus(`解析出错: ${error.message}`);
          reject(error);
        }
      });
    }).on('error', (err) => {
      updateStatus(`请求出错: ${err.message}`);
      reject(err);
    }).on('timeout', () => {
      updateStatus('请求超时');
      reject(new Error('请求超时'));
    });
  });
}
