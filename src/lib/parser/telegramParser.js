import * as cheerio from 'cheerio';

export async function parseTelegram(message) {
  const $ = cheerio.load(message.rawHtml);
  const forwardFrom = $('.tgme_widget_message_forwarded_from').text().trim();
  const messageText = $('.tgme_widget_message_text').html();
  const previewImage = $('.tgme_widget_message_photo_wrap, .tgme_widget_message_video_thumb').css('background-image')?.replace(/^url\(['"](.+)['"]\)$/, '$1') || null;

  return {
    forwardFrom,
    message: messageText,
    previewImage
  };
}
