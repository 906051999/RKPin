import * as cheerio from 'cheerio';

export async function parseTelegram(message) {
  const $ = cheerio.load(message.rawHtml);
  const forwardFrom = $('.tgme_widget_message_forwarded_from').text().trim();
  
  // 解析回复内容
  const $replyContent = $('.tgme_widget_message_reply');
  const replyContent = $replyContent.length ? $replyContent.html() : null;

  // 解析主要消息内容
  const $messageText = $('.tgme_widget_message_text.js-message_text');
  const messageText = $messageText.length ? $messageText.html() : null;

  const previewImage = $('.tgme_widget_message_photo_wrap, .tgme_widget_message_video_thumb').css('background-image')?.replace(/^url\(['"](.+)['"]\)$/, '$1') || null;

  return {
    forwardFrom,
    replyContent,
    message: messageText,
    previewImage
  };
}
