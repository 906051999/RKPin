import * as cheerio from 'cheerio';

export async function parseWeibo(message) {
  const $ = cheerio.load(message.rawHtml);
  const link = $('.tgme_widget_message_link_preview').attr('href');
  const title = $('.link_preview_title').text().trim();
  const previewDescription = $('.link_preview_description').html();

  return {
    link,
    title,
    previewDescription
  };
}
